import { describe, expect, test } from "bun:test";

import { sameish } from "./sameish";
import {
    addRandomChange,
    createNestedRandomObject,
    insertRandomArray,
    scrambleArrayAtPath,
    scrambleObjectKeys,
} from "./sameish.fuzz.utils";

const expectInternal = (
    before: object,
    after: object,
    expectEqual: boolean,
    ignoreOrderPaths?: string[],
) => {
    try {
        let diff: string | undefined;

        const isSame = sameish({
            before,
            after,
            logDiff: true,
            ignoreOrderPaths,
            logFunction: (d) => {
                diff = d;
            },
        });

        expect(isSame, "isSame and diff are different").toBe(
            diff!.includes("Compared values have no visual difference."),
        );

        if (expectEqual) {
            expect(isSame).toBe(true);
            expect(diff).toContain(
                "Compared values have no visual difference.",
            );
        } else {
            expect(isSame).toBe(false);
            expect(diff).not.toContain(
                "Compared values have no visual difference.",
            );
        }
    } catch (error) {
        Bun.write(
            Bun.file("./failed.json"),
            JSON.stringify({ before, after, ignoreOrderPaths }, null, 2),
        );
        throw error;
    }
};

const expectSame = (
    before: object,
    after: object,
    ignoreOrderPaths?: string[],
) => expectInternal(before, after, true, ignoreOrderPaths);

const expectDifferent = (
    before: object,
    after: object,
    ignoreOrderPaths?: string[],
) => expectInternal(before, after, false, ignoreOrderPaths);

describe("sameish", () => {
    test("fuzzing", () => {
        let iteration = 0;
        while (true) {
            console.log("iteration:", ++iteration);
            const source = createNestedRandomObject();

            const scrambled = scrambleObjectKeys(source);
            expectSame(source, scrambled);

            const mutated = addRandomChange(scrambled);
            expectDifferent(source, mutated);

            const [withRandomArray, pathRandomArray] =
                insertRandomArray(source);

            const withRandomArrayScrambled = scrambleArrayAtPath(
                withRandomArray,
                pathRandomArray,
            );

            expectDifferent(withRandomArray, withRandomArrayScrambled);

            expectSame(withRandomArray, withRandomArrayScrambled, [
                pathRandomArray,
            ]);
        }
    });
});
