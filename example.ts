import { sameish } from "./sameish";

const before = {
    user: {
        name: "Bob",
        preferences: { notifications: ["email", "sms", "push"] },
    },
    system: { version: "1.0.0", debug: true },
    metadata: { created: "2025-01-01" },
};

const after = {
    user: {
        name: "Alice",
        preferences: { notifications: ["push", "email", "sms"] },
    },
    metadata: { created: "2025-01-18" },
    system: { version: "1.0.1", debug: false },
};

const same = sameish({
    before,
    after,
    comparePaths: ["user.name", "user.preferences.notifications"],
    ignoreOrderPaths: ["user.preferences.notifications"],
    logDiff: true,
});

console.log("Is the same:", same);
