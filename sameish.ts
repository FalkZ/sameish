import { diff } from "@vitest/utils/diff";

import { sameish as samishOptimized } from "./sameish-optimized";
import type { SameishArgs } from "./types";

export * from "./types";

const diffPretty = <Before, After>(before: Before, after: After) =>
    diff(after, before, {
        aAnnotation: "add",
        bAnnotation: "remove",
        aIndicator: "+",
        bIndicator: "-",
        omitAnnotationLines: true,
    }) ?? "";

export const sameish = <Before, After>({
    before,
    after,
    comparePaths,
    ignoreOrderPaths,
    logDiff,
    logFunction,
    diffFunction = diffPretty,
}: SameishArgs<Before, After>) =>
    samishOptimized({
        before,
        after,
        comparePaths,
        ignoreOrderPaths,
        logDiff,
        logFunction,
        diffFunction,
    });
