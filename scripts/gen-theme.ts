// E0-S2: sinh src/styles/theme.css từ docs/design-handoff/design-values.json.
import { resolve } from "node:path";
import { buildThemeCss, type DesignValues } from "./lib/theme-css.ts";

const root = resolve(import.meta.dir, "..");
const source = resolve(root, "docs/design-handoff/design-values.json");
const target = resolve(root, "src/styles/theme.css");

const values = (await Bun.file(source).json()) as DesignValues;
const css = buildThemeCss(values);
await Bun.write(target, css);
console.log(`gen-theme: đã ghi ${target} (${css.length} ký tự)`);
