// Genera public/data/globe.bin: puntos sobre tierra firme a partir de Natural Earth
// (dominio público, vía world-atlas). Solo hace falta volver a ejecutarlo para cambiar la densidad.
// Uso: node scripts/bake-globe.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const atlas = JSON.parse(readFileSync(require.resolve("world-atlas/land-110m.json"), "utf8"));
const land = feature(atlas, atlas.objects.land);

const SAMPLES = 120000;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const values = [];

for (let i = 0; i < SAMPLES; i += 1) {
  const y = 1 - (i / (SAMPLES - 1)) * 2;
  const radius = Math.sqrt(1 - y * y);
  const theta = GOLDEN * i;
  const x = Math.cos(theta) * radius;
  const z = Math.sin(theta) * radius;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = (Math.atan2(x, z) * 180) / Math.PI;
  if (geoContains(land, [lon, lat])) values.push(x, y, z);
}

const data = Int16Array.from(values, (value) => Math.round(value * 32767));
mkdirSync("public/data", { recursive: true });
writeFileSync("public/data/globe.bin", Buffer.from(data.buffer));
console.log(`${data.length / 3} puntos, ${(data.byteLength / 1024).toFixed(0)} KB`);
