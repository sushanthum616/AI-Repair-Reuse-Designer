import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const serverImportPattern = /(?:^@\/server(?:\/|$)|(?:^|\/)server(?:\/|$))/;

const noClientServerImports = {
  meta: {
    type: "problem",
    docs: {
      description: "Prevent client modules from importing privileged server modules",
    },
    schema: [],
    messages: {
      forbidden:
        "Client modules must not import privileged server code. Move the boundary to a server module.",
    },
  },
  create(context) {
    const isClientModule = context.sourceCode.ast.body.some(
      (statement) =>
        statement.type === "ExpressionStatement" && statement.directive === "use client",
    );

    if (!isClientModule) {
      return {};
    }

    function checkSource(node, source) {
      if (typeof source?.value === "string" && serverImportPattern.test(source.value)) {
        context.report({ node: source ?? node, messageId: "forbidden" });
      }
    }

    return {
      ImportDeclaration(node) {
        checkSource(node, node.source);
      },
      ExportNamedDeclaration(node) {
        checkSource(node, node.source);
      },
      ExportAllDeclaration(node) {
        checkSource(node, node.source);
      },
      ImportExpression(node) {
        checkSource(node, node.source);
      },
    };
  },
};

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "features/**/*.{ts,tsx}"],
    plugins: {
      "project-boundaries": {
        rules: {
          "no-client-server-imports": noClientServerImports,
        },
      },
    },
    rules: {
      "project-boundaries/no-client-server-imports": "error",
    },
  },
  {
    files: ["components/**/*.{ts,tsx}", "features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/server",
                "@/server/**",
                "**/server",
                "**/server/**",
                "../server",
                "../server/**",
                "../../server",
                "../../server/**",
                "../../../server",
                "../../../server/**",
                "../../../../server",
                "../../../../server/**",
              ],
              message:
                "Shared UI and feature presentation modules must not import privileged server code.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "coverage/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);
