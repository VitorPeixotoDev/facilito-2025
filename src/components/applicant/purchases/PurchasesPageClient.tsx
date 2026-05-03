"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, CreditCard, Download, ReceiptText, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadPurchaseReceiptPdf } from "@/lib/purchases/purchaseReceiptPdf";
import type { PurchaseHistoryItem } from "@/lib/purchases/types";

function formatCurrency(amountCents: number | null): string {
  if (amountCents == null) return "Não informado";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountCents / 100);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function paymentMethodLabel(method: PurchaseHistoryItem["paymentMethod"]): string {
  if (method === "card") return "Cartão de crédito";
  if (method === "pix") return "Pix";
  return "Não informado";
}

function providerLabel(provider: PurchaseHistoryItem["paymentProvider"]): string {
  if (provider === "stripe") return "Stripe";
  if (provider === "abacatepay") return "AbacatePay";
  return "Não informado";
}

function shortReference(reference: string | null): string {
  if (!reference) return "Não informado";
  if (reference.length <= 18) return reference;
  return `${reference.slice(0, 8)}...${reference.slice(-6)}`;
}

export function PurchasesPageClient() {
  const [purchases, setPurchases] = useState<PurchaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPurchases() {
      try {
        const response = await fetch("/api/purchases", { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.error || "Erro ao carregar histórico de compras.");
        }

        if (active) {
          setPurchases(payload.purchases ?? []);
          setError(null);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Erro ao carregar histórico de compras.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPurchases();

    return () => {
      active = false;
    };
  }, []);

  async function handleDownload(purchase: PurchaseHistoryItem) {
    setDownloadingId(purchase.id);
    try {
      await downloadPurchaseReceiptPdf(purchase);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-gradient-to-br from-[#5e9ea0] to-[#4a8b8f] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
            <ReceiptText className="h-4 w-4" aria-hidden="true" />
            Histórico financeiro
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Minhas compras
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            Acompanhe suas compras confirmadas, acesse os produtos liberados e baixe seus comprovantes.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((item) => (
              <Card key={item} className="rounded-2xl border-slate-200 bg-white p-5">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="mt-4 h-4 w-full" />
                <Skeleton className="mt-3 h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="rounded-2xl border-red-100 bg-red-50 p-5 text-red-700">
            {error}
          </Card>
        ) : purchases.length === 0 ? (
          <Card className="rounded-2xl border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#5e9ea0]/10 text-[#5e9ea0]">
              <ShoppingBag className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Nenhuma compra encontrada
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Quando você comprar uma avaliação, ela aparecerá aqui com data, valor, forma de pagamento e comprovante.
            </p>
            <Link
              href="/applicant/shop"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#5e9ea0] px-4 py-2 font-medium text-white transition-colors hover:bg-[#4a8b8f]"
            >
              Ver produtos
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Card
                key={purchase.id}
                className="rounded-2xl border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#5e9ea0]/10 px-2.5 py-1 text-xs font-semibold text-[#3d7678]">
                        Compra confirmada
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        Avaliação
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-bold text-slate-900 sm:text-xl">
                      {purchase.productName}
                    </h2>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 h-4 w-4 text-[#5e9ea0]" aria-hidden="true" />
                        <div>
                          <p className="font-medium text-slate-900">Data</p>
                          <p>{formatDate(purchase.purchasedAt)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Valor</p>
                        <p>{formatCurrency(purchase.amountCents)}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CreditCard className="mt-0.5 h-4 w-4 text-[#5e9ea0]" aria-hidden="true" />
                        <div>
                          <p className="font-medium text-slate-900">Pagamento</p>
                          <p>
                            {paymentMethodLabel(purchase.paymentMethod)} · {providerLabel(purchase.paymentProvider)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Referência</p>
                        <p className="font-mono text-xs">{shortReference(purchase.paymentReference)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                    <Link
                      href={purchase.accessUrl}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-[#5e9ea0] px-4 py-2 font-medium text-white transition-colors hover:bg-[#4a8b8f]"
                    >
                      Acessar avaliação
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => void handleDownload(purchase)}
                      disabled={downloadingId === purchase.id}
                    >
                      <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                      {downloadingId === purchase.id ? "Gerando..." : "Baixar comprovante"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
