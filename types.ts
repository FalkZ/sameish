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

export type SameishArgs<Before, After> = {
    before: Before;
    after: After;
    logDiff?: boolean;
    logFunction?: (diff: string) => void;
    diffFunction?: (before: Partial<Before>, after: Partial<After>) => string;
    comparePaths?: Paths<Before | After>[];
    ignoreOrderPaths?: Paths<Before | After>[];
};
