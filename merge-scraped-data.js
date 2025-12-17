#!/usr/bin/env node
import fs from "fs";
import path from "path";

/**
 * Merges append-only shards into latest.json.
 * Outputs a JSON array of all unique items, newest overwrite.
 */

const artifactsDir = process.argv[2];
if (!artifactsDir) {
  console.error("Usage: node merge-scraped-data.js <artifactDir>");
  process.exit(1);
}

// Load existing latest.json (array) into a map
let latestMap = {};
if (fs.existsSync("data/latest.json")) {
  try {
    const existing = JSON.parse(fs.readFileSync("data/latest.json", "utf8"));
    if (Array.isArray(existing)) {
      existing.forEach(item => {
        latestMap[item.id] = item;
      });
    }
  } catch (e) {
    console.warn("Unable to read existing latest.json — ignoring", e);
  }
}

// Enumerate shard artifacts (`scraped-X` folders)
const artifactDirs = fs
  .readdirSync(artifactsDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name.startsWith("scraped-"))
  .map(d => d.name);

for (const dir of artifactDirs) {
  const fullDir = path.join(artifactsDir, dir);

  // Find the part file inside the shard artifact
  const files = fs.readdirSync(fullDir);
  const partFile = files.find(f => f.startsWith("part-") && f.endsWith(".json"));
  if (!partFile) continue;

  const shardPath = path.join(fullDir, partFile);
  let shardData;
  try {
    shardData = JSON.parse(fs.readFileSync(shardPath, "utf8"));
  } catch (e) {
    console.error(`Failed to parse shard: ${shardPath}`, e);
    continue;
  }

  // Merge: overwrite existing ID if shard has a new value
  if (Array.isArray(shardData)) {
    shardData.forEach(item => {
      latestMap[item.id] = item;
    });
  }
}

// Convert back to array and write
const mergedArray = Object.values(latestMap);
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(
  "data/latest.json",
  JSON.stringify(mergedArray, null, 2)
);