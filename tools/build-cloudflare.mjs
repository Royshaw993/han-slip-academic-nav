import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PUBLIC_FILES = Object.freeze([
  "index.html",
  "style.css",
  "script.js",
  "academic-updates.js",
  "research-topics.js",
  "favicon.svg",
  "data/research-hubs.js",
  "data/core-bibliography.js",
  "data/classic-papers.js",
  "data/search-taxonomy.js",
]);

const EXPECTED_SCRIPT_ORDER = [
  "academic-updates.js",
  "data/research-hubs.js",
  "research-topics.js",
  "data/core-bibliography.js",
  "data/classic-papers.js",
  "data/search-taxonomy.js",
  "script.js",
];

function isExternalReference(value) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value);
}

function localReferencePath(value, fromFile) {
  const cleanValue = value.split(/[?#]/, 1)[0];
  const relative = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), cleanValue));
  if (relative === ".." || relative.startsWith("../") || path.posix.isAbsolute(relative)) {
    throw new Error(`Local reference escapes the site root: ${fromFile} -> ${value}`);
  }
  return relative;
}

function attributesOf(tag) {
  const attributes = {};
  const pattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const match of tag.matchAll(pattern)) attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  return attributes;
}

function validateSourceTree(root) {
  const allowed = new Set(PUBLIC_FILES);
  for (const relative of PUBLIC_FILES) {
    const fullPath = path.resolve(root, ...relative.split("/"));
    if (!fullPath.startsWith(`${root}${path.sep}`) || !fs.existsSync(fullPath)) {
      throw new Error(`Required publish file is missing or invalid: ${relative}`);
    }
    const sourceStat = fs.lstatSync(fullPath);
    if (sourceStat.isSymbolicLink() || !sourceStat.isFile()) throw new Error(`Required publish file is not a regular file: ${relative}`);
  }

  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const runtimeFiles = PUBLIC_FILES.filter((relative) => relative.endsWith(".js"));
  const excludedDataReference = /(?:candidate-updates(?:\.review-backup)?\.json|(?:sources|wechat-sources|seen-items)\.json)/i;
  for (const relative of runtimeFiles) {
    const source = fs.readFileSync(path.resolve(root, ...relative.split("/")), "utf8");
    if (excludedDataReference.test(source)) {
      throw new Error(`Published runtime must not depend on excluded review JSON: ${relative}`);
    }
  }
  const scriptOrder = [...html.matchAll(/<script\b[^>]*>/gi)]
    .map(([tag]) => attributesOf(tag).src)
    .filter(Boolean);
  if (JSON.stringify(scriptOrder) !== JSON.stringify(EXPECTED_SCRIPT_ORDER)) {
    throw new Error(`Unexpected index.html script order: ${scriptOrder.join(", ")}`);
  }

  const references = [];
  for (const [tag] of html.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
    const attributes = attributesOf(tag);
    const value = attributes.src || attributes.href;
    if (value && !isExternalReference(value)) references.push(["index.html", value]);
  }
  const css = fs.readFileSync(path.join(root, "style.css"), "utf8");
  for (const [, value] of css.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
    if (value && !isExternalReference(value)) references.push(["style.css", value]);
  }

  for (const [fromFile, value] of references) {
    const relative = localReferencePath(value, fromFile);
    if (!allowed.has(relative)) throw new Error(`Referenced file is outside the publish allowlist: ${fromFile} -> ${relative}`);
    if (!fs.existsSync(path.resolve(root, ...relative.split("/")))) {
      throw new Error(`Referenced publish file is missing: ${fromFile} -> ${relative}`);
    }
  }
  return { scriptOrder, references };
}

function listFiles(directory, relative = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const childRelative = relative ? `${relative}/${entry.name}` : entry.name;
    const childPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlinks are not allowed in dist/: ${childRelative}`);
    return entry.isDirectory() ? listFiles(childPath, childRelative) : [childRelative.split(path.sep).join("/")];
  }).sort();
}

export function buildCloudflare() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const output = path.resolve(root, "dist");
  if (path.dirname(output) !== root || path.basename(output) !== "dist") {
    throw new Error(`Refusing to write outside the repository dist/: ${output}`);
  }

  const { scriptOrder, references } = validateSourceTree(root);
  if (fs.existsSync(output)) {
    if (fs.lstatSync(output).isSymbolicLink() || !fs.statSync(output).isDirectory()) {
      throw new Error("Refusing to replace dist/: expected a regular generated directory");
    }
    fs.rmSync(output, { recursive: true, force: true });
  }
  fs.mkdirSync(output, { recursive: true });
  for (const relative of PUBLIC_FILES) {
    const destination = path.resolve(output, ...relative.split("/"));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.resolve(root, ...relative.split("/")), destination);
  }

  const actual = listFiles(output);
  const expected = [...PUBLIC_FILES].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`dist/ file list differs from allowlist. Actual: ${actual.join(", ")}`);
  }
  console.log(`Cloudflare Pages output: ${path.relative(root, output)}`);
  console.log(`Copied ${actual.length} allowlisted files; verified ${references.length} local asset references.`);
  console.log(`Script order: ${scriptOrder.join(" -> ")}`);
  for (const relative of actual) console.log(`  ${relative}`);
  return actual;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildCloudflare();
