#!/usr/bin/env node
/**
 * Downloads the exercises dataset (https://github.com/hasaneyldrm/exercises-dataset)
 * at a pinned commit and writes a slim, bundle-friendly copy to src/data/.
 *
 *   yarn data:exercises            # English only
 *   yarn data:exercises --langs=en,hi
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DATASET_SHA = '7455efae41b330c265e7cd4b78dfa848e7ce5ebd';
const SOURCE = `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/${DATASET_SHA}/data/exercises.json`;

const langsArg = process.argv.find(a => a.startsWith('--langs='));
const langs = langsArg ? langsArg.slice('--langs='.length).split(',') : ['en'];

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');

const titleCase = s =>
  s.replace(/(^|[\s(/-])([a-z])/g, (_, p, c) => p + c.toUpperCase());

const res = await fetch(SOURCE);
if (!res.ok) {
  throw new Error(`Download failed: ${res.status} ${res.statusText}`);
}
const raw = await res.json();

const exercises = raw.map(e => ({
  id: e.id,
  name: titleCase(e.name),
  bodyPart: e.body_part,
  equipment: e.equipment,
  target: e.target,
  secondaryMuscles: e.secondary_muscles ?? [],
  steps: Object.fromEntries(
    langs.map(l => [l, e.instruction_steps?.[l] ?? []]),
  ),
  image: e.image,
  gif: e.gif_url,
}));

const count = key => {
  const m = {};
  for (const e of exercises) {
    m[e[key]] = (m[e[key]] ?? 0) + 1;
  }
  return Object.entries(m)
    .sort((a, b) => b[1] - a[1])
    .map(([value, n]) => ({ value, count: n }));
};

const meta = {
  sha: DATASET_SHA,
  langs,
  total: exercises.length,
  bodyParts: count('bodyPart'),
  equipment: count('equipment'),
  targets: count('target'),
};

await mkdir(outDir, { recursive: true });
const json = JSON.stringify(exercises);
await writeFile(join(outDir, 'exercises.json'), json);
await writeFile(join(outDir, 'meta.json'), JSON.stringify(meta, null, 2));

console.log(
  `Wrote ${exercises.length} exercises (${(json.length / 1024 / 1024).toFixed(
    2,
  )} MB, langs: ${langs.join(',')})`,
);
