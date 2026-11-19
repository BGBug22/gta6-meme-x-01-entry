// gta6-meme-x-01 entry: hand in the X post that carries the meme.
//
// The meme itself lives on X — its first picture plus its text are what the
// judge reads. This program's only job is to carry POST.json, the post's
// address, from the repository into /output, where the gate reads it.
//
// It runs the same way in the grader and on a laptop:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Rules this program keeps: Node 22 standard library only, no network, no
// wall clock, no files outside the repository, and the same bytes out on
// every run — POST.json is copied byte for byte, never re-serialised.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message: string): never {
  console.error(`gta6-meme-x-01: ${message}`);
  process.exit(1);
}

const sourcePath = join(BOT_DIR, 'POST.json');

let raw: Buffer;
try {
  raw = readFileSync(sourcePath);
} catch (err) {
  fail(`cannot read ${sourcePath}: ${(err as Error).message}`);
}

let post: unknown;
try {
  post = JSON.parse(raw.toString('utf8'));
} catch (err) {
  fail(`POST.json is not valid JSON: ${(err as Error).message}`);
}

if (typeof post !== 'object' || post === null || Array.isArray(post)) {
  fail('POST.json must be a JSON object like {"url": "https://x.com/<handle>/status/<id>"}');
}

const url = (post as { url?: unknown }).url;
if (typeof url !== 'string' || url.length === 0) {
  fail('POST.json must carry a "url" string naming the X post');
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const targetPath = join(OUTPUT_DIR, 'POST.json');
writeFileSync(targetPath, raw);

// Prove the copy landed byte for byte: a silent partial write must fail
// loudly instead of handing the gate a truncated POST.json.
let written: Buffer;
try {
  written = readFileSync(targetPath);
} catch (err) {
  fail(`cannot re-read ${targetPath}: ${(err as Error).message}`);
}
if (!written.equals(raw)) {
  fail(`${targetPath} differs from ${sourcePath} after copying`);
}
