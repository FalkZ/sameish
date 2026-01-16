import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
    build: {
        lib: {
            entry: {
                sameish: "./sameish.ts",
                "sameish-optimized": "./sameish-optimized.ts",
            },
            formats: ["es"],
        },
        outDir: "build",
        rollupOptions: {
            external: [],
        },
    },
    plugins: [
        dts({
            rollupTypes: true,
            include: ["sameish.ts", "sameish-optimized.ts", "types.ts"],
        }),
    ],
});
