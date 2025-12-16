#!/usr/bin/env node
import fs from "fs";
import path from "path";

/**
 * Usage:
 *   node merge-scraped-data.js scraped_parts
 *
 * Expected layout:
 * scraped_parts/
 *   scraped-1/part-1.json
 *   scraped-2/part-2.json
 *   ...
 */

const root = process.argv[2];
if (!root) {
  console.error("Usage: node merge-scraped-data.js <artifactDir>");
  process.exit(1);
}

function isScrapedArtifact(name) {
  return name.startsWith("scraped-");
}

let merged = [];

const artifactDirs = fs.readdirSync(root, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .filter(isScrapedArtifact);

for (const dir of artifactDirs) {
  const fullDir = path.join(root, dir);
  const files = fs.readdirSync(fullDir);

  for (const file of files) {
    if (!file.startsWith("part-") || !file.endsWith(".json")) continue;

    const filePath = path.join(fullDir, file);

    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

      if (Array.isArray(data)) {
        merged.push(...data);
      } else {
        merged.push(data);
      }
    } catch (err) {
      console.error(`Failed to parse ${filePath}`, err);
    }
  }
}

process.stdout.write(JSON.stringify(merged, null, 2));