export function safeInternalPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://local.invalid");
    const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    if (
      parsed.origin !== "https://local.invalid" ||
      !normalized.startsWith("/") ||
      normalized.startsWith("//") ||
      normalized.includes("\\")
    ) {
      return fallback;
    }
    return normalized;
  } catch {
    return fallback;
  }
}
