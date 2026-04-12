// app/api/invoices/[id]/pdf/route.ts
// 請求書PDFの個別ダウンロードエンドポイント（admin のみ）

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTenantByBuyerId } from "@/lib/tenant";
import {
  invoicePdfFileName,
  renderInvoicePdf,
  type InvoicePdfData,
} from "@/lib/pdf/invoice";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // admin 権限チェック：RLS 経由で取得できなければ未認可
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      `
      id,
      buyer_id,
      period_start,
      period_end,
      total_amount,
      note,
      issued_at,
      updated_at,
      users!inner ( company_name ),
      invoice_items (
        product_name,
        producer,
        region,
        quantity,
        unit_price,
        sort_order
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buyer = invoice.users as { company_name: string } | null;
  const sortedItems = [...invoice.invoice_items].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const tenant = await getTenantByBuyerId(supabase, invoice.buyer_id);

  const data: InvoicePdfData = {
    id: invoice.id,
    buyerCompanyName: buyer?.company_name ?? "—",
    periodStart: invoice.period_start,
    periodEnd: invoice.period_end,
    totalAmount: Number(invoice.total_amount),
    note: invoice.note,
    issuedAt: invoice.issued_at,
    updatedAt: invoice.updated_at,
    items: sortedItems.map((item) => ({
      productName: item.product_name,
      producer: item.producer,
      region: item.region,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
    })),
    tenant: {
      companyName: tenant?.company_name ?? "",
      displayName: tenant?.display_name ?? "Mise",
      postalCode: tenant?.postal_code ?? null,
      address: tenant?.address ?? null,
      phone: tenant?.phone ?? null,
      fax: tenant?.fax ?? null,
      invoiceNumber: tenant?.invoice_number ?? null,
      bankInfo: tenant?.bank_info ?? null,
      representative: tenant?.representative ?? null,
    },
  };

  const pdfBuffer = await renderInvoicePdf(data);
  const fileName = invoicePdfFileName(data);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Cache-Control": "no-store",
    },
  });
}
