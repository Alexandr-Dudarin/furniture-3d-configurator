#!/usr/bin/env node
// Read-only check of the four UI polish v1 files; does not validate the full app.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const expected = {
  "README.md": "e9dd01a48d23a67b629346efae9f4a323b680c139aa6cd3c5b86b839ddf693bd",
  "docs/roadmap.md": "5f1eaf6ca5953172ad93d66ff599817a13faa02696e0aa1b9eb2c430d8606a3e",
  "src/App.css": "2a80a2329a42a6657763afba63331efbec7864165cb0980aa08a78626a04eeb9",
  "src/components/TableAssemblyControls.tsx": "b45f7e268fb703b62fd1add60f7577a6c4f81b75f2abc628914a6f5b8c02ed0a"
};
const root = path.resolve(__dirname, '..');
let matched = 0;
const problems = [];
for (const [relativePath, hash] of Object.entries(expected)) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) {
    problems.push(`MISSING  ${relativePath}`);
    continue;
  }
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const actual = crypto.createHash('sha256').update(text, 'utf8').digest('hex');
  if (actual === hash) matched += 1;
  else problems.push(`DIFFERS  ${relativePath}`);
}
console.log('Furniture 3D Configurator: read-only UI polish v1 check\n');
console.log(`UI polish files: ${matched}/${Object.keys(expected).length} MATCH`);
for (const problem of problems) console.log(problem);
console.log(problems.length === 0 ? 'RESULT: UI_POLISH_V1_FILES_CONFIRMED' : 'RESULT: FILES_DIFFER_REVIEW_REQUIRED');
console.log('Only this patch is checked. Full-project tests, browser acceptance and Git commits are separate.');
console.log('Optional docs/updates notes are excluded.');
process.exitCode = problems.length === 0 ? 0 : 1;
