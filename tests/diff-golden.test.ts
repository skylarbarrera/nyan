#!/usr/bin/env bun
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const SCRIPT = join(import.meta.dir, "..", "scripts", "diff-golden.ts");
const FIXTURES = join(import.meta.dir, "__fixtures__", "diff-golden");

function run(args: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(`bun ${SCRIPT} ${args}`, {
      encoding: "utf-8",
      cwd: join(import.meta.dir, ".."),
    });
    return { stdout, stderr: "", exitCode: 0 };
  } catch (e: any) {
    return {
      stdout: e.stdout || "",
      stderr: e.stderr || "",
      exitCode: e.status ?? 1,
    };
  }
}

// ─── Helpers ───────────────────────────────────────────────────────

function writeNode(dir: string, name: string, family: string, type: string, inputs?: Record<number, string>) {
  let content = `${family}:${type}\ntile 100 100 130 90\nflags =  viewer 1 parlanguage 0\n`;
  if (inputs) {
    content += "inputs\n{\n";
    for (const [idx, src] of Object.entries(inputs)) {
      content += `${idx}\t${src}\n`;
    }
    content += "}\n";
  }
  content += "color 0.5 0.5 0.5\nend\n";
  writeFileSync(join(dir, `${name}.n`), content);
}

function writeParm(dir: string, name: string, params: Record<string, string>) {
  let content = "?\n";
  for (const [k, v] of Object.entries(params)) {
    content += `${k} 0 ${v}\n`;
  }
  content += "?\n";
  writeFileSync(join(dir, `${name}.parm`), content);
}

// ─── Setup / Teardown ──────────────────────────────────────────────

beforeAll(() => {
  if (existsSync(FIXTURES)) {
    rmSync(FIXTURES, { recursive: true });
  }

  // Golden project: noise -> level -> null
  const goldenDir = join(FIXTURES, "golden.toe.dir", "project1");
  mkdirSync(goldenDir, { recursive: true });

  writeNode(goldenDir, "noise_base", "TOP", "noise");
  writeParm(goldenDir, "noise_base", { resolutionw: "1920", resolutionh: "1080", period: "1.5" });
  writeNode(goldenDir, "level_adjust", "TOP", "level", { 0: "noise_base" });
  writeParm(goldenDir, "level_adjust", { opacity: "0.8" });
  writeNode(goldenDir, "null_output", "TOP", "null", { 0: "level_adjust" });

  // Identical project (for 100% match)
  const identicalDir = join(FIXTURES, "identical.toe.dir", "project1");
  mkdirSync(identicalDir, { recursive: true });

  writeNode(identicalDir, "noise_base", "TOP", "noise");
  writeParm(identicalDir, "noise_base", { resolutionw: "1920", resolutionh: "1080", period: "1.5" });
  writeNode(identicalDir, "level_adjust", "TOP", "level", { 0: "noise_base" });
  writeParm(identicalDir, "level_adjust", { opacity: "0.8" });
  writeNode(identicalDir, "null_output", "TOP", "null", { 0: "level_adjust" });

  // Different project: missing node, extra node, wrong params
  const diffDir = join(FIXTURES, "different.toe.dir", "project1");
  mkdirSync(diffDir, { recursive: true });

  writeNode(diffDir, "noise_base", "TOP", "noise");
  writeParm(diffDir, "noise_base", { resolutionw: "1280", resolutionh: "720", period: "2.0" });
  // level_adjust is MISSING
  writeNode(diffDir, "blur_extra", "TOP", "blur", { 0: "noise_base" });
  writeNode(diffDir, "null_output", "TOP", "null", { 0: "blur_extra" });

  // Wiring difference project: same nodes, different wiring
  const wireDir = join(FIXTURES, "wire-diff.toe.dir", "project1");
  mkdirSync(wireDir, { recursive: true });

  writeNode(wireDir, "noise_base", "TOP", "noise");
  writeParm(wireDir, "noise_base", { resolutionw: "1920", resolutionh: "1080", period: "1.5" });
  writeNode(wireDir, "level_adjust", "TOP", "level", { 0: "noise_base" });
  writeParm(wireDir, "level_adjust", { opacity: "0.8" });
  // null_output wired to noise_base instead of level_adjust
  writeNode(wireDir, "null_output", "TOP", "null", { 0: "noise_base" });

  // Numeric tolerance project: values within 5%
  const toleranceDir = join(FIXTURES, "tolerance.toe.dir", "project1");
  mkdirSync(toleranceDir, { recursive: true });

  writeNode(toleranceDir, "noise_base", "TOP", "noise");
  // 1.5 * 1.03 = 1.545, within 5% tolerance
  writeParm(toleranceDir, "noise_base", { resolutionw: "1920", resolutionh: "1080", period: "1.545" });
  writeNode(toleranceDir, "level_adjust", "TOP", "level", { 0: "noise_base" });
  writeParm(toleranceDir, "level_adjust", { opacity: "0.8" });
  writeNode(toleranceDir, "null_output", "TOP", "null", { 0: "level_adjust" });
});

afterAll(() => {
  if (existsSync(FIXTURES)) {
    rmSync(FIXTURES, { recursive: true });
  }
});

// ─── Tests ─────────────────────────────────────────────────────────

describe("CLI", () => {
  it("shows usage with no args", () => {
    const { exitCode, stdout } = run("");
    expect(exitCode).toBe(2);
    expect(stdout).toContain("Usage:");
  });

  it("shows usage with --help", () => {
    const { exitCode, stdout } = run("--help");
    expect(exitCode).toBe(0);
    expect(stdout).toContain("Usage:");
  });

  it("shows usage with only one arg", () => {
    const { exitCode, stdout } = run(join(FIXTURES, "golden.toe.dir"));
    expect(exitCode).toBe(2);
    expect(stdout).toContain("Usage:");
  });

  it("exits 1 for missing directory", () => {
    const { exitCode } = run("/nonexistent/path /other/nonexistent");
    expect(exitCode).toBe(1);
  });
});

describe("Identical projects", () => {
  it("outputs valid JSON", () => {
    const { stdout, exitCode } = run(
      `${join(FIXTURES, "identical.toe.dir")} ${join(FIXTURES, "golden.toe.dir")}`
    );
    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed).toBeDefined();
  });

  it("reports 100% match score", () => {
    const { stdout } = run(
      `${join(FIXTURES, "identical.toe.dir")} ${join(FIXTURES, "golden.toe.dir")}`
    );
    const parsed = JSON.parse(stdout);
    expect(parsed.match_score).toBe(100);
  });

  it("reports no missing or extra nodes", () => {
    const { stdout } = run(
      `${join(FIXTURES, "identical.toe.dir")} ${join(FIXTURES, "golden.toe.dir")}`
    );
    const parsed = JSON.parse(stdout);
    expect(parsed.missing_from_output).toEqual([]);
    expect(parsed.extra_in_output).toEqual([]);
  });

  it("reports no parameter or wiring differences", () => {
    const { stdout } = run(
      `${join(FIXTURES, "identical.toe.dir")} ${join(FIXTURES, "golden.toe.dir")}`
    );
    const parsed = JSON.parse(stdout);
    expect(parsed.param_differences).toEqual([]);
    expect(parsed.wiring_differences).toEqual([]);
  });
});

describe("Different projects", () => {
  it("detects missing nodes", () => {
    const { stdout } = run(
      `${join(FIXTURES, "different.toe.dir")} ${join(FIXTURES, "golden.toe.dir")}`
    );
    const parsed = JSON.parse(stdout);
    expect(parsed.missing_from_output).toContain("level_adjust");
  });

  it("detects extra nodes", () => {
    const { stdout } = run(
      `${join(FIXTURES, "different.toe.dir")} ${join(FIXTURES, "golden.toe.dir")}`
    );
    const parsed = JSON.parse(stdout);
    expect(parsed.extra_in_output).toContain("blur_extra");
  });

  it("detects parameter differences for shared nodes", () => {
    const { stdout } = run(
      `${join(FIXTURES, "different.toe.dir")} ${join(FIXTURES, "golden.toe.dir")}`
    );
    const parsed = JSON.parse(stdout);
    expect(parsed.param_differences.length).toBeGreaterThan(0);
    const noiseDiff = parsed.param_differences.find((d: any) => d.node === "noise_base");
    expect(noiseDiff).toBeDefined();
    expect(noiseDiff.differences).toBeDefined();
  });

  it("match score is less than 100", () => {
    const { stdout } = run(
      `${join(FIXTURES, "different.toe.dir")} ${join(FIXTURES, "golden.toe.dir")}`
    );
    const parsed = JSON.parse(stdout);
    expect(parsed.match_score).toBeLessThan(100);
  });
});

describe("Wiring differences", () => {
  it("detects different input sources", () => {
    const { stdout } = run(
      `${join(FIXTURES, "wire-diff.toe.dir")} ${join(FIXTURES, "golden.toe.dir")}`
    );
    const parsed = JSON.parse(stdout);
    expect(parsed.wiring_differences.length).toBeGreaterThan(0);
    const nullDiff = parsed.wiring_differences.find((d: any) => d.node === "null_output");
    expect(nullDiff).toBeDefined();
  });
});

describe("Numeric tolerance", () => {
  it("treats values within 5% as matching", () => {
    const { stdout } = run(
      `${join(FIXTURES, "tolerance.toe.dir")} ${join(FIXTURES, "golden.toe.dir")}`
    );
    const parsed = JSON.parse(stdout);
    // period 1.545 vs 1.5 = 3% difference, within 5% tolerance
    const noiseDiff = parsed.param_differences.find((d: any) => d.node === "noise_base");
    // Should either have no noise_base entry or noise_base without period difference
    if (noiseDiff) {
      const periodDiff = noiseDiff.differences.find((d: any) => d.param === "period");
      expect(periodDiff).toBeUndefined();
    }
  });
});

describe("Summary", () => {
  it("includes node counts", () => {
    const { stdout } = run(
      `${join(FIXTURES, "different.toe.dir")} ${join(FIXTURES, "golden.toe.dir")}`
    );
    const parsed = JSON.parse(stdout);
    expect(parsed.output_node_count).toBeDefined();
    expect(parsed.golden_node_count).toBeDefined();
    expect(parsed.matching_nodes).toBeDefined();
  });
});
