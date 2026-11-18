
import { describe, expect, it } from "vitest";
import { canEdit, canShare } from "../src/lib/permissions";

describe("Document permissions", () => {
  describe("canEdit", () => {
    it("allows the owner to edit", () => {
      expect(canEdit("OWNER")).toBe(true);
    });

    it("allows editors to edit", () => {
      expect(canEdit("EDITOR")).toBe(true);
    });

    it("prevents viewers from editing", () => {
      expect(canEdit("VIEWER")).toBe(false);
    });
  });

  describe("canShare", () => {
    it("allows the owner to share documents", () => {
      expect(canShare("OWNER")).toBe(true);
    });

    it("prevents editors from sharing documents", () => {
      expect(canShare("EDITOR")).toBe(false);
    });

    it("prevents viewers from sharing documents", () => {
      expect(canShare("VIEWER")).toBe(false);
    });
  });
});
