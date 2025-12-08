#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const inputDir = process.argv[2];
if (!inputDir) {
  console.error("Usage: node merge-scraped-data.js <directory>");
  process.exit(1);
}

function findJsonFiles(dir) {
  const output = [];

  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      output.push(...findJsonFiles(fullPath));
    } else if (file.endsWith(".json")) {
      output.push(fullPath);
    }
  }

  return output;
}

const jsonFiles = findJsonFiles(inputDir);

let merged = [];

for (const filePath of jsonFiles) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);

    if (Array.isArray(data)) {
      merged.push(...data);
    } else {
      merged.push(data);
    }
  } catch (err) {
    console.error(`Failed to parse ${filePath}:`, err);
  }
}

process.stdout.write(JSON.stringify(merged, null, 2));
