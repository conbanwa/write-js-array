const fs = require("fs");
const path = require("path");

const jsName = process.env["INPUT_JS-NAME"];
let arrayName = (process.env["INPUT_ARRAY-NAME"] || "").trim();
const rawValues = process.env["INPUT_VALUES"];
const valueType = (process.env["INPUT_VALUE-TYPE"] || "stringified").toLowerCase();
const parseMode = (process.env["INPUT_PARSE-MODE"] || "json").toLowerCase();
const declKind = process.env["INPUT_DECL-KIND"] || "let";
const exportStyle = process.env["INPUT_EXPORT-STYLE"] || "none";
const pretty = process.env["INPUT_PRETTY"] === "true";
const overwrite = process.env["INPUT_OVERWRITE"] !== "false";
const dryRun = process.env["INPUT_DRY-RUN"] === "true";

if (rawValues.length > 100_000) {
  throw new Error("values input too large");
}

const RESERVED = new Set([
  "let", "const", "var", "function", "class", "export", "default", "return"
]);

function deriveArrayName(filename) {
  return path.basename(filename, path.extname(filename))
    .replace(/\W|^(?=\d)/g, "_");
}

if (!arrayName) {
  arrayName = deriveArrayName(jsName);
}

if (RESERVED.has(arrayName)) {
  throw new Error(`Invalid array-name: reserved keyword (${arrayName})`);
}

if (!["let", "const", "var"].includes(declKind)) {
  throw new Error(`Invalid decl-kind: ${declKind}`);
}

if (fs.existsSync(jsName) && !overwrite) {
  throw new Error(`File "${jsName}" already exists and overwrite=false`);
}

function parseInput(raw) {
  if (parseMode === "json") {
    return JSON.parse(raw);
  }
  if (parseMode === "js") {
    return Function(`"use strict"; return (${raw});`)();
  }
  throw new Error(`Unknown parse-mode: ${parseMode}`);
}

function toJs(value, indent = 0) {
  const pad = pretty ? "  ".repeat(indent) : "";
  const nl = pretty ? "\n" : "";

  if (Array.isArray(value)) {
    const inner = value.map(v => toJs(v, indent + 1)).join(pretty ? ",\n" : ", ");
    return `[${nl}${inner}${nl}${pad}]`;
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null) return "null";

  throw new Error(`Unsupported value type: ${typeof value}`);
}

let arrayLiteral;

if (valueType === "stringified") {
  const parsed = parseInput(rawValues);
  arrayLiteral = toJs(parsed);
} else {
  const items = rawValues.split(",").map(v => v.trim());
  let processedItems = items;
  if (valueType === "string") {
    processedItems = items.map(v => JSON.stringify(v));
  }
  arrayLiteral = `[${processedItems.join(", ")}]`;
}

let content = `${declKind} ${arrayName} = ${arrayLiteral};\n`;

switch (exportStyle) {
  case "named":
    content += `export { ${arrayName} };\n`;
    break;
  case "default":
    content += `export default ${arrayName};\n`;
    break;
  case "commonjs":
    content += `module.exports = ${arrayName};\n`;
    break;
}

console.log("Generated output:\n");
console.log(content);

if (!dryRun) {
  fs.writeFileSync(jsName, content, "utf8");
}

fs.appendFileSync(process.env.GITHUB_OUTPUT, `file=${jsName}\n`);

