import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "fs";
import { join } from "path";

// We'll import from the script once it exists
// For now, define the expected interface
import {
  ValidationResult,
  validateNFile,
  validateParmFile,
  validateTextFile,
  validateToc,
  validateWiring,
  validateProject,
  type NodeInfo,
} from "../scripts/validate-toe";

const FIXTURES = join(import.meta.dir, "__fixtures__", "validate-toe");

// ─── Helpers ───────────────────────────────────────────────────────

function writeFixture(relPath: string, content: string | Buffer) {
  const full = join(FIXTURES, relPath);
  const dir = full.substring(0, full.lastIndexOf("/"));
  mkdirSync(dir, { recursive: true });
  writeFileSync(full, content);
}

function makeTdTextFile(script: string): Buffer {
  const header = Buffer.from("2\n*");
  const meta = Buffer.from([
    0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0,
  ]);
  const content = Buffer.from(script, "utf-8");
  const lenBuf = Buffer.alloc(2);
  lenBuf.writeUInt16BE(content.length);
  return Buffer.concat([header, meta, lenBuf, content]);
}

// ─── Setup / Teardown ──────────────────────────────────────────────

beforeAll(() => {
  // Clean and recreate fixtures
  if (existsSync(FIXTURES)) {
    rmSync(FIXTURES, { recursive: true });
  }
  mkdirSync(FIXTURES, { recursive: true });

  // ── Valid .n file ──
  writeFixture(
    "good-project.toe.dir/noise_base.n",
    [
      "TOP:noise",
      "tile 100 200 130 90",
      "flags =  viewer 1 parlanguage 0",
      "color 0.5 0.5 0.5",
      "end",
    ].join("\n")
  );

  // ── .n file with inputs ──
  writeFixture(
    "good-project.toe.dir/level_adjust.n",
    [
      "TOP:level",
      "tile 250 200 130 90",
      "flags =  viewer 1 parlanguage 0",
      "inputs",
      "{",
      "0\tnoise_base",
      "}",
      "color 0.5 0.5 0.5",
      "end",
    ].join("\n")
  );

  // ── .n file with multi-inputs ──
  writeFixture(
    "good-project.toe.dir/comp_layer.n",
    [
      "TOP:composite",
      "tile 400 200 130 90",
      "flags =  viewer 1 parlanguage 0",
      "inputs",
      "{",
      "0\tnoise_base",
      "1\tlevel_adjust",
      "}",
      "color 0.5 0.5 0.5",
      "end",
    ].join("\n")
  );

  // ── .n file with null output (references comp_layer, itself is terminal) ──
  writeFixture(
    "good-project.toe.dir/null_output.n",
    [
      "TOP:null",
      "tile 550 200 130 90",
      "flags =  viewer 1 parlanguage 0",
      "inputs",
      "{",
      "0\tcomp_layer",
      "}",
      "color 0.5 0.5 0.5",
      "end",
    ].join("\n")
  );

  // ── TOC for good project ──
  writeFixture(
    "good-project.toe.dir/.toc",
    [
      "noise_base.n",
      "noise_base.parm",
      "level_adjust.n",
      "comp_layer.n",
      "null_output.n",
      "script1.text",
      "chopexec1.text",
    ].join("\n")
  );

  // ── Bad .n files ──
  writeFixture(
    "bad-project.toe.dir/no_end.n",
    ["TOP:noise", "tile 100 200 130 90", "color 0.5 0.5 0.5"].join("\n")
  );

  writeFixture(
    "bad-project.toe.dir/bad_family.n",
    ["INVALID:noise", "tile 100 200 130 90", "end"].join("\n")
  );

  writeFixture("bad-project.toe.dir/empty.n", "");

  writeFixture(
    "bad-project.toe.dir/no_colon.n",
    ["just some text", "end"].join("\n")
  );

  writeFixture(
    "bad-project.toe.dir/spaces_in_inputs.n",
    [
      "TOP:level",
      "tile 250 200 130 90",
      "flags =  viewer 1 parlanguage 0",
      "inputs",
      "{",
      "0 noise_base",
      "}",
      "color 0.5 0.5 0.5",
      "end",
    ].join("\n")
  );

  writeFixture(
    "bad-project.toe.dir/bad_input_index.n",
    [
      "TOP:level",
      "tile 250 200 130 90",
      "flags =  viewer 1 parlanguage 0",
      "inputs",
      "{",
      "abc\tnoise_base",
      "}",
      "color 0.5 0.5 0.5",
      "end",
    ].join("\n")
  );

  // ── Valid .parm file ──
  writeFixture(
    "good-project.toe.dir/noise_base.parm",
    ["?", "resolutionw 0 1920", "resolutionh 0 1080", "period 17 1.5", "?"].join("\n")
  );

  // ── Bad .parm files ──
  writeFixture(
    "bad-project.toe.dir/no_start.parm",
    ["resolutionw 0 1920", "?"].join("\n")
  );

  writeFixture(
    "bad-project.toe.dir/no_end.parm",
    ["?", "resolutionw 0 1920"].join("\n")
  );

  writeFixture(
    "bad-project.toe.dir/bad_flags.parm",
    ["?", "resolutionw abc 1920", "?"].join("\n")
  );

  writeFixture(
    "bad-project.toe.dir/unusual_flags.parm",
    ["?", "resolutionw 99 1920", "?"].join("\n")
  );

  // ── Valid .text file (binary format) ──
  writeFixture(
    "good-project.toe.dir/script1.text",
    makeTdTextFile("print('hello world')\n")
  );

  // ── Bad .text files ──
  writeFixture(
    "bad-project.toe.dir/plaintext.text",
    "print('hello world')\n"
  );

  writeFixture(
    "bad-project.toe.dir/tooshort.text",
    Buffer.from([0x32, 0x0a, 0x2a, 0x00])
  );

  // ── ChopExec .text with missing callbacks ──
  writeFixture(
    "good-project.toe.dir/chopexec1.text",
    makeTdTextFile(
      [
        "def onOffToOn(channel, sampleIndex, val, prev):",
        "    pass",
        "def onOnToOff(channel, sampleIndex, val, prev):",
        "    pass",
        "def onValueChange(channel, sampleIndex, val, prev):",
        "    pass",
        "def whileOn(channel, sampleIndex, val, prev):",
        "    pass",
      ].join("\n")
    )
  );

  writeFixture(
    "bad-project.toe.dir/chopexec_missing.text",
    makeTdTextFile("def onOffToOn(channel, sampleIndex, val, prev):\n    pass\n")
  );

  // ── TOC files ──
  writeFixture(
    "toc-project.toe.dir/node1.n",
    ["TOP:noise", "tile 100 200 130 90", "end"].join("\n")
  );
  writeFixture(
    "toc-project.toe.dir/node1.parm",
    ["?", "period 0 1.0", "?"].join("\n")
  );
  writeFixture(
    "toc-project.toe.dir/.toc",
    ["node1.n", "node1.parm"].join("\n")
  );

  // ── TOC with missing entry ──
  writeFixture(
    "toc-missing.toe.dir/node1.n",
    ["TOP:noise", "tile 100 200 130 90", "end"].join("\n")
  );
  writeFixture(
    "toc-missing.toe.dir/.toc",
    ["node1.n", "node1.parm", "missing_file.n"].join("\n")
  );

  // ── TOC with unlisted file ──
  writeFixture(
    "toc-unlisted.toe.dir/node1.n",
    ["TOP:noise", "tile 100 200 130 90", "end"].join("\n")
  );
  writeFixture(
    "toc-unlisted.toe.dir/extra.parm",
    ["?", "period 0 1.0", "?"].join("\n")
  );
  writeFixture(
    "toc-unlisted.toe.dir/.toc",
    ["node1.n"].join("\n")
  );

  // ── Wiring project (bad reference) ──
  writeFixture(
    "wiring-project.toe.dir/noise_base.n",
    [
      "TOP:noise",
      "tile 100 200 130 90",
      "flags =  viewer 1 parlanguage 0",
      "color 0.5 0.5 0.5",
      "end",
    ].join("\n")
  );
  writeFixture(
    "wiring-project.toe.dir/level_adjust.n",
    [
      "TOP:level",
      "tile 250 200 130 90",
      "flags =  viewer 1 parlanguage 0",
      "inputs",
      "{",
      "0\tnoize_base",
      "}",
      "color 0.5 0.5 0.5",
      "end",
    ].join("\n")
  );

  // ── Wiring project with case mismatch ──
  writeFixture(
    "wiring-case.toe.dir/Noise_Base.n",
    [
      "TOP:noise",
      "tile 100 200 130 90",
      "flags =  viewer 1 parlanguage 0",
      "color 0.5 0.5 0.5",
      "end",
    ].join("\n")
  );
  writeFixture(
    "wiring-case.toe.dir/level_adjust.n",
    [
      "TOP:level",
      "tile 250 200 130 90",
      "flags =  viewer 1 parlanguage 0",
      "inputs",
      "{",
      "0\tnoise_base",
      "}",
      "color 0.5 0.5 0.5",
      "end",
    ].join("\n")
  );
});

afterAll(() => {
  if (existsSync(FIXTURES)) {
    rmSync(FIXTURES, { recursive: true });
  }
});

// ─── Tests: ValidationResult ───────────────────────────────────────

describe("ValidationResult", () => {
  test("starts empty", () => {
    const r = new ValidationResult();
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
    expect(r.info).toEqual([]);
    expect(r.hasErrors).toBe(false);
    expect(r.hasWarnings).toBe(false);
  });

  test("addError with line number", () => {
    const r = new ValidationResult();
    r.addError("file.n", 5, "bad thing");
    expect(r.errors).toEqual(["file.n:5 - bad thing"]);
    expect(r.hasErrors).toBe(true);
  });

  test("addError without line number", () => {
    const r = new ValidationResult();
    r.addError("file.n", null, "bad thing");
    expect(r.errors).toEqual(["file.n - bad thing"]);
  });

  test("addWarning", () => {
    const r = new ValidationResult();
    r.addWarning("file.n", "minor issue");
    expect(r.warnings).toEqual(["file.n - minor issue"]);
    expect(r.hasWarnings).toBe(true);
  });

  test("addInfo", () => {
    const r = new ValidationResult();
    r.addInfo("some info");
    expect(r.info).toEqual(["some info"]);
  });
});

// ─── Tests: validateNFile ──────────────────────────────────────────

describe("validateNFile", () => {
  test("valid .n file returns node info", () => {
    const r = new ValidationResult();
    const node = validateNFile(
      join(FIXTURES, "good-project.toe.dir/noise_base.n"),
      r
    );
    expect(r.errors).toEqual([]);
    expect(node).not.toBeNull();
    expect(node!.name).toBe("noise_base");
    expect(node!.family).toBe("TOP");
    expect(node!.type).toBe("noise");
    expect(node!.inputs).toEqual({});
  });

  test("valid .n file with inputs", () => {
    const r = new ValidationResult();
    const node = validateNFile(
      join(FIXTURES, "good-project.toe.dir/level_adjust.n"),
      r
    );
    expect(r.errors).toEqual([]);
    expect(node).not.toBeNull();
    expect(node!.inputs).toEqual({ 0: "noise_base" });
  });

  test("valid .n file with multi-inputs", () => {
    const r = new ValidationResult();
    const node = validateNFile(
      join(FIXTURES, "good-project.toe.dir/comp_layer.n"),
      r
    );
    expect(r.errors).toEqual([]);
    expect(node!.inputs).toEqual({ 0: "noise_base", 1: "level_adjust" });
  });

  test("errors on missing end", () => {
    const r = new ValidationResult();
    validateNFile(join(FIXTURES, "bad-project.toe.dir/no_end.n"), r);
    expect(r.errors.length).toBeGreaterThanOrEqual(1);
    expect(r.errors.some((e) => e.includes("end"))).toBe(true);
  });

  test("errors on invalid family", () => {
    const r = new ValidationResult();
    const node = validateNFile(
      join(FIXTURES, "bad-project.toe.dir/bad_family.n"),
      r
    );
    expect(node).toBeNull();
    expect(r.errors.some((e) => e.includes("INVALID"))).toBe(true);
  });

  test("errors on empty file", () => {
    const r = new ValidationResult();
    const node = validateNFile(
      join(FIXTURES, "bad-project.toe.dir/empty.n"),
      r
    );
    expect(node).toBeNull();
    expect(r.errors.length).toBeGreaterThanOrEqual(1);
  });

  test("errors on missing colon in first line", () => {
    const r = new ValidationResult();
    const node = validateNFile(
      join(FIXTURES, "bad-project.toe.dir/no_colon.n"),
      r
    );
    expect(node).toBeNull();
    expect(r.errors.some((e) => e.includes("FAMILY:type"))).toBe(true);
  });

  test("errors on spaces in inputs (must use TAB)", () => {
    const r = new ValidationResult();
    validateNFile(
      join(FIXTURES, "bad-project.toe.dir/spaces_in_inputs.n"),
      r
    );
    expect(r.errors.some((e) => e.includes("SPACES") && e.includes("TAB"))).toBe(true);
  });

  test("errors on non-integer input index", () => {
    const r = new ValidationResult();
    validateNFile(
      join(FIXTURES, "bad-project.toe.dir/bad_input_index.n"),
      r
    );
    expect(r.errors.some((e) => e.includes("index"))).toBe(true);
  });

  test("warns on missing tile/flags/color", () => {
    const r = new ValidationResult();
    // bad_family.n won't get to section checks; use a file missing sections
    writeFixture(
      "missing-sections.toe.dir/bare.n",
      ["TOP:noise", "end"].join("\n")
    );
    const node = validateNFile(
      join(FIXTURES, "missing-sections.toe.dir/bare.n"),
      r
    );
    expect(r.warnings.some((w) => w.includes("tile"))).toBe(true);
    expect(r.warnings.some((w) => w.includes("flags"))).toBe(true);
    expect(r.warnings.some((w) => w.includes("color"))).toBe(true);
  });
});

// ─── Tests: validateParmFile ───────────────────────────────────────

describe("validateParmFile", () => {
  test("valid .parm file has no errors", () => {
    const r = new ValidationResult();
    validateParmFile(
      join(FIXTURES, "good-project.toe.dir/noise_base.parm"),
      r
    );
    expect(r.errors).toEqual([]);
  });

  test("errors on missing start delimiter", () => {
    const r = new ValidationResult();
    validateParmFile(
      join(FIXTURES, "bad-project.toe.dir/no_start.parm"),
      r
    );
    expect(r.errors.some((e) => e.includes("start") && e.includes("?"))).toBe(true);
  });

  test("errors on missing end delimiter", () => {
    const r = new ValidationResult();
    validateParmFile(
      join(FIXTURES, "bad-project.toe.dir/no_end.parm"),
      r
    );
    expect(r.errors.some((e) => e.includes("end") && e.includes("?"))).toBe(true);
  });

  test("errors on non-integer flags", () => {
    const r = new ValidationResult();
    validateParmFile(
      join(FIXTURES, "bad-project.toe.dir/bad_flags.parm"),
      r
    );
    expect(r.errors.some((e) => e.includes("flags"))).toBe(true);
  });

  test("warns on unusual flag values", () => {
    const r = new ValidationResult();
    validateParmFile(
      join(FIXTURES, "bad-project.toe.dir/unusual_flags.parm"),
      r
    );
    expect(r.warnings.some((w) => w.includes("99"))).toBe(true);
  });
});

// ─── Tests: validateTextFile ───────────────────────────────────────

describe("validateTextFile", () => {
  test("valid .text file has no errors", () => {
    const r = new ValidationResult();
    validateTextFile(
      join(FIXTURES, "good-project.toe.dir/script1.text"),
      r
    );
    expect(r.errors).toEqual([]);
  });

  test("errors on plain text (no binary header)", () => {
    const r = new ValidationResult();
    validateTextFile(
      join(FIXTURES, "bad-project.toe.dir/plaintext.text"),
      r
    );
    expect(r.errors.some((e) => e.includes("binary header") || e.includes("plain text"))).toBe(true);
    expect(r.info.some((i) => i.includes("write_td_text_file"))).toBe(true);
  });

  test("errors on file too short", () => {
    const r = new ValidationResult();
    validateTextFile(
      join(FIXTURES, "bad-project.toe.dir/tooshort.text"),
      r
    );
    expect(r.errors.some((e) => e.includes("too short") || e.includes("27"))).toBe(true);
  });

  test("valid chopexec with all callbacks has no warnings", () => {
    const r = new ValidationResult();
    validateTextFile(
      join(FIXTURES, "good-project.toe.dir/chopexec1.text"),
      r
    );
    expect(r.warnings).toEqual([]);
  });

  test("chopexec with missing callbacks warns", () => {
    const r = new ValidationResult();
    validateTextFile(
      join(FIXTURES, "bad-project.toe.dir/chopexec_missing.text"),
      r
    );
    // Should warn about onOnToOff, onValueChange, whileOn
    expect(r.warnings.some((w) => w.includes("onOnToOff"))).toBe(true);
    expect(r.warnings.some((w) => w.includes("onValueChange"))).toBe(true);
    expect(r.warnings.some((w) => w.includes("whileOn"))).toBe(true);
  });
});

// ─── Tests: validateToc ────────────────────────────────────────────

describe("validateToc", () => {
  test("valid toc has no errors", () => {
    const r = new ValidationResult();
    validateToc(
      join(FIXTURES, "toc-project.toe.dir/.toc"),
      join(FIXTURES, "toc-project.toe.dir"),
      r
    );
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
  });

  test("errors on missing file listed in toc", () => {
    const r = new ValidationResult();
    validateToc(
      join(FIXTURES, "toc-missing.toe.dir/.toc"),
      join(FIXTURES, "toc-missing.toe.dir"),
      r
    );
    expect(r.errors.some((e) => e.includes("missing_file.n"))).toBe(true);
  });

  test("warns on file not listed in toc", () => {
    const r = new ValidationResult();
    validateToc(
      join(FIXTURES, "toc-unlisted.toe.dir/.toc"),
      join(FIXTURES, "toc-unlisted.toe.dir"),
      r
    );
    expect(r.warnings.some((w) => w.includes("extra.parm"))).toBe(true);
  });
});

// ─── Tests: validateWiring ─────────────────────────────────────────

describe("validateWiring", () => {
  test("valid wiring has no errors", () => {
    const r = new ValidationResult();
    const nodes: Record<string, NodeInfo> = {
      noise_base: {
        name: "noise_base",
        family: "TOP",
        type: "noise",
        inputs: {},
        path: "noise_base.n",
      },
      level_adjust: {
        name: "level_adjust",
        family: "TOP",
        type: "level",
        inputs: { 0: "noise_base" },
        path: "level_adjust.n",
      },
    };
    validateWiring(nodes, r);
    expect(r.errors).toEqual([]);
  });

  test("errors on reference to non-existent node", () => {
    const r = new ValidationResult();
    const nodes: Record<string, NodeInfo> = {
      level_adjust: {
        name: "level_adjust",
        family: "TOP",
        type: "level",
        inputs: { 0: "noize_base" },
        path: "level_adjust.n",
      },
    };
    validateWiring(nodes, r);
    expect(r.errors.some((e) => e.includes("noize_base"))).toBe(true);
  });

  test("suggests case-insensitive match", () => {
    const r = new ValidationResult();
    const nodes: Record<string, NodeInfo> = {
      Noise_Base: {
        name: "Noise_Base",
        family: "TOP",
        type: "noise",
        inputs: {},
        path: "Noise_Base.n",
      },
      level_adjust: {
        name: "level_adjust",
        family: "TOP",
        type: "level",
        inputs: { 0: "noise_base" },
        path: "level_adjust.n",
      },
    };
    validateWiring(nodes, r);
    expect(r.errors.some((e) => e.includes("Noise_Base"))).toBe(true);
  });

  test("does not warn orphans for source types", () => {
    const r = new ValidationResult();
    const nodes: Record<string, NodeInfo> = {
      noise_src: {
        name: "noise_src",
        family: "TOP",
        type: "noise",
        inputs: {},
        path: "noise_src.n",
      },
      constant_src: {
        name: "constant_src",
        family: "TOP",
        type: "constant",
        inputs: {},
        path: "constant_src.n",
      },
    };
    validateWiring(nodes, r);
    expect(r.warnings).toEqual([]);
  });

  test("warns orphans for non-source types", () => {
    const r = new ValidationResult();
    const nodes: Record<string, NodeInfo> = {
      level_dangling: {
        name: "level_dangling",
        family: "TOP",
        type: "level",
        inputs: {},
        path: "level_dangling.n",
      },
    };
    validateWiring(nodes, r);
    expect(r.warnings.some((w) => w.includes("orphan"))).toBe(true);
  });
});

// ─── Tests: validateProject (integration) ──────────────────────────

describe("validateProject", () => {
  test("good project passes with no errors", () => {
    const r = validateProject(
      join(FIXTURES, "good-project.toe.dir"),
      false
    );
    expect(r.hasErrors).toBe(false);
    expect(r.info.some((i) => i.includes(".n files"))).toBe(true);
  });

  test("bad project has errors", () => {
    const r = validateProject(
      join(FIXTURES, "bad-project.toe.dir"),
      false
    );
    expect(r.hasErrors).toBe(true);
  });

  test("non-existent directory errors", () => {
    const r = validateProject(
      join(FIXTURES, "does-not-exist.toe.dir"),
      false
    );
    expect(r.hasErrors).toBe(true);
    expect(r.errors.some((e) => e.includes("does not exist"))).toBe(true);
  });

  test("wiring project detects bad reference", () => {
    const r = validateProject(
      join(FIXTURES, "wiring-project.toe.dir"),
      false
    );
    expect(r.errors.some((e) => e.includes("noize_base"))).toBe(true);
  });

  test("wiring case mismatch suggests correct name", () => {
    const r = validateProject(
      join(FIXTURES, "wiring-case.toe.dir"),
      false
    );
    expect(r.errors.some((e) => e.includes("Noise_Base"))).toBe(true);
  });
});

// ─── Tests: CLI (exit codes) ───────────────────────────────────────

describe("CLI", () => {
  const script = join(import.meta.dir, "..", "scripts", "validate-toe.ts");

  test("exit code 0 on success", async () => {
    const proc = Bun.spawn(
      ["bun", script, join(FIXTURES, "good-project.toe.dir")],
      { stdout: "pipe", stderr: "pipe" }
    );
    const code = await proc.exited;
    expect(code).toBe(0);
  });

  test("exit code 2 on errors", async () => {
    const proc = Bun.spawn(
      ["bun", script, join(FIXTURES, "bad-project.toe.dir")],
      { stdout: "pipe", stderr: "pipe" }
    );
    const code = await proc.exited;
    expect(code).toBe(2);
  });

  test("exit code 1 on warnings only", async () => {
    // toc-unlisted has only warnings (unlisted file), the .n file is minimal but valid
    const proc = Bun.spawn(
      ["bun", script, join(FIXTURES, "toc-unlisted.toe.dir")],
      { stdout: "pipe", stderr: "pipe" }
    );
    const code = await proc.exited;
    expect(code).toBe(1);
  });

  test("exit code 2 on missing dir", async () => {
    const proc = Bun.spawn(
      ["bun", script, join(FIXTURES, "nonexistent.toe.dir")],
      { stdout: "pipe", stderr: "pipe" }
    );
    const code = await proc.exited;
    expect(code).toBe(2);
  });

  test("--verbose flag accepted", async () => {
    const proc = Bun.spawn(
      ["bun", script, join(FIXTURES, "good-project.toe.dir"), "--verbose"],
      { stdout: "pipe", stderr: "pipe" }
    );
    const code = await proc.exited;
    expect(code).toBe(0);
  });

  test("no args shows usage and exits 2", async () => {
    const proc = Bun.spawn(
      ["bun", script],
      { stdout: "pipe", stderr: "pipe" }
    );
    const stdout = await new Response(proc.stdout).text();
    const code = await proc.exited;
    expect(code).toBe(2);
    expect(stdout).toContain("Usage");
  });
});
