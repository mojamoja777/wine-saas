// app/(admin)/layout.tsx
// 管理者ページ共通レイアウト（サイドナビゲーション付き）

import { AdminSideNav } from "@/components/admin/AdminSideNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSideNav />
      <main className="flex-1 bg-gray-100 overflow-auto">{children}</main>
    </div>
  );
}
