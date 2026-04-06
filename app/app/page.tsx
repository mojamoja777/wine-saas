// app/page.tsx
// ルートページ：ミドルウェアでロール別ページにリダイレクトされるため
// 未認証の場合はこのページが表示されることはないが念のためログインへ誘導

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
