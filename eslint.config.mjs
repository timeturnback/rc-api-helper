import tsLibConfig from "rc-eslint-react/ts-lib.js";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "out/**", "public/**", ".turbo/**"],
  },
  ...tsLibConfig.map((config) => {
    // Ensure we use the correct tsconfig.json for this project
    if (config.languageOptions?.parserOptions?.project) {
      return {
        ...config,
        languageOptions: {
          ...config.languageOptions,
          parserOptions: {
            ...config.languageOptions.parserOptions,
            project: "./tsconfig.json",
          },
        },
      };
    }
    return config;
  }),
];
