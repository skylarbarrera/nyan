#!/usr/bin/env bun
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const SCRIPT = join(import.meta.dir, "..", "scripts", "extract-presets.ts");
const FIXTURES = join(import.meta.dir, "__fixtures__", "extract-presets");

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

// ─── Setup / Teardown ──────────────────────────────────────────────

beforeAll(() => {
  if (existsSync(FIXTURES)) {
    rmSync(FIXTURES, { recursive: true });
  }

  // Create a sample .toe.dir structure
  const projectDir = join(FIXTURES, "sample.toe.dir", "project1");
  mkdirSync(projectDir, { recursive: true });

  // noise_base.n
  writeFileSync(
    join(projectDir, "noise_base.n"),
    "TOP:noise\ntile 100 100 130 90\nflags =  viewer 1 parlanguage 0\ncolor 0.5 0.5 0.5\nend\n"
  );

  // noise_base.parm
  writeFileSync(
    join(projectDir, "noise_base.parm"),
    "?\nresolutionw 0 1920\nresolutionh 0 1080\nperiod 0 1.5\nharmonics 0 3\n?\n"
  );

  // level_adjust.n (with inputs)
  writeFileSync(
    join(projectDir, "level_adjust.n"),
    "TOP:level\ntile 250 100 130 90\nflags =  viewer 1 parlanguage 0\ninputs\n{\n0\tnoise_base\n}\ncolor 0.5 0.5 0.5\nend\n"
  );

  // level_adjust.parm
  writeFileSync(
    join(projectDir, "level_adjust.parm"),
    "?\nopacity 0 0.8\nbrightness1 0 1.2\n?\n"
  );

  // null_output.n (no parm file)
  writeFileSync(
    join(projectDir, "null_output.n"),
    "TOP:null\ntile 400 100 130 90\nflags =  viewer 1 parlanguage 0\ninputs\n{\n0\tlevel_adjust\n}\ncolor 0.5 0.5 0.5\nend\n"
  );

  // lfo_drive.n - CHOP family
  writeFileSync(
    join(projectDir, "lfo_drive.n"),
    "CHOP:lfo\ntile 100 300 130 90\nflags =  viewer 1 parlanguage 0\ncolor 0.5 0.5 0.5\nend\n"
  );

  // lfo_drive.parm
  writeFileSync(
    join(projectDir, "lfo_drive.parm"),
    "?\nfrequency 0 2.0\namplitude 0 0.5\n?\n"
  );
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

  it("exits 1 for missing directory", () => {
    const { exitCode, stderr } = run("/nonexistent/path");
    expect(exitCode).toBe(1);
  });
});

describe("Preset extraction", () => {
  it("outputs valid JSON", () => {
    const { stdout, exitCode } = run(join(FIXTURES, "sample.toe.dir"));
    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed).toBeDefined();
  });

  it("includes project name", () => {
    const { stdout } = run(join(FIXTURES, "sample.toe.dir"));
    const parsed = JSON.parse(stdout);
    expect(parsed.project).toBe("sample.toe.dir");
  });

  it("finds all nodes with .n files", () => {
    const { stdout } = run(join(FIXTURES, "sample.toe.dir"));
    const parsed = JSON.parse(stdout);
    const nodeNames = parsed.nodes.map((n: any) => n.name);
    expect(nodeNames).toContain("noise_base");
    expect(nodeNames).toContain("level_adjust");
    expect(nodeNames).toContain("null_output");
    expect(nodeNames).toContain("lfo_drive");
  });

  it("extracts correct family and type from .n files", () => {
    const { stdout } = run(join(FIXTURES, "sample.toe.dir"));
    const parsed = JSON.parse(stdout);
    const noise = parsed.nodes.find((n: any) => n.name === "noise_base");
    expect(noise.family).toBe("TOP");
    expect(noise.type).toBe("noise");

    const lfo = parsed.nodes.find((n: any) => n.name === "lfo_drive");
    expect(lfo.family).toBe("CHOP");
    expect(lfo.type).toBe("lfo");
  });

  it("extracts parameter values from .parm files", () => {
    const { stdout } = run(join(FIXTURES, "sample.toe.dir"));
    const parsed = JSON.parse(stdout);
    const noise = parsed.nodes.find((n: any) => n.name === "noise_base");
    expect(noise.params.resolutionw).toBe("1920");
    expect(noise.params.resolutionh).toBe("1080");
    expect(noise.params.period).toBe("1.5");
    expect(noise.params.harmonics).toBe("3");
  });

  it("nodes without .parm have empty params", () => {
    const { stdout } = run(join(FIXTURES, "sample.toe.dir"));
    const parsed = JSON.parse(stdout);
    const null_out = parsed.nodes.find((n: any) => n.name === "null_output");
    expect(null_out.params).toEqual({});
  });

  it("groups params by operator type in by_operator", () => {
    const { stdout } = run(join(FIXTURES, "sample.toe.dir"));
    const parsed = JSON.parse(stdout);
    expect(parsed.by_operator["noise TOP"]).toBeDefined();
    expect(parsed.by_operator["noise TOP"].period).toBe("1.5");
    expect(parsed.by_operator["level TOP"]).toBeDefined();
    expect(parsed.by_operator["level TOP"].opacity).toBe("0.8");
    expect(parsed.by_operator["lfo CHOP"]).toBeDefined();
    expect(parsed.by_operator["lfo CHOP"].frequency).toBe("2.0");
  });

  it("by_operator merges params from same operator type", () => {
    // Create a second noise node to test merging
    const projectDir = join(FIXTURES, "merge-test.toe.dir", "project1");
    mkdirSync(projectDir, { recursive: true });

    writeFileSync(
      join(projectDir, "noise_a.n"),
      "TOP:noise\ntile 100 100 130 90\nflags =  viewer 1 parlanguage 0\ncolor 0.5 0.5 0.5\nend\n"
    );
    writeFileSync(
      join(projectDir, "noise_a.parm"),
      "?\nperiod 0 2.0\n?\n"
    );
    writeFileSync(
      join(projectDir, "noise_b.n"),
      "TOP:noise\ntile 250 100 130 90\nflags =  viewer 1 parlanguage 0\ncolor 0.5 0.5 0.5\nend\n"
    );
    writeFileSync(
      join(projectDir, "noise_b.parm"),
      "?\nperiod 0 3.0\nharmonics 0 5\n?\n"
    );

    const { stdout } = run(join(FIXTURES, "merge-test.toe.dir"));
    const parsed = JSON.parse(stdout);

    // by_operator should have noise TOP with merged params
    // Last value wins for same param, but harmonics should be present
    expect(parsed.by_operator["noise TOP"]).toBeDefined();
    expect(parsed.by_operator["noise TOP"].harmonics).toBe("5");
  });
});
