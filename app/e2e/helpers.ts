// e2e/helpers.ts
// E2E テスト共通ヘルパー

import { type Page } from "@playwright/test";

// テスト用アカウント（Supabase に事前登録が必要）
export const TEST_ACCOUNTS = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? "admin@test.example",
    password: process.env.E2E_ADMIN_PASSWORD ?? "testpassword123",
  },
  buyer: {
    email: process.env.E2E_BUYER_EMAIL ?? "buyer@test.example",
    password: process.env.E2E_BUYER_PASSWORD ?? "testpassword123",
  },
};

/**
 * ログイン操作
 */
export async function login(page: Page, role: "admin" | "buyer") {
  const account = TEST_ACCOUNTS[role];
  await page.goto("/login");
  await page.fill('input[name="email"]', account.email);
  await page.fill('input[name="password"]', account.password);
  await page.click('button[type="submit"]');
}

/**
 * ログアウト操作（管理者）
 */
export async function logoutAdmin(page: Page) {
  await page.click('button:has-text("ログアウト")');
  await page.waitForURL("/login");
}
