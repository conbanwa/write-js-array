const fs = require("fs");
const path = require("path");

const jsName = process.env["INPUT_JS-NAME"];
let arrayName = (process.env["INPUT_ARRAY-NAME"] || "").trim();
const valuesRaw = process.env["INPUT_VALUES"];
const valueType = (process.env["INPUT_VALUE-TYPE"] || "unstringify").toLowerCase();
const declKind = process.env["INPUT_DECL-KIND"] || "let";
const overwrite = (process.env["INPUT_OVERWRITE"] || "true") === "true";

function deriveArrayName(filename) {
  const stem = path.basename(filename, path.extname(filename));
  return stem.replace(/\W|^(?=\d)/g, "_");
}

if (!arrayName) {
  arrayName = deriveArrayName(jsName);
}

if (fs.existsSync(jsName) && !overwrite) {
  throw new Error(`File "${jsName}" already exists and overwrite=false`);
}

function toJsLiteral(value) {
  if (Array.isArray(value)) {
    return `[${value.map(toJsLiteral).join(", ")}]`;
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null) {
    return "null";
  }
  throw new Error(`Unsupported value type: ${typeof value}`);
}

function formatValues(raw, type) {
  if (type === "unstringify") {
    // Node-side unstringify (safe JSON / JS literal parsing)
    let parsed;
    try {
      parsed = Function(`"use strict"; return (${raw});`)();
    } catch (e) {
      throw new Error(`Unstringify failed: ${e.message}`);
    }
    return toJsLiteral(parsed);
  }

  const items = raw.split(",").map(v => v.trim());

  if (type === "number" || type === "boolean") {
    return `[${items.join(", ")}]`;
  }

  return `[${items.map(v => JSON.stringify(v)).join(", ")}]`;
}

const arrayLiteral = formatValues(valuesRaw, valueType);
const content = `${declKind} ${arrayName} = ${arrayLiteral};\n`;

fs.writeFileSync(jsName, content, "utf8");

console.log(`Generated ${jsName}`);
console.log(content);

fs.appendFileSync(process.env.GITHUB_OUTPUT, `file=${jsName}\n`);
