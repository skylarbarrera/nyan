#!/usr/bin/env bun
/**
 * TouchDesigner Preset Extractor
 *
 * Extracts non-default parameter values from expanded .toe.dir projects.
 * Reads .n files for node metadata and .parm files for parameter values.
 *
 * Usage:
 *   bun scripts/extract-presets.ts <project.toe.dir>
 *   bun scripts/extract-presets.ts --help
 */

import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, basename, extname } from "path";

// ─── Types ─────────────────────────────────────────────────────────

interface NodePreset {
  name: string;
  type: string;
  family: string;
  params: Record<string, string>;
}

interface PresetOutput {
  project: string;
  nodes: NodePreset[];
  by_operator: Record<string, Record<string, string>>;
}

// ─── Helpers ───────────────────────────────────────────────────────

function walkDir(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

function parseNFile(filepath: string): { family: string; type: string } | null {
  let content: string;
  try {
    content = readFileSync(filepath, "utf-8");
  } catch {
    return null;
  }

  const lines = content.trim().split("\n");
  if (lines.length === 0) return null;

  const firstLine = lines[0].trim();
  if (!firstLine.includes(":")) return null;

  const colonIdx = firstLine.indexOf(":");
  const family = firstLine.substring(0, colonIdx);
  const type = firstLine.substring(colonIdx + 1);

  return { family, type };
}

function parseParmFile(filepath: string): Record<string, string> {
  const params: Record<string, string> = {};
  let content: string;
  try {
    content = readFileSync(filepath, "utf-8");
  } catch {
    return params;
  }

  const lines = content.trim().split("\n");

  for (let i = 0; i < lines.length; i++) {
    const stripped = lines[i].trim();
    if (stripped === "?" || stripped === "") continue;

    const parts = stripped.split(/\s+/);
    if (parts.length >= 3) {
      const paramName = parts[0];
      // parts[1] is flags, parts[2..] is value (may contain spaces for expressions)
      const value = parts.slice(2).join(" ");
      // Strip surrounding quotes from expressions
      if (value.startsWith('"') && value.endsWith('"')) {
        params[paramName] = value.slice(1, -1);
      } else {
        params[paramName] = value;
      }
    }
  }

  return params;
}

// ─── Main ──────────────────────────────────────────────────────────

function extractPresets(dirPath: string): PresetOutput {
  const allFiles = walkDir(dirPath);

  const nFiles = allFiles.filter((f) => extname(f) === ".n");
  const parmFiles = new Set(allFiles.filter((f) => extname(f) === ".parm"));

  const nodes: NodePreset[] = [];
  const byOperator: Record<string, Record<string, string>> = {};

  for (const nFile of nFiles) {
    const parsed = parseNFile(nFile);
    if (!parsed) continue;

    const nodeName = basename(nFile, ".n");

    // Look for matching .parm file
    const parmPath = nFile.replace(/\.n$/, ".parm");
    let params: Record<string, string> = {};
    if (parmFiles.has(parmPath)) {
      params = parseParmFile(parmPath);
    }

    nodes.push({
      name: nodeName,
      type: parsed.type,
      family: parsed.family,
      params,
    });

    // Merge into by_operator
    const opKey = `${parsed.type} ${parsed.family}`;
    if (!byOperator[opKey]) {
      byOperator[opKey] = {};
    }
    Object.assign(byOperator[opKey], params);
  }

  // Sort nodes by name for stable output
  nodes.sort((a, b) => a.name.localeCompare(b.name));

  return {
    project: basename(dirPath),
    nodes,
    by_operator: byOperator,
  };
}

// ─── CLI ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes("--help")) {
  console.log(`Usage: bun scripts/extract-presets.ts <project.toe.dir>

Extracts parameter presets from an expanded TouchDesigner project.

Arguments:
  project.toe.dir   Path to an expanded .toe.dir directory

Output:
  JSON to stdout with nodes, params, and by_operator grouping.
`);
  process.exit(0);
}

if (args.length === 0) {
  console.log(`Usage: bun scripts/extract-presets.ts <project.toe.dir>

Run with --help for more info.`);
  process.exit(2);
}

const dirPath = args[0];

if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
  console.error(`Error: Directory not found: ${dirPath}`);
  process.exit(1);
}

const result = extractPresets(dirPath);
console.log(JSON.stringify(result, null, 2));
