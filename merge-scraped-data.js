#!/usr/bin/env node
import fs from "fs";
import path from "path";

const artifactsDir = process.argv[2] || "scraped_parts";
const outputPath = "data/latest.json";

// Load existing latest.json
let latestMap = {};
if (fs.existsSync(outputPath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    console.log('existing length: ', existing.length);
    if (Array.isArray(existing)) {
      for (const item of existing) {
        if (item && item.item_nameid != null) {
          latestMap[item.item_nameid] = item;
        }
      }
    }
  } catch {
    console.warn("⚠️ Could not parse existing latest.json, starting fresh");
  }
}

// Walk scraped-* artifacts
for (const dir of fs.readdirSync(artifactsDir)) {
  if (!dir.startsWith("scraped-")) continue;

  const fullDir = path.join(artifactsDir, dir);
  if (!fs.statSync(fullDir).isDirectory()) continue;

  for (const file of fs.readdirSync(fullDir)) {
    if (!file.endsWith(".json")) continue;

    const shardPath = path.join(fullDir, file);
    let shard;

    try {
      shard = JSON.parse(fs.readFileSync(shardPath, "utf8"));
    } catch {
      console.warn(`⚠️ Skipping invalid JSON: ${shardPath}`);
      continue;
    }

    console.log('shard: length=', shard.length);
    console.log(`shard info: fullDir: ${fullDir}, file: ${file}`);

    // ✅ Normalize to array
    const items = Array.isArray(shard)
      ? shard
      : shard && typeof shard === "object"
        ? [shard]
        : [];

    for (const item of items) {
      if (item && item.item_nameid != null) {
        latestMap[item.item_nameid] = item;
      }
    }
  }
}

console.log('latestMap len: ', Object.values(latestMap).length);

if (Object.keys(latestMap).length < 100) {
  throw new Error("Refusing to write empty latest.json — merge failed");
} else {
  throw new Error('just refuse to merge')
}

// Write final array
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(
  outputPath,
  JSON.stringify(Object.values(latestMap), null, 2)
);
