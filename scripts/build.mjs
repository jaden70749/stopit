import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
let envText = "";

try {
  envText = await readFile(resolve(root, ".env"), "utf8");
} catch {
  // CI supplies public values through environment variables.
}

function envValue(name) {
  if (process.env[name]) return process.env[name];
  const line = envText.split(/\r?\n/).find((item) => item.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1).trim().replace(/^(['"])(.*)\1$/, "$2") : "";
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await Promise.all([
  cp(resolve(root, "index.html"), resolve(dist, "index.html")),
  cp(resolve(root, "app.js"), resolve(dist, "app.js")),
  cp(resolve(root, "demo.js"), resolve(dist, "demo.js")),
  cp(resolve(root, "styles.css"), resolve(dist, "styles.css"))
]);
await writeFile(
  resolve(dist, "config.js"),
  `window.HACHABELL_CONFIG = Object.freeze(${JSON.stringify({
    kakaoJavaScriptKey: envValue("KAKAO_JAVASCRIPT_KEY"),
    transitApiBaseUrl: envValue("HACHABELL_TRANSIT_API_BASE_URL")
  })});\n`,
  "utf8"
);
