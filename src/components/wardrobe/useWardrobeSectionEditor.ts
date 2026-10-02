import { useState } from 'react'
import {
  previewWardrobeSectionUpdate,
  wardrobeSectionNeedsConfirmation,
  type WardrobeAssemblyAction,
  type WardrobeAssemblyConfiguration,
  type WardrobeSection,
} from '../../configurator/wardrobeAssembly/state'
import type { WardrobeSectionPatch } from './types'

type PendingUpdate = {
  current: WardrobeSection
  next: WardrobeSection
  patch: WardrobeSectionPatch
}

export function useWardrobeSectionEditor(
  configuration: WardrobeAssemblyConfiguration,
  onAction: (action: WardrobeAssemblyAction) => void,
) {
  const [selectedId, select] = useState(configuration.sections[0].id)
  const [pendingUpdate, setPendingUpdate] = useState<PendingUpdate | null>(null)
  const selected =
    configuration.sections.find((section) => section.id === selectedId) ?? configuration.sections[0]
  const index = configuration.sections.indexOf(selected)

  // A restored/replaced section invalidates its old preview even if its ID is
  // unchanged. Confirmation must never apply to a different source object.
  const pending =
    pendingUpdate && configuration.sections.includes(pendingUpdate.current) ? pendingUpdate : null

  const update = (patch: WardrobeSectionPatch) => {
    if (pending) return
    const next = previewWardrobeSectionUpdate(selected, patch)
    if (wardrobeSectionNeedsConfirmation(selected, next)) {
      setPendingUpdate({ current: selected, next, patch })
    } else {
      onAction({ type: 'update-section', id: selected.id, patch })
    }
  }

  const cancel = () => setPendingUpdate(null)
  const confirm = () => {
    setPendingUpdate(null)
    if (pending && configuration.sections.includes(pending.current)) {
      onAction({
        type: 'update-section',
        id: pending.current.id,
        patch: pending.patch,
        confirmFillingChange: true,
      })
    }
  }

  return { selected, index, select, pending, update, cancel, confirm }
}
