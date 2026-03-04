#!/usr/bin/env bun
/**
 * TouchDesigner Golden Diff
 *
 * Compares an agent-generated .toe.dir project against a golden example.
 * Reports missing/extra nodes, wiring differences, and parameter mismatches.
 *
 * Usage:
 *   bun scripts/diff-golden.ts <output.toe.dir> <golden.toe.dir>
 *   bun scripts/diff-golden.ts --help
 */

import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, basename, extname } from "path";

// ─── Types ─────────────────────────────────────────────────────────

interface NodeInfo {
  name: string;
  family: string;
  type: string;
  inputs: Record<number, string>;
  params: Record<string, string>;
}

interface ParamDiff {
  param: string;
  output_value: string;
  golden_value: string;
}

interface NodeParamDiff {
  node: string;
  differences: ParamDiff[];
}

interface WiringDiff {
  node: string;
  input_index: number;
  output_source: string | null;
  golden_source: string | null;
}

interface DiffResult {
  output_node_count: number;
  golden_node_count: number;
  matching_nodes: number;
  missing_from_output: string[];
  extra_in_output: string[];
  param_differences: NodeParamDiff[];
  wiring_differences: WiringDiff[];
  match_score: number;
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

function parseNFile(filepath: string): { family: string; type: string; inputs: Record<number, string> } | null {
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

  const inputs: Record<number, string> = {};
  let inInputsBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const stripped = lines[i].trim();

    if (stripped === "inputs") {
      inInputsBlock = true;
      continue;
    }

    if (inInputsBlock) {
      if (stripped === "{") continue;
      if (stripped === "}") {
        inInputsBlock = false;
        continue;
      }

      const parts = stripped.split(/\t/);
      if (parts.length >= 2) {
        const idx = parseInt(parts[0], 10);
        if (!isNaN(idx)) {
          inputs[idx] = parts[1].trim();
        }
      }
    }
  }

  return { family, type, inputs };
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
      const value = parts.slice(2).join(" ");
      if (value.startsWith('"') && value.endsWith('"')) {
        params[paramName] = value.slice(1, -1);
      } else {
        params[paramName] = value;
      }
    }
  }

  return params;
}

function loadProject(dirPath: string): Record<string, NodeInfo> {
  const allFiles = walkDir(dirPath);
  const nFiles = allFiles.filter((f) => extname(f) === ".n");
  const parmPaths = new Set(allFiles.filter((f) => extname(f) === ".parm"));

  const nodes: Record<string, NodeInfo> = {};

  for (const nFile of nFiles) {
    const parsed = parseNFile(nFile);
    if (!parsed) continue;

    const nodeName = basename(nFile, ".n");
    const parmPath = nFile.replace(/\.n$/, ".parm");
    let params: Record<string, string> = {};
    if (parmPaths.has(parmPath)) {
      params = parseParmFile(parmPath);
    }

    nodes[nodeName] = {
      name: nodeName,
      family: parsed.family,
      type: parsed.type,
      inputs: parsed.inputs,
      params,
    };
  }

  return nodes;
}

/** Check if two numeric values are within tolerance (5%) */
function withinTolerance(a: string, b: string, tolerance: number = 0.05): boolean {
  const numA = parseFloat(a);
  const numB = parseFloat(b);

  if (isNaN(numA) || isNaN(numB)) return false;
  if (numA === numB) return true;
  if (numB === 0) return Math.abs(numA) <= tolerance;

  return Math.abs(numA - numB) / Math.abs(numB) <= tolerance;
}

// ─── Diff Logic ────────────────────────────────────────────────────

function diffProjects(outputNodes: Record<string, NodeInfo>, goldenNodes: Record<string, NodeInfo>): DiffResult {
  const outputNames = new Set(Object.keys(outputNodes));
  const goldenNames = new Set(Object.keys(goldenNodes));

  // Missing/extra nodes
  const missingFromOutput: string[] = [];
  const extraInOutput: string[] = [];

  for (const name of goldenNames) {
    if (!outputNames.has(name)) {
      missingFromOutput.push(name);
    }
  }

  for (const name of outputNames) {
    if (!goldenNames.has(name)) {
      extraInOutput.push(name);
    }
  }

  // Shared nodes
  const sharedNames = [...goldenNames].filter((n) => outputNames.has(n));
  let matchingNodes = 0;

  const paramDifferences: NodeParamDiff[] = [];
  const wiringDifferences: WiringDiff[] = [];

  for (const name of sharedNames) {
    const outputNode = outputNodes[name];
    const goldenNode = goldenNodes[name];

    // Check type match
    if (outputNode.type !== goldenNode.type || outputNode.family !== goldenNode.family) {
      // Type mismatch counts as not matching
      continue;
    }

    matchingNodes++;

    // Compare parameters
    const allParams = new Set([
      ...Object.keys(outputNode.params),
      ...Object.keys(goldenNode.params),
    ]);

    const diffs: ParamDiff[] = [];
    for (const param of allParams) {
      const outVal = outputNode.params[param];
      const goldVal = goldenNode.params[param];

      if (outVal === goldVal) continue;
      if (outVal === undefined || goldVal === undefined) {
        diffs.push({
          param,
          output_value: outVal ?? "(missing)",
          golden_value: goldVal ?? "(missing)",
        });
        continue;
      }

      // Check numeric tolerance
      if (withinTolerance(outVal, goldVal)) continue;

      diffs.push({
        param,
        output_value: outVal,
        golden_value: goldVal,
      });
    }

    if (diffs.length > 0) {
      paramDifferences.push({ node: name, differences: diffs });
    }

    // Compare wiring
    const allInputs = new Set([
      ...Object.keys(outputNode.inputs).map(Number),
      ...Object.keys(goldenNode.inputs).map(Number),
    ]);

    for (const idx of allInputs) {
      const outSrc = outputNode.inputs[idx] ?? null;
      const goldSrc = goldenNode.inputs[idx] ?? null;

      if (outSrc !== goldSrc) {
        wiringDifferences.push({
          node: name,
          input_index: idx,
          output_source: outSrc,
          golden_source: goldSrc,
        });
      }
    }
  }

  // Calculate match score
  const totalGolden = goldenNames.size;
  if (totalGolden === 0) {
    return {
      output_node_count: outputNames.size,
      golden_node_count: 0,
      matching_nodes: 0,
      missing_from_output: missingFromOutput,
      extra_in_output: extraInOutput,
      param_differences: paramDifferences,
      wiring_differences: wiringDifferences,
      match_score: outputNames.size === 0 ? 100 : 0,
    };
  }

  // Score breakdown:
  // - Node presence: 50% weight (matching / golden count)
  // - Param correctness: 30% weight (nodes without param diffs / matching)
  // - Wiring correctness: 20% weight (nodes without wiring diffs / matching)
  const nodeScore = (matchingNodes / totalGolden) * 50;

  let paramScore = 0;
  let wireScore = 0;
  if (matchingNodes > 0) {
    const nodesWithParamDiffs = new Set(paramDifferences.map((d) => d.node)).size;
    const nodesWithWireDiffs = new Set(wiringDifferences.map((d) => d.node)).size;
    paramScore = ((matchingNodes - nodesWithParamDiffs) / matchingNodes) * 30;
    wireScore = ((matchingNodes - nodesWithWireDiffs) / matchingNodes) * 20;
  }

  // Penalize extra nodes (minor)
  const extraPenalty = Math.min(extraInOutput.length * 2, 10);

  const score = Math.max(0, Math.round(nodeScore + paramScore + wireScore - extraPenalty));

  return {
    output_node_count: outputNames.size,
    golden_node_count: totalGolden,
    matching_nodes: matchingNodes,
    missing_from_output: missingFromOutput.sort(),
    extra_in_output: extraInOutput.sort(),
    param_differences: paramDifferences,
    wiring_differences: wiringDifferences,
    match_score: score,
  };
}

// ─── CLI ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes("--help")) {
  console.log(`Usage: bun scripts/diff-golden.ts <output.toe.dir> <golden.toe.dir>

Compares an agent-generated .toe.dir project against a golden example.

Arguments:
  output.toe.dir   Path to the agent-generated expanded project
  golden.toe.dir   Path to the golden reference expanded project

Output:
  JSON to stdout with node counts, differences, and match score.
`);
  process.exit(0);
}

if (args.length < 2) {
  console.log(`Usage: bun scripts/diff-golden.ts <output.toe.dir> <golden.toe.dir>

Run with --help for more info.`);
  process.exit(2);
}

const outputPath = args[0];
const goldenPath = args[1];

if (!existsSync(outputPath) || !statSync(outputPath).isDirectory()) {
  console.error(`Error: Output directory not found: ${outputPath}`);
  process.exit(1);
}

if (!existsSync(goldenPath) || !statSync(goldenPath).isDirectory()) {
  console.error(`Error: Golden directory not found: ${goldenPath}`);
  process.exit(1);
}

const outputNodes = loadProject(outputPath);
const goldenNodes = loadProject(goldenPath);
const result = diffProjects(outputNodes, goldenNodes);

console.log(JSON.stringify(result, null, 2));
