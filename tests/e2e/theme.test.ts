import { test, expect, type Page } from "@playwright/test";

const defaultSystemTheme = "dark";
test.use({
  colorScheme: defaultSystemTheme,
});

test("defaults to system's theme", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    defaultSystemTheme
  );
  await page.getByRole("link", { name: /theme/i }).click();
  await assertSelectedThemeOption(/system/i, page);
});

test("switches to Light theme", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /theme/i }).click();
  await page.getByRole("link", { name: /light/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await assertSelectedThemeOption(/light/i, page);
});

test("switches to Dark theme", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /theme/i }).click();
  await page.getByRole("link", { name: /dark/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await assertSelectedThemeOption(/dark/i, page);
});

test("switches to System theme", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /theme/i }).click();
  await page.getByRole("link", { name: /light/i }).click();
  await page.getByRole("link", { name: /system/i }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    defaultSystemTheme
  );
  await assertSelectedThemeOption(/system/i, page);
});

test("preserves the user's preference", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /theme/i }).click();
  await page.getByRole("link", { name: /light/i }).click();

  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("link", { name: /theme/i }).click();
  await assertSelectedThemeOption(/light/i, page);
});

test("reacts to the system's theme changes when System theme is selected", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: /theme/i }).click();
  await page.getByRole("link", { name: /system/i }).click();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("ignores the system's theme changes when System theme is not selected", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: /theme/i }).click();

  // light theme preferred
  await page.getByRole("link", { name: /light/i }).click();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  // dark theme preferred
  await page.getByRole("link", { name: /dark/i }).click();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

async function assertSelectedThemeOption(name: RegExp, page: Page) {
  await expect(page.getByRole("link", { name })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  const otherThemes = ["light", "dark", "system"].filter(
    (theme) => !name.test(theme)
  );
  for (const theme of otherThemes) {
    await expect(
      page.getByRole("link", { name: new RegExp(theme, "i") })
    ).not.toHaveAttribute("aria-selected", "true");
  }
}
