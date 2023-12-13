import dts from "bun-plugin-dts";

await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist/esm',
    target: 'browser',
    format: 'esm',
    plugins: [
        dts(),
    ],
    external: ['react'],
});