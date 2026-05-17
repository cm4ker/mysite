#!/usr/bin/env node
/* eslint-disable */
// Pure-Node EXIF/metadata stripper for JPEG and PNG.
// JPEG: drops APP1..APPF (Exif/XMP/etc.) and COM segments.
// PNG: keeps only image-critical chunks, drops text/metadata chunks.
const fs = require("fs");

function stripJpeg(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error("not a JPEG");
  const parts = [Buffer.from([0xff, 0xd8])];
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) throw new Error("bad marker at offset " + i);
    let m = buf[i + 1];
    // skip fill bytes
    while (m === 0xff && i + 1 < buf.length) {
      i++;
      m = buf[i + 1];
    }
    if (m === 0xd9) {
      parts.push(buf.slice(i));
      break;
    }
    if (m === 0xda) {
      parts.push(buf.slice(i));
      break;
    }
    if (m >= 0xd0 && m <= 0xd7) {
      parts.push(buf.slice(i, i + 2));
      i += 2;
      continue;
    }
    const segLen = (buf[i + 2] << 8) | buf[i + 3];
    const segEnd = i + 2 + segLen;
    const drop = (m >= 0xe1 && m <= 0xef) || m === 0xfe;
    if (!drop) parts.push(buf.slice(i, segEnd));
    i = segEnd;
  }
  return Buffer.concat(parts);
}

function stripPng(buf) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!buf.slice(0, 8).equals(sig)) throw new Error("not a PNG");
  const keep = new Set([
    "IHDR",
    "PLTE",
    "IDAT",
    "IEND",
    "tRNS",
    "cHRM",
    "gAMA",
    "iCCP",
    "sBIT",
    "sRGB",
    "bKGD",
    "pHYs",
    "sPLT",
  ]);
  const parts = [sig];
  let i = 8;
  while (i < buf.length) {
    const len = buf.readUInt32BE(i);
    const type = buf.slice(i + 4, i + 8).toString("ascii");
    const chunkEnd = i + 12 + len;
    if (keep.has(type)) parts.push(buf.slice(i, chunkEnd));
    if (type === "IEND") break;
    i = chunkEnd;
  }
  return Buffer.concat(parts);
}

function strip(input, output) {
  const buf = fs.readFileSync(input);
  const ext = input.toLowerCase().slice(-4);
  let out;
  if (ext === ".jpg" || ext === "jpeg") out = stripJpeg(buf);
  else if (ext === ".png") out = stripPng(buf);
  else throw new Error("unsupported extension: " + ext);
  fs.writeFileSync(output, out);
  console.log(
    `[strip] ${input} (${buf.length} B) -> ${output} (${out.length} B)`,
  );
}

const args = process.argv.slice(2);
if (args.length < 2 || args.length % 2 !== 0) {
  console.error("usage: strip-image-metadata.js <in1> <out1> [<in2> <out2> ...]");
  process.exit(1);
}
for (let i = 0; i < args.length; i += 2) {
  strip(args[i], args[i + 1]);
}
