// components/LogoutButton.tsx
// ログアウトボタンコンポーネント

import { LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/login/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:text-white hover:bg-[#6B1A35] rounded-lg transition-colors w-full"
      >
        <LogOut className="w-4 h-4" />
        ログアウト
      </button>
    </form>
  );
}
