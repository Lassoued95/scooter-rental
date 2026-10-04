const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const locales = JSON.parse(
  readFileSync(join(root, "src", "i18n", "locales.json"), "utf8"),
);
const messagesDirectory = join(root, "messages");

function flattenKeys(value, prefix = "", keys = []) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      flattenKeys(child, path, keys);
    } else {
      keys.push(path);
    }
  }

  return keys;
}

const englishPath = join(messagesDirectory, "en.json");
const englishKeys = flattenKeys(JSON.parse(readFileSync(englishPath, "utf8")));
let hasErrors = false;

for (const { code } of locales) {
  const filePath = join(messagesDirectory, `${code}.json`);
  let messages;

  try {
    messages = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`${code}: unable to read messages/${code}.json (${error.message})`);
    hasErrors = true;
    continue;
  }

  const keys = flattenKeys(messages);
  const keySet = new Set(keys);
  const englishKeySet = new Set(englishKeys);
  const missing = englishKeys.filter((key) => !keySet.has(key));
  const extra = keys.filter((key) => !englishKeySet.has(key));

  if (missing.length || extra.length) {
    hasErrors = true;
    console.error(`${code}:`);
    if (missing.length) console.error(`  Missing keys: ${missing.join(", ")}`);
    if (extra.length) console.error(`  Extra keys: ${extra.join(", ")}`);
  } else {
    console.log(`${code}: keys match en.json`);
  }
}

if (hasErrors) process.exitCode = 1;
