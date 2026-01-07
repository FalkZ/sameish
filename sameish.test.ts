import { describe, expect, mock, test } from "bun:test";

import { sameish } from "./sameish";

describe("sameish", () => {
    describe("basic equality", () => {
        test("returns true for identical objects", () => {
            const obj = { a: 1, b: 2 };
            expect(sameish({ before: obj, after: obj })).toBe(true);
        });

        test("returns true for equal objects", () => {
            expect(
                sameish({
                    before: { a: 1, b: 2 },
                    after: { a: 1, b: 2 },
                }),
            ).toBe(true);
        });

        test("returns false for different objects", () => {
            expect(
                sameish({
                    before: { a: 1 },
                    after: { a: 2 },
                }),
            ).toBe(false);
        });

        test("returns true for empty objects", () => {
            expect(sameish({ before: {}, after: {} })).toBe(true);
        });

        test("returns true for deeply nested equal objects", () => {
            expect(
                sameish({
                    before: { a: { b: { c: 1 } } },
                    after: { a: { b: { c: 1 } } },
                }),
            ).toBe(true);
        });

        test("returns false for deeply nested different objects", () => {
            expect(
                sameish({
                    before: { a: { b: { c: 1 } } },
                    after: { a: { b: { c: 2 } } },
                }),
            ).toBe(false);
        });
    });

    describe("comparePaths", () => {
        test("compares only specified paths", () => {
            expect(
                sameish({
                    before: { a: 1, b: 2 },
                    after: { a: 1, b: 999 },
                    comparePaths: ["a"],
                }),
            ).toBe(true);
        });

        test("returns false when specified path differs", () => {
            expect(
                sameish({
                    before: { a: 1, b: 2 },
                    after: { a: 999, b: 2 },
                    comparePaths: ["a"],
                }),
            ).toBe(false);
        });

        test("handles nested paths", () => {
            expect(
                sameish({
                    before: { user: { name: "alice", age: 30 } },
                    after: { user: { name: "alice", age: 99 } },
                    comparePaths: ["user.name"],
                }),
            ).toBe(true);
        });

        test("handles multiple paths", () => {
            expect(
                sameish({
                    before: { a: 1, b: 2, c: 3 },
                    after: { a: 1, b: 2, c: 999 },
                    comparePaths: ["a", "b"],
                }),
            ).toBe(true);
        });

        test("handles undefined values at paths", () => {
            expect(
                sameish({
                    before: { a: 1 },
                    after: { b: 2 },
                    comparePaths: ["a"],
                }),
            ).toBe(false);
        });
    });

    describe("ignoreOrderPaths", () => {
        test("treats arrays as sets (order-independent)", () => {
            expect(
                sameish({
                    before: { items: [1, 2, 3] },
                    after: { items: [3, 1, 2] },
                    ignoreOrderPaths: ["items"],
                }),
            ).toBe(true);
        });

        test("returns false for different array contents", () => {
            expect(
                sameish({
                    before: { items: [1, 2, 3] },
                    after: { items: [1, 2, 4] },
                    ignoreOrderPaths: ["items"],
                }),
            ).toBe(false);
        });

        test("works with arrays of objects", () => {
            expect(
                sameish({
                    before: { users: [{ id: 1 }, { id: 2 }] },
                    after: { users: [{ id: 2 }, { id: 1 }] },
                    ignoreOrderPaths: ["users"],
                }),
            ).toBe(true);
        });

        test("handles nested array paths", () => {
            expect(
                sameish({
                    before: { data: { tags: ["a", "b", "c"] } },
                    after: { data: { tags: ["c", "a", "b"] } },
                    ignoreOrderPaths: ["data.tags"],
                }),
            ).toBe(true);
        });

        test("ignores non-array values at set paths", () => {
            expect(
                sameish({
                    before: { value: "not-an-array" },
                    after: { value: "not-an-array" },
                    ignoreOrderPaths: ["value"],
                }),
            ).toBe(true);
        });
    });

    describe("combined comparePaths and ignoreOrderPaths", () => {
        test("filters paths and treats as set", () => {
            expect(
                sameish({
                    before: { items: [1, 2, 3], other: "a" },
                    after: { items: [3, 2, 1], other: "b" },
                    comparePaths: ["items"],
                    ignoreOrderPaths: ["items"],
                }),
            ).toBe(true);
        });
    });

    describe("logDiff", () => {
        test("calls logFunction when logDiff is true", () => {
            const logFn = mock(() => {});

            sameish({
                before: { a: 1 },
                after: { a: 2 },
                logDiff: true,
                logFunction: logFn,
            });

            expect(logFn).toHaveBeenCalled();
        });

        test("does not call logFunction when logDiff is false", () => {
            const logFn = mock(() => {});

            sameish({
                before: { a: 1 },
                after: { a: 2 },
                logDiff: false,
                logFunction: logFn,
            });

            expect(logFn).not.toHaveBeenCalled();
        });

        test("passes diff string to logFunction", () => {
            let capturedDiff: string | undefined;
            const logFn = (diff: string) => {
                capturedDiff = diff;
            };

            sameish({
                before: { a: 1 },
                after: { a: 2 },
                logDiff: true,
                logFunction: logFn,
            });

            expect(capturedDiff).toBeDefined();
            expect(typeof capturedDiff).toBe("string");
        });
    });
});
