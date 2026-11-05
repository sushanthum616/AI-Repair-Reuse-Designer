// @vitest-environment node

import { fileURLToPath } from "node:url";
import path from "node:path";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("../..", import.meta.url));
const eslint = new ESLint({ cwd: projectRoot });

describe("browser/server import boundary", () => {
  it("rejects relative server imports from presentation modules", async () => {
    const messages = await lint(
      'import secret from "../server/secret";\nexport const value = secret;',
      "components/boundary-probe.tsx",
    );

    expect(messages).toContain("no-restricted-imports");
  }, 30_000);

  it("rejects static and dynamic server imports from app client modules", async () => {
    const staticMessages = await lint(
      '"use client";\nimport secret from "@/server/secret";\nexport const value = secret;',
      "app/boundary-probe.tsx",
    );
    const dynamicMessages = await lint(
      '"use client";\nexport const load = () => import("../server/secret");',
      "app/dynamic-boundary-probe.tsx",
    );

    expect(staticMessages).toContain("project-boundaries/no-client-server-imports");
    expect(dynamicMessages).toContain("project-boundaries/no-client-server-imports");
  }, 30_000);

  it("allows server components to import server modules", async () => {
    const messages = await lint(
      'import secret from "@/server/secret";\nexport const value = secret;',
      "app/server-component-probe.tsx",
    );

    expect(messages).not.toContain("project-boundaries/no-client-server-imports");
  }, 30_000);
});

async function lint(source: string, fileName: string) {
  const [result] = await eslint.lintText(source, {
    filePath: path.join(projectRoot, fileName),
  });

  return result.messages.map((message) => message.ruleId);
}
