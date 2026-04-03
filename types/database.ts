// types/database.ts
// Supabase データベースの型定義
// @supabase/supabase-js v2.101+ の GenericTable 形式に準拠

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          role: "admin" | "buyer";
          company_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          role: "admin" | "buyer";
          company_name: string;
          created_at?: string;
        };
        Update: {
          role?: "admin" | "buyer";
          company_name?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          vintage: number | null;
          producer: string | null;
          region: string | null;
          grape_variety: string | null;
          price: number;
          stock: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          vintage?: number | null;
          producer?: string | null;
          region?: string | null;
          grape_variety?: string | null;
          price: number;
          stock?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          vintage?: number | null;
          producer?: string | null;
          region?: string | null;
          grape_variety?: string | null;
          price?: number;
          stock?: number;
          image_url?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          status: "pending" | "confirmed" | "shipped" | "delivered";
          note: string | null;
          ordered_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          status?: "pending" | "confirmed" | "shipped" | "delivered";
          note?: string | null;
          ordered_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "pending" | "confirmed" | "shipped" | "delivered";
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        };
        Update: {
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
