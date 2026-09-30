import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import type { FurnitureMotionStore } from '../../configurator/furnitureMotionStore'
import { bindFurnitureInteraction } from '../furniture/furnitureInteraction'
import { configureWardrobeStudio } from './wardrobeStudio'
import type { ConfiguratorStore } from '../../configurator/configuratorStore'
import type { WardrobeAssemblyConfiguration } from '../../configurator/wardrobeAssembly/state'
import type { ThreeRuntime } from '../core/createThreeRuntime'
import type { WardrobeAssembly } from './wardrobeAssembly'

export function useWardrobeAssemblyScene(runtimeRef: RefObject<ThreeRuntime | null>, anisotropyRef: RefObject<number>, store: ConfiguratorStore, enabled: boolean, configuration: WardrobeAssemblyConfiguration, motionStore: FurnitureMotionStore) {
  const active = useRef<WardrobeAssembly | null>(null)
  const [attempt, setAttempt] = useState(0)
  const token = useMemo(() => ({ enabled, attempt }), [enabled, attempt])
  const [status, setStatus] = useState<{ token: object; configuration?: WardrobeAssemblyConfiguration; error: string | null; reload?: boolean } | null>(null)
  useEffect(() => {
    const runtime = runtimeRef.current
    if (!enabled || !runtime) return
    let cancelled = false, assembly: WardrobeAssembly | null = null
    const restoreStudio = configureWardrobeStudio(runtime.scene)
    let binding: ReturnType<FurnitureMotionStore['attach']> | undefined
    let stopFrames: (() => void) | undefined, stopInteraction: (() => void) | undefined, stopPreference: (() => void) | undefined
    let stopCamera: (() => void) | undefined
    const detach = () => { stopCamera?.(); stopInteraction?.(); stopFrames?.(); stopPreference?.(); binding?.detach() }
    let moduleLoaded = false
    const prepare = async () => {
      try {
        const { createWardrobeAssembly } = await import('./wardrobeAssembly')
        moduleLoaded = true
        if (cancelled) return
        assembly = createWardrobeAssembly(store.getSnapshot().session.wardrobe, { maxAnisotropy: anisotropyRef.current, onChange: () => runtime.invalidate(), onMotionChange: parts => binding?.publish(parts) })
        let applied: WardrobeAssemblyConfiguration
        do {
          applied = store.getSnapshot().session.wardrobe
          assembly.update(applied)
          await assembly.setFinishes(applied)
        } while (!cancelled && applied !== store.getSnapshot().session.wardrobe)
        if (cancelled) return
        const motion = assembly.motion
        const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
        const updatePreference = () => { motion.setReducedMotion(preference.matches); runtime.invalidate() }
        updatePreference()
        preference.addEventListener('change', updatePreference)
        stopPreference = () => preference.removeEventListener('change', updatePreference)
        binding = motionStore.attach('wardrobe-assembly', motion, motion.getStates())
        stopFrames = runtime.addFrameListener(motion.update)
        stopInteraction = bindFurnitureInteraction(runtime.renderer.domElement, runtime.camera, assembly.group, motion)
        active.current = assembly
        runtime.scene.add(assembly.group)
        stopCamera = runtime.attachCameraObstacles(assembly.getCameraObstacles)
        runtime.invalidate()
        setStatus({ token, configuration: applied, error: null })
      } catch (error) {
        if (cancelled) return
        detach(); assembly?.dispose()
        console.error('Ошибка гардеробной:', error)
        setStatus({ token, error: 'Не удалось подготовить гардеробную. Повторите загрузку.', reload: !moduleLoaded })
      }
    }
    void prepare()
    return () => {
      cancelled = true
      detach()
      if (active.current === assembly) active.current = null
      if (assembly) { runtime.scene.remove(assembly.group); assembly.dispose() }
      restoreStudio()
      runtime.invalidate()
    }
  }, [enabled, token, runtimeRef, anisotropyRef, store, motionStore])

  useEffect(() => {
    const current = active.current
    if (!enabled || !current) return
    let cancelled = false
    current.update(configuration)
    void current.setFinishes(configuration).then(() => {
      if (!cancelled && active.current === current) setStatus({ token, configuration, error: null })
    }).catch(error => {
      if (cancelled || active.current !== current) return
      console.error('Ошибка покрытия гардеробной:', error)
      setStatus({ token, error: 'Не удалось загрузить покрытие. Повторите загрузку гардеробной.' })
    })
    return () => { cancelled = true }
  }, [configuration, enabled, token])
  return { ready: enabled && status?.token === token && status.configuration === configuration && !status.error,
    loading: enabled && status?.token !== token,
    error: enabled && status?.token === token ? status.error : null,
    retry: () => status?.reload ? window.location.replace(store.getShareUrl()) : setAttempt(value => value + 1) }
}
