import { rmSync } from 'node:fs';
// Only the generated Vite output, resolved relative to this project.
rmSync(new URL('../dist/', import.meta.url), { recursive: true, force: true });
