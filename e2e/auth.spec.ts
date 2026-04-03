// e2e/auth.spec.ts
// 認証フローのE2Eテスト（F1-4）

import { test, expect } from "@playwright/test";
import { login, logoutAdmin, TEST_ACCOUNTS } from "./helpers";

test.describe("認証フロー", () => {
  test("未認証ユーザーは /login にリダイレクトされる", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL("/login");
  });

  test("未認証ユーザーが /buyer にアクセスすると /login にリダイレクト", async ({
    page,
  }) => {
    await page.goto("/buyer");
    await expect(page).toHaveURL("/login");
  });

  test("ログイン画面が表示される", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Wine Order");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText("ログイン");
  });

  test("誤ったパスワードでエラーメッセージが表示される", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', TEST_ACCOUNTS.admin.email);
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(
      page.locator("text=メールアドレスまたはパスワードが正しくありません")
    ).toBeVisible();
  });

  test("管理者ログイン → /admin にリダイレクト", async ({ page }) => {
    await login(page, "admin");
    await expect(page).toHaveURL("/admin");
    await expect(page.locator("h1")).toContainText("発注一覧");
  });

  test("発注者ログイン → /buyer にリダイレクト", async ({ page }) => {
    await login(page, "buyer");
    await expect(page).toHaveURL("/buyer");
  });

  test("管理者ログアウト → /login にリダイレクト", async ({ page }) => {
    await login(page, "admin");
    await expect(page).toHaveURL("/admin");
    await logoutAdmin(page);
    await expect(page).toHaveURL("/login");
  });

  test("発注者が /admin にアクセスすると /buyer にリダイレクト", async ({
    page,
  }) => {
    await login(page, "buyer");
    await page.goto("/admin");
    await expect(page).toHaveURL("/buyer");
  });
});
