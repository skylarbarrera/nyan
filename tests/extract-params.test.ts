import { describe, it, expect } from "bun:test";
import { execSync } from "child_process";
import { join } from "path";

const SCRIPT = join(import.meta.dir, "..", "scripts", "extract-params.ts");

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

describe("CLI", () => {
  it("exit code 2 with no args", () => {
    const { exitCode, stdout } = run("");
    expect(exitCode).toBe(2);
    expect(stdout).toContain("Usage:");
  });

  it("exit code 1 for unknown operator", () => {
    const { exitCode, stderr } = run("nonexistent_xyz_abc");
    expect(exitCode).toBe(1);
    expect(stderr).toContain("not found");
  });

  it("exit code 0 for valid operator", () => {
    const { exitCode } = run("noise_top");
    expect(exitCode).toBe(0);
  });
});

describe("Fuzzy matching", () => {
  it("matches direct filename", () => {
    const { stdout } = run("noise_top");
    expect(stdout).toContain("Noise TOP");
  });

  it("matches display name with spaces", () => {
    const { stdout } = run('"Audio Device In"');
    expect(stdout).toContain("Audio Device In CHOP");
  });

  it("matches without family suffix", () => {
    const { stdout } = run("level_top");
    expect(stdout).toContain("Level TOP");
  });
});

describe("noise_top extraction", () => {
  const output = run("noise_top").stdout;

  it("has header with name and category", () => {
    expect(output).toContain("# Noise TOP (TOP)");
  });

  it("extracts type parameter", () => {
    expect(output).toMatch(/^\s+type\s+#/m);
  });

  it("extracts seed as separate parameter", () => {
    expect(output).toMatch(/^\s+seed\s+#/m);
  });

  it("extracts period parameter", () => {
    expect(output).toMatch(/^\s+period\s+#/m);
  });

  it("extracts harmon parameter", () => {
    expect(output).toMatch(/^\s+harmon\s+#/m);
  });

  it("type has proper menu items", () => {
    const typeLine = output.split("\n").find((l: string) => l.match(/^\s+type\s+#/));
    expect(typeLine).toBeDefined();
    expect(typeLine).toContain("perlin2d");
    expect(typeLine).toContain("simplex2d");
    expect(typeLine).toContain("sparse");
  });

  it("type description does not start with dash", () => {
    const typeLine = output.split("\n").find((l: string) => l.match(/^\s+type\s+#/));
    expect(typeLine).toBeDefined();
    expect(typeLine).not.toMatch(/#\s*-\s/);
  });

  it("extracts transform params (xord, t, r, s, p)", () => {
    expect(output).toMatch(/^\s+xord\s+#/m);
    expect(output).toMatch(/^\s+t\s+#/m);
    expect(output).toMatch(/^\s+r\s+#/m);
    expect(output).toMatch(/^\s+s\s+#/m);
    expect(output).toMatch(/^\s+p\s+#/m);
  });

  it("extracts rgb with menu items", () => {
    const rgbLine = output.split("\n").find((l: string) => l.match(/^\s+rgb\s+#/));
    expect(rgbLine).toBeDefined();
    expect(rgbLine).toContain("noise");
    expect(rgbLine).toContain("multiply");
  });

  it("extracts alpha with menu items", () => {
    const alphaLine = output.split("\n").find((l: string) => l.match(/^\s+alpha\s+#/));
    expect(alphaLine).toBeDefined();
    expect(alphaLine).toContain("zero");
    expect(alphaLine).toContain("one");
    expect(alphaLine).toContain("random");
  });

  it("omits common TOP params", () => {
    expect(output).toContain("## Common (omitted):");
    expect(output).toContain("outputresolution");
    expect(output).toContain("format");
    expect(output).toContain("chanmask");
  });

  it("shows total parameter count", () => {
    expect(output).toMatch(/# Total: \d+ parameters/);
  });
});

describe("level_top extraction", () => {
  const output = run("level_top").stdout;

  it("extracts opacity", () => {
    expect(output).toMatch(/^\s+opacity\s+#/m);
  });

  it("extracts brightness1", () => {
    expect(output).toMatch(/^\s+brightness1\s+#/m);
  });

  it("extracts contrast", () => {
    expect(output).toMatch(/^\s+contrast\s+#/m);
  });

  it("extracts gamma1", () => {
    expect(output).toMatch(/^\s+gamma1\s+#/m);
  });
});

describe("Audio Device In extraction", () => {
  const output = run('"Audio Device In"').stdout;

  it("extracts driver with menu", () => {
    const driverLine = output.split("\n").find((l: string) => l.match(/^\s+driver\s+#/));
    expect(driverLine).toBeDefined();
    expect(driverLine).toContain("[");
  });

  it("extracts active parameter", () => {
    expect(output).toMatch(/^\s+active\s+#/m);
  });

  it("omits common CHOP params", () => {
    expect(output).toContain("## Common (omitted):");
    expect(output).toContain("timeslice");
  });
});

describe("POP extraction", () => {
  const output = run("noise_pop").stdout;

  it("returns more than 0 params", () => {
    expect(output).not.toContain("# Total: 0 parameters");
    expect(output).toMatch(/# Total: \d+ parameters/);
  });

  it("extracts type parameter", () => {
    expect(output).toMatch(/^\s+type\s+#/m);
  });

  it("extracts seed parameter", () => {
    expect(output).toMatch(/^\s+seed\s+#/m);
  });

  it("extracts period parameter", () => {
    expect(output).toMatch(/^\s+period\s+#/m);
  });

  it("extracts harmon parameter", () => {
    expect(output).toMatch(/^\s+harmon\s+#/m);
  });

  it("type has menu items (perlin2d, simplex2d)", () => {
    const typeLine = output.split("\n").find((l: string) => l.match(/^\s+type\s+#/));
    expect(typeLine).toBeDefined();
    expect(typeLine).toContain("perlin2d");
    expect(typeLine).toContain("simplex2d");
  });

  it("has no duplicate param IDs", () => {
    const paramLines = output.split("\n").filter((l: string) => l.match(/^\s+\w+\s+#/));
    const ids = paramLines.map((l: string) => l.trim().split(/\s+/)[0]);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });

  it("skips menu value entries (perlin2d is not a param)", () => {
    // perlin2d is a menu option value under type, not a real param
    expect(output).not.toMatch(/^\s+perlin2d\s+#/m);
  });

  it("skips single-char name P", () => {
    // P is a generic placeholder, not a real param name
    expect(output).not.toMatch(/^\s+P\s+#/m);
  });

  it("extracts amp parameter", () => {
    expect(output).toMatch(/^\s+amp\s+#/m);
  });

  it("extracts combineop with menu items", () => {
    const line = output.split("\n").find((l: string) => l.match(/^\s+combineop\s+#/));
    expect(line).toBeDefined();
    expect(line).toContain("set");
    expect(line).toContain("add");
  });
});

describe("--verbose flag", () => {
  it("shows common params in verbose mode", () => {
    const { stdout } = run("noise_top --verbose");
    expect(stdout).toContain("## Common Parameters (shared across family)");
    expect(stdout).not.toContain("## Common (omitted):");
  });

  it("default mode omits common params", () => {
    const { stdout } = run("noise_top");
    expect(stdout).toContain("## Common (omitted):");
    expect(stdout).not.toContain("## Common Parameters (shared across family)");
  });
});
