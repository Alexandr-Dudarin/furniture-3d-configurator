"""Collect generated text files and optionally check them without writing."""

import argparse
import sys
from pathlib import Path


class GeneratedFiles:
    def __init__(self, root, description):
        parser = argparse.ArgumentParser(description=description)
        parser.add_argument(
            '--check', action='store_true',
            help='Report missing or stale outputs without changing any file.',
        )
        self.check = parser.parse_args().check
        self.root = Path(root)
        self.outputs = {}

    def add(self, path, content):
        path = Path(path)
        if path in self.outputs:
            raise ValueError(f'Duplicate generated output: {path}')
        self.outputs[path] = content

    def finish(self):
        # All inputs have been read before any output is written. A missing or
        # malformed source therefore cannot leave a partly regenerated catalogue.
        stale = []
        for path, content in self.outputs.items():
            # read_text normalizes CRLF: Git's Windows checkout policy must not
            # make otherwise identical generated data appear out of date.
            current = path.read_text(encoding='utf-8') if path.exists() else None
            if current != content:
                stale.append(path)
                if not self.check:
                    path.parent.mkdir(parents=True, exist_ok=True)
                    with path.open('w', encoding='utf-8', newline='\n') as output:
                        output.write(content)
        if self.check and stale:
            for path in stale:
                print(f'Stale or missing: {path.relative_to(self.root).as_posix()}', file=sys.stderr)
            print('Run this generator without --check, then review the diff.', file=sys.stderr)
            raise SystemExit(1)
        action = 'Checked' if self.check else 'Generated'
        print(f'{action} {len(self.outputs)} files; {len(stale)} changed. No GLB files rebuilt.')
