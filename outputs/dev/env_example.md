# 環境変数テンプレート

作成日: 2026-04-02

---

## `.env.local` テンプレート

```env
# ============================================================
# Supabase 接続設定
# Supabase ダッシュボード > Settings > API から取得
# ============================================================

# Supabase プロジェクト URL
NEXT_PUBLIC_SUPABASE_URL=https://itcrnvjpwheetpokbegp.supabase.co

# Supabase anon（公開）キー
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_rZtIAPcfXkQR0ngBYivnnw_b809aWxO

# Supabase service_role キー（サーバーサイド専用・厳重管理）
# ユーザーのロール設定など管理者操作に使用
# 絶対に NEXT_PUBLIC_ を付けないこと・Git にコミットしないこと
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## 各変数の説明

| 変数名 | 用途 | 公開可否 |
|--------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | プロジェクトのエンドポイント URL | 公開可 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 匿名アクセス用キー（RLS で保護） | 公開可 |
| `SUPABASE_SERVICE_ROLE_KEY` | RLS をバイパスする管理者キー | **絶対に非公開** |

---

## 注意事項

- `.env.local` は **絶対に Git にコミットしない**（`.gitignore` に含まれていることを確認）
- `SUPABASE_SERVICE_ROLE_KEY` は Supabase ダッシュボード > Settings > API > `service_role` から取得
- Vercel デプロイ時は **Settings > Environment Variables** にも同じ値を登録すること
