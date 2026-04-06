// e2e/products.spec.ts
// 商品管理のE2Eテスト（F2-4）

import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("商品管理（管理者）", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, "admin");
    await page.goto("/admin/products");
  });

  test("商品管理ページが表示される", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("商品管理");
    await expect(page.locator('a:has-text("新規登録")')).toBeVisible();
  });

  test("商品を新規登録できる", async ({ page }) => {
    await page.click('a:has-text("新規登録")');
    await expect(page).toHaveURL("/admin/products/new");

    await page.fill('input[name="name"]', "E2Eテスト用ワイン");
    await page.fill('input[name="producer"]', "テスト生産者");
    await page.fill('input[name="region"]', "テスト産地");
    await page.fill('input[name="price"]', "1000");
    await page.fill('input[name="stock"]', "10");
    await page.click('button:has-text("登録する")');

    await expect(page).toHaveURL("/admin/products");
    await expect(page.locator("text=E2Eテスト用ワイン")).toBeVisible();
  });

  test("商品を編集できる", async ({ page }) => {
    // 既存商品の編集ボタンをクリック
    const editLink = page.locator('a[aria-label="編集"]').first();
    await editLink.click();
    await expect(page.url()).toContain("/edit");

    await page.fill('input[name="name"]', "E2E編集済みワイン");
    await page.click('button:has-text("保存する")');

    await expect(page).toHaveURL("/admin/products");
    await expect(page.locator("text=E2E編集済みワイン")).toBeVisible();
  });

  test("商品を削除できる", async ({ page }) => {
    // 削除前に商品が存在することを確認
    const deleteBtn = page.locator('button[aria-label="削除"]').first();
    await deleteBtn.click();

    // 確認ダイアログを承認
    page.on("dialog", (dialog) => dialog.accept());

    await page.waitForTimeout(1000);
  });

  test("キャンセルボタンで一覧に戻る", async ({ page }) => {
    await page.click('a:has-text("新規登録")');
    await page.click('a:has-text("キャンセル")');
    await expect(page).toHaveURL("/admin/products");
  });
});
