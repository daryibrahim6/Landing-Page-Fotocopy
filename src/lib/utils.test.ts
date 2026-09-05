import { describe, it, expect } from "vitest";
import { cn, formatRupiah } from "./utils";

describe("cn", () => {
  it("merges tailwind classes", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toContain("px-4");
    expect(result).toContain("py-1");
    expect(result).not.toContain("px-2");
  });

  it("filters falsy values", () => {
    expect(cn("px-2", false && "hidden", "py-1")).toBe("px-2 py-1");
  });
});

describe("formatRupiah", () => {
  it("formats number as IDR currency", () => {
    expect(formatRupiah(15000)).toBe("Rp 15.000");
  });
});
