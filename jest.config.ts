import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  displayName: "unit",
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
  moduleNameMapper: {
    "^@/lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
    "^@/content/(.*)$": "<rootDir>/src/content/$1",
    "^@/hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@/test/(.*)$": "<rootDir>/src/test/$1",
    "^@/auth$": "<rootDir>/auth.ts",
    "^@/(.*)$": "<rootDir>/$1",
  },
  clearMocks: true,
};

export default createJestConfig(config);
