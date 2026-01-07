import deepGet from "dlv";
import { dset as deepSet } from "dset";
import equals from "fast-deep-equal";
import stringify from "fast-json-stable-stringify";

import { diff } from "@vitest/utils/diff";

type Primitive = string | number | boolean | bigint | symbol | undefined | null;

type NonRecursiveType = Primitive | Function | Date | RegExp;

export type Paths<T> = T extends NonRecursiveType
    ? never
    : T extends readonly unknown[]
      ? number extends T["length"]
          ? `${number}` | `${number}.${Paths<T[number]>}`
          : keyof T & `${number}` extends infer K extends string
            ? K | `${K}.${Paths<T[K & keyof T]>}`
            : never
      : T extends object
        ? {
              [K in keyof T & (string | number)]:
                  | `${K}`
                  | `${K}.${Paths<T[K]>}`;
          }[keyof T & (string | number)]
        : never;

const withUndefined = (obj: unknown): unknown => {
    if (obj === undefined)
        return "__undefined_sameish_06d0ef49-2162-4fa7-abb2-9cae431c185f__";
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(withUndefined);

    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj as object)) {
        result[key] = withUndefined((obj as Record<string, unknown>)[key]);
    }
    return result;
};

const stringifySafe = (obj: object) => stringify(withUndefined(obj));

export type SameishArgs<Before, After> = {
    before: Before;
    after: After;
    logDiff?: boolean;
    logFunction?: (diff: string) => void;
    comparePaths?: Paths<Before | After>[];
    ignoreOrderPaths?: Paths<Before | After>[];
};

const normalize = (
    obj: object,
    comparePaths: string[] | undefined,
    ignoreOrderPaths: string[] | undefined,
) => {
    let clone: object = {};

    if (comparePaths && comparePaths.length) {
        for (const path of comparePaths) {
            const value = deepGet(obj as object, path);
            deepSet(clone, path, value);
        }
    } else {
        clone = structuredClone(obj as object);
    }

    if (ignoreOrderPaths) {
        for (const path of ignoreOrderPaths) {
            const value = deepGet(clone, path);

            if (Array.isArray(value)) {
                // sort in place
                value.sort((a, b) =>
                    stringifySafe(a) < stringifySafe(b) ? -1 : 1,
                );
            }
        }
    }

    return clone;
};

export const sameish = <Before, After>({
    before,
    after,
    comparePaths,
    ignoreOrderPaths,
    logDiff,
    logFunction = console.log,
}: SameishArgs<Before, After>) => {
    const beforeNormalized = normalize(
        before as object,
        comparePaths as string[] | undefined,
        ignoreOrderPaths as string[] | undefined,
    );
    const afterNormalized = normalize(
        after as object,
        comparePaths as string[] | undefined,
        ignoreOrderPaths as string[] | undefined,
    );

    if (logDiff) {
        const diffLog = diff(afterNormalized, beforeNormalized, {
            aAnnotation: "add",
            bAnnotation: "remove",
            aIndicator: "+",
            bIndicator: "-",
            omitAnnotationLines: true,
        });

        logFunction(diffLog ?? "");
    }

    return equals(beforeNormalized, afterNormalized);
};
