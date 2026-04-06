# プロジェクトディレクトリ構成

作成日: 2026-04-02

---

## 推奨ディレクトリ構成

```
wine-saas/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── page.tsx          # ログイン画面
│   │   │   └── actions.ts        # ログインのサーバーアクション
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── page.tsx          # 管理者ダッシュボード
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── buyers/page.tsx
│   │   └── layout.tsx
│   ├── (buyer)/
│   │   ├── buyer/
│   │   │   ├── page.tsx          # 発注者ダッシュボード
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   └── products/page.tsx
│   │   └── layout.tsx
│   ├── api/auth/callback/route.ts  # Supabase Auth コールバック
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── admin/
│   └── buyer/
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # ブラウザ用クライアント
│   │   └── server.ts             # Server Components 用クライアント
│   └── utils.ts
├── types/
│   ├── database.ts               # Supabase DB 型定義
│   └── index.ts
├── middleware.ts                 # ロール別リダイレクト
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```
