"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(priceCents / 100);
}

interface PaymentAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentName: string;
  assessmentId: string;
  /** Preço em centavos (vindo do backend/banco). */
  priceCents: number;
}

export function PaymentAssessmentModal({
  isOpen,
  onClose,
  assessmentName,
  assessmentId,
  priceCents,
}: PaymentAssessmentModalProps) {
  const priceFormatted = formatPrice(priceCents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setError(null);
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
          window.location.href = `/applicant/shop/assessment/${assessmentId}?view=instructions`;
          return;
        }
        setError(data.error || "Erro ao iniciar pagamento.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Resposta inválida do servidor.");
    } catch (e) {
      setError("Erro de conexão. Tente novamente.");
    }
    setLoading(false);
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
          Esta avaliação é paga. Você será redirecionado ao pagamento seguro.
          Após a aprovação, poderá fazer a avaliação.
        </p>
        <p className="text-2xl font-semibold text-[#5e9ea0] mb-6">
          {priceFormatted}
        </p>

        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
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
            onClick={handlePay}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-lg bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirecionando...
              </>
            ) : (
              `Pagar ${priceFormatted} e continuar`
            )}
          </button>
        </div>
      </div>
    </>
  );
}
