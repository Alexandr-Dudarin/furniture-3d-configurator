"""Exercise both generators in disposable projects, never in the working tree."""

import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GENERATORS = [
    'assets/source/wardrobes-integration/generate_runtime.py',
    'assets/source/dressers-integration/generate_runtime.py',
]


class GeneratorChecks(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name) / 'project'
        paths = [ROOT / path for path in GENERATORS]
        paths += [ROOT / 'assets/source' / name for name in
                  ['furniture_motion.py', 'generated_files.py']]
        for pattern in ['assets/source/*/model-contract.json',
                        'assets/source/*/facade-variants.json',
                        'src/three/models/*/config.ts']:
            paths += list(ROOT.glob(pattern))
        for source in paths:
            target = self.root / source.relative_to(ROOT)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)
        for script in GENERATORS:
            self.assertEqual(self.run_generator(script).returncode, 0)

    def run_generator(self, script, *args):
        # Invocation from another directory is part of the supported CLI.
        return subprocess.run(
            [sys.executable, str(self.root / script), *args],
            cwd=self.root.parent, capture_output=True, text=True,
            encoding='utf-8', timeout=30,
        )

    def snapshot(self):
        return {p.relative_to(self.root): p.read_bytes()
                for p in (self.root / 'src').rglob('*.ts')}

    def test_check_reports_all_stale_outputs_without_writing_then_regenerates(self):
        for script, folder in zip(GENERATORS, ['wardrobe-center-drawers', 'dresser-white-four-drawer']):
            with self.subTest(script=script):
                target = self.root / 'src/three/models' / folder
                (target / 'catalog.ts').write_text('// stale\n', encoding='utf-8')
                (target / 'textureTransforms.ts').unlink()
                before = self.snapshot()
                result = self.run_generator(script, '--check')
                self.assertEqual(result.returncode, 1)
                self.assertIn(f'{folder}/catalog.ts', result.stderr)
                self.assertIn(f'{folder}/textureTransforms.ts', result.stderr)
                self.assertEqual(self.snapshot(), before)
                self.assertEqual(self.run_generator(script).returncode, 0)
                self.assertEqual(self.run_generator(script, '--check').returncode, 0)
                generated = self.snapshot()
                self.assertEqual(self.run_generator(script).returncode, 0)
                self.assertEqual(self.snapshot(), generated)

    def test_check_accepts_windows_line_endings_without_rewriting_them(self):
        for path in (self.root / 'src').rglob('*.ts'):
            path.write_bytes(path.read_bytes().replace(b'\r\n', b'\n').replace(b'\n', b'\r\n'))
        before = self.snapshot()
        for script in GENERATORS:
            result = self.run_generator(script, '--check')
            self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.snapshot(), before)

    def test_bad_late_input_does_not_partly_overwrite_earlier_outputs(self):
        for script, first, last in zip(
            GENERATORS,
            ['wardrobe-center-drawers', 'dresser-white-four-drawer'],
            ['wardrobe-chelsea-two-door', 'dresser-baikal-five-drawer'],
        ):
            with self.subTest(script=script):
                folder = self.root / 'src/three/models'
                (folder / first / 'catalog.ts').write_text('// local change\n', encoding='utf-8')
                (folder / last / 'config.ts').write_text('// invalid input\n', encoding='utf-8')
                before = self.snapshot()
                self.assertNotEqual(self.run_generator(script).returncode, 0)
                self.assertEqual(self.snapshot(), before)


if __name__ == '__main__':
    unittest.main()
