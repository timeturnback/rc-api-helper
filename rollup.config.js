import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
    sourcemap: true,
  },
  external: [
    "dayjs",
    "dayjs/plugin/utc",
    "dayjs/plugin/duration",
    "dayjs/plugin/timezone",
    "dayjs/plugin/relativeTime",
    "ethers",
    "apisauce",
    "axios",
  ],
  plugins: [
    typescript({
      declaration: true,
      declarationDir: "./dist",
      rootDir: "./src",
    }),
  ],
};
