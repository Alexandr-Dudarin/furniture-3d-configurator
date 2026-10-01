// Test-only lookup. No public catalogue code imports the archived model.
import { existsSync } from 'node:fs'

export const localFirstTablePath = [
  '.local-archive/first-table/first-table.glb',
  'public/models/first-table.glb',
].find(path => existsSync(path))
