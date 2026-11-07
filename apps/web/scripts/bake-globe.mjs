// Genera public/data/globe.bin: puntos sobre tierra firme a partir de Natural Earth
// (dominio público, vía world-atlas). Solo hace falta volver a ejecutarlo para cambiar la densidad.
// Uso: node scripts/bake-globe.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const atlas = JSON.parse(readFileSync(require.resolve("world-atlas/land-50m.json"), "utf8"));
const land = feature(atlas, atlas.objects.land);

// Máscara de tierra en una imagen lat/lon: consultar un píxel es instantáneo.
const WIDTH = 4096;
const HEIGHT = 2048;
const mask = new Uint8Array(WIDTH * HEIGHT);
const toX = (lon) => ((lon + 180) / 360) * WIDTH;
const toY = (lat) => ((90 - lat) / 180) * HEIGHT;

function fillRing(ring) {
  const crossings = new Map();
  for (let i = 0; i < ring.length - 1; i += 1) {
    const x0 = toX(ring[i][0]);
    const y0 = toY(ring[i][1]);
    const x1 = toX(ring[i + 1][0]);
    const y1 = toY(ring[i + 1][1]);
    const top = Math.ceil(Math.min(y0, y1) - 0.5);
    const bottom = Math.ceil(Math.max(y0, y1) - 0.5);
    for (let row = top; row < bottom; row += 1) {
      const x = x0 + ((row + 0.5 - y0) / (y1 - y0)) * (x1 - x0);
      if (!crossings.has(row)) crossings.set(row, []);
      crossings.get(row).push(x);
    }
  }
  for (const [row, xs] of crossings) {
    if (row < 0 || row >= HEIGHT) continue;
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const end = Math.min(WIDTH, Math.ceil(xs[i + 1]));
      // Cada anillo alterna: los lagos y huecos interiores se restan solos
      for (let x = Math.max(0, Math.floor(xs[i])); x < end; x += 1) mask[row * WIDTH + x] ^= 1;
    }
  }
}

const polygons = land.features.flatMap((item) =>
  item.geometry.type === "Polygon" ? [item.geometry.coordinates] : item.geometry.coordinates,
);
polygons.flat().forEach(fillRing);

const isLand = (lon, lat) => {
  const x = Math.min(WIDTH - 1, Math.floor(toX(lon)));
  const y = Math.min(HEIGHT - 1, Math.floor(toY(lat)));
  return mask[y * WIDTH + x] === 1;
};

// Reparto al azar con distancia mínima: sin rejilla visible y sin grumos.
const TARGET = 10500;
const MIN_DISTANCE = 0.0155;
const MAX_ATTEMPTS = 3000000;

const cells = new Map();
const cellOf = (value) => Math.floor((value + 1) / MIN_DISTANCE);
const keyOf = (a, b, c) => (a * 4096 + b) * 4096 + c;

function tooClose(x, y, z) {
  const cx = cellOf(x);
  const cy = cellOf(y);
  const cz = cellOf(z);
  for (let a = cx - 1; a <= cx + 1; a += 1) {
    for (let b = cy - 1; b <= cy + 1; b += 1) {
      for (let c = cz - 1; c <= cz + 1; c += 1) {
        for (const point of cells.get(keyOf(a, b, c)) ?? []) {
          const distance = (point[0] - x) ** 2 + (point[1] - y) ** 2 + (point[2] - z) ** 2;
          if (distance < MIN_DISTANCE ** 2) return true;
        }
      }
    }
  }
  return false;
}

const values = [];
let accepted = 0;
for (let attempt = 0; attempt < MAX_ATTEMPTS && accepted < TARGET; attempt += 1) {
  const y = Math.random() * 2 - 1;
  const radius = Math.sqrt(1 - y * y);
  const theta = Math.random() * Math.PI * 2;
  const x = Math.cos(theta) * radius;
  const z = Math.sin(theta) * radius;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = (Math.atan2(x, z) * 180) / Math.PI;
  if (!isLand(lon, lat) || tooClose(x, y, z)) continue;
  const key = keyOf(cellOf(x), cellOf(y), cellOf(z));
  if (!cells.has(key)) cells.set(key, []);
  cells.get(key).push([x, y, z]);
  values.push(x, y, z);
  accepted += 1;
}

const data = Int16Array.from(values, (value) => Math.round(value * 32767));
mkdirSync("public/data", { recursive: true });
writeFileSync("public/data/globe.bin", Buffer.from(data.buffer));
console.log(`${data.length / 3} puntos, ${(data.byteLength / 1024).toFixed(0)} KB`);
