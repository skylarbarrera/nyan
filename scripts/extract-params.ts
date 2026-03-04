#!/usr/bin/env bun
/**
 * TouchDesigner Parameter ID Extractor
 *
 * Extracts parameter IDs from operator JSON files, reducing ~150KB per operator
 * to ~1KB of actionable parameter names for .parm file authoring.
 *
 * Usage:
 *    bun scripts/extract-params.ts noise_top
 *    bun scripts/extract-params.ts level_top --verbose
 *    bun scripts/extract-params.ts "Audio Device In"
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, basename } from "path";

const SCRIPT_DIR = new URL(".", import.meta.url).pathname;
const DATA_DIR = join(SCRIPT_DIR, "..", "data", "operators");

// Common params shared across all TOPs/CHOPs (noisy, skip in compact mode)
const COMMON_TOP_PARAMS = new Set([
  "outputresolution",
  "resolution",
  "resolutionw",
  "resolutionh",
  "resmenu",
  "resmult",
  "outputaspect",
  "aspect",
  "aspect1",
  "aspect2",
  "armenu",
  "inputfiltertype",
  "fillmode",
  "filtertype",
  "npasses",
  "chanmask",
  "format",
]);

const COMMON_CHOP_PARAMS = new Set([
  "timeslice",
  "chanscope",
  "channame",
  "samplerate",
  "units",
  "start",
  "end",
  "extend",
  "defval",
]);

const BOILERPLATE_WORDS = new Set([
  "From",
  "Jump",
  "The",
  "An",
  "Contents",
  "See",
  "Note",
  "Extra",
  "Retrieved",
  "Category",
  "Use",
  "For",
  "This",
  "Each",
  "If",
  "When",
  "Any",
  "noiseTOP",
  "levelTOP",
  "Contents",
]);

const MENU_STOP_WORDS = new Set([
  "the",
  "this",
  "that",
  "with",
  "from",
  "into",
  "when",
  "will",
  "can",
  "for",
  "are",
  "its",
  "use",
  "see",
  "note",
  "each",
  "some",
  "any",
  "all",
  "and",
  "but",
  "not",
  "also",
  "only",
  "more",
  "most",
]);

interface ParamInfo {
  id: string;
  description: string;
  menu: string[] | null;
  sub: string[] | null;
}

interface ExtractResult {
  name: string;
  category: string;
  description: string;
  unique_params: ParamInfo[];
  common_params: ParamInfo[];
  total: number;
}

function findOperatorFile(name: string): string | null {
  // Direct match
  const direct = join(DATA_DIR, `${name}.json`);
  if (existsSync(direct)) return direct;

  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));

  // Exact stem match
  for (const f of files) {
    const stem = f.replace(/\.json$/, "");
    if (stem === name) return join(DATA_DIR, f);
  }

  // Fuzzy: remove spaces/hyphens/underscores, lowercase
  const normalized = name.toLowerCase().replace(/[ \-_]/g, "");
  for (const f of files) {
    const stemNorm = f.replace(/\.json$/, "").toLowerCase().replace(/_/g, "");
    if (stemNorm === normalized) return join(DATA_DIR, f);
  }

  // Partial match
  const candidates: string[] = [];
  const nameLower = name.toLowerCase().replace(/_/g, " ");
  for (const f of files) {
    const stemLower = f.replace(/\.json$/, "").toLowerCase().replace(/_/g, " ");
    if (stemLower.includes(nameLower)) {
      candidates.push(f);
    }
  }

  if (candidates.length === 1) return join(DATA_DIR, candidates[0]);
  if (candidates.length > 1) {
    process.stderr.write(`Ambiguous name '${name}'. Matches:\n`);
    for (const c of candidates) {
      process.stderr.write(`  ${c.replace(/\.json$/, "")}\n`);
    }
    return null;
  }

  return null;
}

function extractParamsFromDescription(description: string): ParamInfo[] {
  const params: ParamInfo[] = [];

  // Normalize non-breaking spaces (\xa0) to regular spaces
  const desc = description.replace(/\xa0/g, " ");

  // Find all parameter definitions by their indent level.
  // Real parameters have indent >= 3 spaces before the ID.
  // Menu items/sub-params have indent <= 2 spaces.
  const paramStartRegex = /\n(\s{3,})(\w+)\s+-/g;
  const starts: { id: string; index: number }[] = [];

  let m: RegExpExecArray | null;
  while ((m = paramStartRegex.exec(desc)) !== null) {
    const id = m[2];
    // Skip boilerplate words and uppercase-starting words
    if (BOILERPLATE_WORDS.has(id)) continue;
    if (id[0] >= "A" && id[0] <= "Z") continue;
    starts.push({ id, index: m.index });
  }

  // For each parameter, extract its content up to the next parameter
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const endIdx = i + 1 < starts.length ? starts[i + 1].index : desc.length;
    const content = desc.slice(start.index, endIdx).trim();

    // Parse description: handle "param_id -  - Desc" (double dash) and "param_id - Desc"
    const descMatch = content.match(/^\w+\s+-(?:\s+-)*\s+(.+)/s);
    if (!descMatch) continue;

    const rawDesc = descMatch[1].trim();

    // Extract menu items: lowercase words followed by " - " within this param's content.
    // Menu items appear both inline (on one line) and on separate lines.
    const menuItems: string[] = [];
    const menuPattern = /(?:^|[\n. ])(\w+)\s+-\s+/gm;
    let mm: RegExpExecArray | null;
    while ((mm = menuPattern.exec(rawDesc)) !== null) {
      const candidate = mm[1];
      if (
        candidate[0] >= "a" &&
        candidate[0] <= "z" &&
        candidate.length > 1 &&
        !MENU_STOP_WORDS.has(candidate.toLowerCase())
      ) {
        menuItems.push(candidate);
      }
    }

    // Clean up description - take first sentence only
    let firstSentence = rawDesc.split(". ")[0];
    firstSentence = firstSentence.split(".\n")[0];
    firstSentence = firstSentence.split(".\t")[0];
    // Remove inline menu items from description
    let cleanDesc = firstSentence.replace(/\n\s*\w+\s+-\s+.*/g, "").trim();
    if (cleanDesc.length > 120) {
      cleanDesc = cleanDesc.slice(0, 117) + "...";
    }

    // Extract sub-parameters (like tx, ty, tz — short IDs on their own line)
    const subParams: string[] = [];
    const subPattern = /\n\s{0,2}(\w{1,4})\s+-\s*(?:\n|$)/gm;
    let sm: RegExpExecArray | null;
    while ((sm = subPattern.exec(content)) !== null) {
      subParams.push(sm[1]);
    }

    params.push({
      id: start.id,
      description: cleanDesc,
      menu: menuItems.length > 0 ? menuItems.slice(0, 12) : null,
      sub: subParams.length > 0 ? subParams : null,
    });
  }

  return params;
}

function extractParams(filepath: string, verbose: boolean): ExtractResult {
  let raw: string;
  try {
    raw = readFileSync(filepath, "utf-8");
  } catch (e: any) {
    process.stderr.write(`Error reading file: ${e.message}\n`);
    process.exit(1);
  }

  let data: any;
  try {
    data = JSON.parse(raw);
  } catch (e: any) {
    process.stderr.write(`Error parsing JSON in ${filepath}: ${e.message}\n`);
    process.exit(1);
  }

  const opName: string = data.name || basename(filepath, ".json");
  const opCategory: string = data.category || "";
  const opDesc: string = data.description || "";

  const allParams: ParamInfo[] = [];
  const seenIds = new Set<string>();

  for (const param of data.parameters || []) {
    const desc: string = param.description || "";
    if (!desc) continue;

    const extracted = extractParamsFromDescription(desc);
    for (const p of extracted) {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        allParams.push(p);
      }
    }

    // Only need to process the first parameter with a description
    // (they all contain the same blob)
    if (extracted.length > 0) break;
  }

  // Always classify common params (verbose controls display, not classification)
  let commonSet = new Set<string>();
  if (opCategory === "TOP") commonSet = COMMON_TOP_PARAMS;
  else if (opCategory === "CHOP") commonSet = COMMON_CHOP_PARAMS;

  const uniqueParams = allParams.filter((p) => !commonSet.has(p.id));
  const commonParams = allParams.filter((p) => commonSet.has(p.id));

  return {
    name: opName,
    category: opCategory,
    description: opDesc ? opDesc.slice(0, 200) : "",
    unique_params: uniqueParams,
    common_params: commonParams,
    total: allParams.length,
  };
}

function formatOutput(result: ExtractResult, verbose: boolean): string {
  const lines: string[] = [];
  lines.push(`# ${result.name} (${result.category})`);
  if (result.description) {
    lines.push(`# ${result.description.slice(0, 100)}`);
  }
  lines.push("");

  if (result.unique_params.length > 0) {
    lines.push("## Parameters");
    for (const p of result.unique_params) {
      let menuStr = "";
      if (p.menu) {
        menuStr = `  [${p.menu.slice(0, 8).join(", ")}]`;
      }
      let subStr = "";
      if (p.sub) {
        subStr = `  (${p.sub.join(", ")})`;
      }
      lines.push(`  ${p.id.padEnd(25)} # ${p.description}${menuStr}${subStr}`);
    }
    lines.push("");
  }

  if (verbose && result.common_params.length > 0) {
    lines.push("## Common Parameters (shared across family)");
    for (const p of result.common_params) {
      lines.push(`  ${p.id.padEnd(25)} # ${p.description}`);
    }
    lines.push("");
  }

  if (!verbose && result.common_params.length > 0) {
    const names = result.common_params.map((p) => p.id).join(", ");
    lines.push(`## Common (omitted): ${names}`);
    lines.push("");
  }

  lines.push(`# Total: ${result.total} parameters`);
  return lines.join("\n");
}

function main(): void {
  if (process.argv.length < 3) {
    console.log("Usage: bun scripts/extract-params.ts <operator_name> [--verbose]");
    console.log("");
    console.log("Examples:");
    console.log("  bun scripts/extract-params.ts noise_top");
    console.log("  bun scripts/extract-params.ts level_top --verbose");
    console.log("  bun scripts/extract-params.ts audiodevicein_chop");
    console.log("  bun scripts/extract-params.ts 'Audio Device In'");
    console.log("");
    console.log("Extracts .parm parameter IDs from operator JSON files.");
    console.log(`Data directory: ${DATA_DIR}`);
    process.exit(2);
  }

  const name = process.argv[2];
  const verbose = process.argv.includes("--verbose") || process.argv.includes("-v");

  const filepath = findOperatorFile(name);
  if (!filepath) {
    process.stderr.write(`Error: Operator '${name}' not found in ${DATA_DIR}\n`);
    process.stderr.write(
      `\nTry: ls ${DATA_DIR} | grep -i '${name.split("_")[0]}'\n`
    );
    process.exit(1);
  }

  const result = extractParams(filepath, verbose);
  console.log(formatOutput(result, verbose));
}

main();
