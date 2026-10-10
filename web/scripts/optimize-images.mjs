import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE = "images-source";
const TARGET = "public";
const MAX_WIDTH = 2400;
const EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(fullPath);
    else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) yield fullPath;
  }
}

for await (const file of walk(SOURCE)) {
  const relative = path.relative(SOURCE, file);
  const output = path.join(TARGET, relative.replace(/\.[^.]+$/, ".webp"));
  await mkdir(path.dirname(output), { recursive: true });

  const info = await sharp(file)
    .rotate() // respecte l'orientation de la photo
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(output);

  console.log(`${relative} -> ${output} (${Math.round(info.size / 1024)} Ko)`);
}