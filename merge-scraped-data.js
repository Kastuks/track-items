#!/usr/bin/env node
import fs from "fs";
import path from "path";

/**
 * Merges append-only shards into latest.json.
 * New items overwrite old ones by item id.
 */

const artifactsDir = process.argv[2] || "scraped_parts";
const outputFile = "data/latest.json";

// Load existing latest.json (if any)
let latest = {};
if (fs.existsSync(outputFile)) {
  const old = JSON.parse(fs.readFileSync(outputFile, "utf8"));
  for (const item of old) {
    latest[item.id] = item;
  }
}

// Merge new shards
for (const dir of fs.readdirSync(artifactsDir)) {
  if (!dir.startsWith("scraped-")) continue;

  const shardDir = path.join(artifactsDir, dir);
  for (const file of fs.readdirSync(shardDir)) {
    if (!file.startsWith("part-")) continue;

    const shard = JSON.parse(
      fs.readFileSync(path.join(shardDir, file), "utf8")
    );

    for (const item of shard) {
      latest[item.id] = item; // overwrite by id
    }
  }
}

// Write canonical result
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(
  outputFile,
  JSON.stringify(Object.values(latest), null, 2)
);