// glTF-Transform writes embedded images. This final, lossless packaging step
// moves only named images to shared project URIs; geometry bytes stay unchanged.
export function externalizeImages(input, uris) {
  const bytes = Buffer.from(input)
  if (bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(8) !== bytes.length) throw new Error('Invalid GLB')
  const jsonSize = bytes.readUInt32LE(12)
  if (bytes.readUInt32LE(16) !== 0x4e4f534a) throw new Error('Missing JSON chunk')
  const json = JSON.parse(bytes.subarray(20, 20 + jsonSize).toString())
  const binStart = 28 + jsonSize
  if (json.buffers.length !== 1 || bytes.readUInt32LE(24 + jsonSize) !== 0x004e4942) throw new Error('Expected one BIN buffer')
  const bin = bytes.subarray(binStart), removed = new Set(), found = new Set()
  for (const image of json.images) {
    const uri = uris[image.name]
    if (!uri) continue
    if (!Number.isInteger(image.bufferView)) throw new Error(`Image is already external: ${image.name}`)
    removed.add(image.bufferView); found.add(image.name)
    delete image.bufferView
    image.uri = uri
    image.mimeType = 'image/jpeg'
  }
  for (const name of Object.keys(uris)) if (!found.has(name)) throw new Error(`Missing image: ${name}`)
  const remap = new Map(), views = [], chunks = []
  let offset = 0
  for (const [oldIndex, view] of json.bufferViews.entries()) {
    if (removed.has(oldIndex)) continue
    if (view.buffer !== 0 || view.extensions) throw new Error('Unsupported buffer view')
    const padding = (4 - offset % 4) % 4
    if (padding) { chunks.push(Buffer.alloc(padding)); offset += padding }
    remap.set(oldIndex, views.length)
    chunks.push(bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength))
    views.push({...view, byteOffset: offset}); offset += view.byteLength
  }
  const update = object => {
    if (object?.bufferView === undefined) return
    const index = remap.get(object.bufferView)
    if (index === undefined) throw new Error('Removed image bytes are used by another property')
    object.bufferView = index
  }
  for (const accessor of json.accessors) {
    update(accessor); update(accessor.sparse?.indices); update(accessor.sparse?.values)
  }
  for (const image of json.images) update(image)
  json.bufferViews = views
  json.buffers[0].byteLength = offset
  const jsonBytes = Buffer.from(JSON.stringify(json)), jsonPad = (4 - jsonBytes.length % 4) % 4
  const jsonChunk = Buffer.concat([jsonBytes, Buffer.alloc(jsonPad, 0x20)])
  const binChunk = Buffer.concat([...chunks, Buffer.alloc((4 - offset % 4) % 4)])
  const header = Buffer.alloc(20), binHeader = Buffer.alloc(8)
  header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4)
  header.writeUInt32LE(28 + jsonChunk.length + binChunk.length, 8)
  header.writeUInt32LE(jsonChunk.length, 12); header.writeUInt32LE(0x4e4f534a, 16)
  binHeader.writeUInt32LE(binChunk.length, 0); binHeader.writeUInt32LE(0x004e4942, 4)
  return Buffer.concat([header, jsonChunk, binHeader, binChunk])
}
