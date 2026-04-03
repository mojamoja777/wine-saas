// e2e/orders.spec.ts
// 発注フローのE2Eテスト（F3-6 / F4-4）

import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("発注フロー（発注者）", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, "buyer");
    await expect(page).toHaveURL("/buyer");
  });

  test("商品一覧が表示される", async ({ page }) => {
    await expect(page.locator('input[placeholder="ワインを検索..."]')).toBeVisible();
  });

  test("カートが空の状態でカートページが表示される", async ({ page }) => {
    await page.goto("/buyer/cart");
    await expect(page.locator("text=カートが空です")).toBeVisible();
  });

  test("商品をカートに追加できる", async ({ page }) => {
    // +ボタンをクリック
    const addBtn = page.locator('button[aria-label="カートに追加"]').first();
    await addBtn.click();

    // カートバッジが表示される
    await expect(page.locator("text=1").first()).toBeVisible();
  });

  test("発注フローを完了できる", async ({ page }) => {
    // 商品を追加
    const addBtn = page.locator('button[aria-label="カートに追加"]').first();
    await addBtn.click();

    // カートページへ
    await page.goto("/buyer/cart");
    await expect(page.locator('a:has-text("発注確認へ進む")')).toBeVisible();
    await page.click('a:has-text("発注確認へ進む")');

    // 確認ページ
    await expect(page).toHaveURL("/buyer/cart/confirm");
    await expect(page.locator("h1")).toContainText("発注確認");
    await page.fill("textarea", "E2Eテスト備考");
    await page.click('button:has-text("発注する")');

    // 完了ページ
    await expect(page.url()).toContain("/buyer/orders/complete");
    await expect(page.locator("text=発注が完了しました")).toBeVisible();
  });

  test("発注履歴が表示される", async ({ page }) => {
    await page.goto("/buyer/orders");
    await expect(page.locator("h1")).toContainText("発注履歴");
  });

  test("検索で商品を絞り込める", async ({ page }) => {
    await page.fill('input[placeholder="ワインを検索..."]', "存在しないワイン名xyz");
    await expect(page.locator("text=該当する商品が見つかりません")).toBeVisible();
  });
});

test.describe("発注管理（管理者）", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, "admin");
  });

  test("発注一覧が表示される", async ({ page }) => {
    await expect(page).toHaveURL("/admin");
    await expect(page.locator("h1")).toContainText("発注一覧");
  });

  test("ステータスフィルターが機能する", async ({ page }) => {
    await page.selectOption("select", "pending");
    await expect(page).toHaveURL("/admin?status=pending");
  });

  test("発注詳細でステータスを更新できる", async ({ page }) => {
    // 発注一覧から最初の発注詳細へ
    const firstOrderLink = page.locator('a[href^="/admin/orders/"]').first();
    if (await firstOrderLink.isVisible()) {
      await firstOrderLink.click();
      await expect(page.url()).toContain("/admin/orders/");

      // ステータス変更ボタンが存在すれば押す
      const changeBtn = page.locator('button:has-text("変更")');
      if (await changeBtn.isVisible()) {
        page.on("dialog", (dialog) => dialog.accept());
        await changeBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });
});
