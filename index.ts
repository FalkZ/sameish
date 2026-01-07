import { sameish } from "./sameish";

sameish({
    before: { count: 1 },
    after: { count: 2, test: { a: "" } },
    logDiff: true,
});
