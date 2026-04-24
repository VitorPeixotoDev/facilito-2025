"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(priceCents / 100);
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

interface PaymentAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentName: string;
  assessmentId: string;
  /** Preço em centavos (vindo do backend/banco). */
  priceCents: number;
}

type PaymentMethod = "CARD" | "PIX";

export function PaymentAssessmentModal({
  isOpen,
  onClose,
  assessmentName,
  assessmentId,
  priceCents,
}: PaymentAssessmentModalProps) {
  const router = useRouter();
  const priceFormatted = formatPrice(priceCents);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cpf, setCpf] = useState("");
  const [pixData, setPixData] = useState<{
    id: string;
    brCode: string;
    brCodeBase64: string;
  } | null>(null);

  const qrImageSrc = useMemo(() => {
    if (!pixData?.brCodeBase64) return null;
    if (pixData.brCodeBase64.startsWith("data:image")) {
      return pixData.brCodeBase64;
    }
    return `data:image/png;base64,${pixData.brCodeBase64}`;
  }, [pixData?.brCodeBase64]);

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setError(null);
      setSuccess(null);
      setCopied(false);
      setSelectedMethod(null);
      setCpf("");
      setPixData(null);
      return;
    }

    if (!pixData?.id) return;

    const intervalId = window.setInterval(async () => {
      try {
        const res = await fetch("/api/checkout/assessment/pix/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transparentId: pixData.id,
            assessmentId,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          return;
        }

        const status = String(data.status ?? "").toUpperCase();
        if (status === "PAID") {
          setSuccess("Pagamento confirmado! Redirecionando...");
          window.clearInterval(intervalId);
          setTimeout(() => {
            router.push(`/applicant/shop/assessment/${assessmentId}?view=instructions`);
            onClose();
          }, 1200);
        }
      } catch {
        // Falha de rede pontual não deve quebrar o polling.
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [assessmentId, isOpen, onClose, pixData?.id, router]);

  const handlePayWithPix = async () => {
    const taxId = cpf.replace(/\D/g, "");
    if (!taxId) {
      setError("Informe o CPF para gerar o Pix.");
      return;
    }
    if (taxId.length !== 11) {
      setError("Informe um CPF valido com 11 digitos.");
      return;
    }

    setError(null);
    setSuccess(null);
    setCopied(false);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/assessment/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, taxId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.alreadyPurchased) {
          onClose();
          router.push(`/applicant/shop/assessment/${assessmentId}?view=instructions`);
          return;
        }
        setError(data.error || "Erro ao iniciar pagamento.");
        setLoading(false);
        return;
      }

      if (data.id && data.brCode && data.brCodeBase64) {
        setPixData({
          id: data.id,
          brCode: data.brCode,
          brCodeBase64: data.brCodeBase64,
        });
        setLoading(false);
        return;
      }

      setError("Resposta inválida do servidor.");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    }
    setLoading(false);
  };

  const handlePayWithCard = async () => {
    setError(null);
    setSuccess(null);
    setCopied(false);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.alreadyPurchased) {
          onClose();
          router.push(`/applicant/shop/assessment/${assessmentId}?view=instructions`);
          return;
        }
        setError(data.error || "Erro ao iniciar pagamento com cartao.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setError("Resposta inválida do servidor.");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    }
    setLoading(false);
  };

  const handleCopyPix = async () => {
    if (!pixData?.brCode) return;
    try {
      await navigator.clipboard.writeText(pixData.brCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setError("Não foi possível copiar o código Pix.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        <h2
          id="payment-modal-title"
          className="text-xl font-bold text-slate-900 mb-2"
        >
          {assessmentName}
        </h2>
        <p className="text-slate-600 text-sm mb-4">
          Esta avaliação é paga. Escolha o metodo de pagamento para liberar o
          acesso automaticamente após a confirmacao.
        </p>
        <p className="text-2xl font-semibold text-[#5e9ea0] mb-6">
          {priceFormatted}
        </p>

        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-emerald-700 mb-4" role="status">
            {success}
          </p>
        )}

        {!pixData ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedMethod("CARD")}
                disabled={loading}
                className={`py-3 px-4 rounded-lg border font-medium disabled:opacity-50 ${
                  selectedMethod === "CARD"
                    ? "border-[#5e9ea0] bg-[#5e9ea0]/10 text-[#2b6668]"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Cartao de Credito
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("PIX")}
                disabled={loading}
                className={`py-3 px-4 rounded-lg border font-medium disabled:opacity-50 ${
                  selectedMethod === "PIX"
                    ? "border-[#5e9ea0] bg-[#5e9ea0]/10 text-[#2b6668]"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Pix
              </button>
            </div>
            {selectedMethod === "PIX" && (
              <div>
                <label
                  htmlFor="pix-cpf"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  CPF
                </label>
                <input
                  id="pix-cpf"
                  type="text"
                  inputMode="numeric"
                  value={cpf}
                  onChange={(event) => setCpf(formatCpf(event.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5e9ea0]/40 focus:border-[#5e9ea0]"
                />
              </div>
            )}

            <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={
                selectedMethod === "CARD"
                  ? handlePayWithCard
                  : selectedMethod === "PIX"
                    ? handlePayWithPix
                    : undefined
              }
              disabled={loading || !selectedMethod}
              className="flex-1 py-3 px-4 rounded-lg bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Skeleton className="h-5 w-5 shrink-0 rounded-full" aria-hidden />
                  Carregando...
                </>
              ) : (
                selectedMethod === "CARD"
                  ? `Pagar ${priceFormatted} no Cartao`
                  : selectedMethod === "PIX"
                    ? `Gerar Pix de ${priceFormatted}`
                    : "Selecione um metodo"
              )}
            </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {qrImageSrc && (
              <img
                src={qrImageSrc}
                alt="QR Code Pix para pagamento"
                className="mx-auto h-56 w-56 rounded-lg border border-slate-200 p-2"
              />
            )}
            <button
              type="button"
              onClick={handleCopyPix}
              className="w-full py-3 px-4 rounded-lg bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white font-medium"
            >
              {copied ? "Codigo Pix copiado!" : "Copiar Codigo Pix"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </>
  );
}
