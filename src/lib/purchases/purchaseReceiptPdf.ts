import { jsPDF } from "jspdf";
import type { PurchaseHistoryItem } from "@/lib/purchases/types";

const LOGO_PATH = "/logo_horizontal.png";

function formatCurrency(amountCents: number | null): string {
  if (amountCents == null) return "Não informado";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountCents / 100);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPaymentMethod(method: PurchaseHistoryItem["paymentMethod"]): string {
  if (method === "card") return "Cartão de crédito";
  if (method === "pix") return "Pix";
  return "Não informado";
}

function formatProvider(provider: PurchaseHistoryItem["paymentProvider"]): string {
  if (provider === "stripe") return "Stripe";
  if (provider === "abacatepay") return "AbacatePay";
  return "Não informado";
}

function shortReference(reference: string | null): string {
  if (!reference) return "Não informado";
  if (reference.length <= 18) return reference;
  return `${reference.slice(0, 8)}...${reference.slice(-6)}`;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function fetchImageDataUrl(path: string): Promise<string | null> {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function downloadPurchaseReceiptPdf(purchase: PurchaseHistoryItem): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const logo = await fetchImageDataUrl(LOGO_PATH);

  if (logo) {
    doc.addImage(logo, "PNG", 20, 18, 52, 15);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Comprovante de compra", 20, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90, 100, 116);
  doc.text("Facilitô! Vagas", 20, 56);
  doc.text("Compra confirmada na plataforma.", 20, 63);

  doc.setDrawColor(94, 158, 160);
  doc.setLineWidth(0.6);
  doc.line(20, 73, pageWidth - 20, 73);

  const rows: Array<[string, string]> = [
    ["Produto/serviço", purchase.productName],
    ["Data da compra", formatDate(purchase.purchasedAt)],
    ["Valor", formatCurrency(purchase.amountCents)],
    ["Forma de pagamento", formatPaymentMethod(purchase.paymentMethod)],
    ["Provedor", formatProvider(purchase.paymentProvider)],
    ["Referência", shortReference(purchase.paymentReference)],
  ];

  let y = 88;
  for (const [label, value] of rows) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(label.toUpperCase(), 20, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(value, 20, y + 7, { maxWidth: pageWidth - 40 });
    y += 22;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(20, 238, pageWidth - 20, 238);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Este documento é um comprovante informativo gerado pelo Facilitô! Vagas.",
    20,
    248,
    { maxWidth: pageWidth - 40 }
  );

  const dateSlug = purchase.purchasedAt.slice(0, 10);
  doc.save(`comprovante-facilito-${slugify(purchase.productName)}-${dateSlug}.pdf`);
}
