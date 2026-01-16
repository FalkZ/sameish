# sameish

A lightweight library for comparing JavaScript objects, designed with debugging in mind.

Including the following features:

- Pick specific fields to compare
- Ignore array order for specific fields
- Debug with human readable diff output
- Type safety when picking fields
- Works in browsers and on the server

## Installation

```bash
npm install sameish
```

## Usage

```typescript
import { sameish } from "sameish";
```

### Basic Comparison

```typescript
const before = { name: "Alice", age: 30 };
const after = { age: 30, name: "Alice" };

sameish({ before, after }); // true
```

### Compare Specific Paths

Compare only certain object paths using `comparePaths`:

```typescript
const before = { user: { name: "Alice" }, meta: { updated: 1 } };
const after = { user: { name: "Alice" }, meta: { updated: 2 } };

sameish({
    before,
    after,
    comparePaths: ["user.name"],
}); // true (ignores meta.updated)
```

### Ignore Array Order

Compare arrays without considering element order using `ignoreOrderPaths`:

```typescript
const before = { tags: ["b", "a", "c"] };
const after = { tags: ["a", "b", "c"] };

sameish({
    before,
    after,
    ignoreOrderPaths: ["tags"],
}); // true
```

### Debug with Diff Output

Enable `logDiff` to print differences:

```typescript
sameish({
    before: { count: 1 },
    after: { count: 2 },
    logDiff: true,
}); // false
```

Logs the following to the console:

```diff
{
+   "count": 2,
-   "count": 1,
}
```

Use a custom log function:

```typescript
sameish({
    before,
    after,
    logDiff: true,
    logFunction: (diff) => myLogger.debug(diff),
});
```

# Optimize Bundle Size

If you are worried of bundle size in production, you can use the optimized version of `sameish`. E.g. in vite:

```typescript
export default defineConfig(({ mode }) => ({
    resolve: {
        alias: mode === "production" ? { sameish: "sameish/optimized" } : {},
    },
}));
```

This will massively reduce the bundle size, since the human readable diff will not be bundled.

Here are the size differences:

| Import              |     Size |  Gzipped |
| :------------------ | -------: | -------: |
| `sameish`           | 48.77 kB | 14.08 kB |
| `sameish/optimized` |  4.11 kB |  1.57 kB |
