import { readFileSync, writeFileSync } from "node:fs";

// Orval emits both Zod values and TypeScript types with names like GetRoomParams.
// Re-exporting both namespaces causes TS2308; the server consumes Zod values only.
const file = new URL("../api-zod/src/index.ts", import.meta.url);
const content = readFileSync(file, "utf8");
writeFileSync(file, content.replace(/^export \* from ['"]\.\/generated\/types['"];?\r?\n/m, ""));