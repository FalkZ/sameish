import dts from "bun-plugin-dts";

await Bun.build({
    entrypoints: ["./sameish.ts"],
    outdir: "./build",
    target: "browser",
    plugins: [dts()],
});
