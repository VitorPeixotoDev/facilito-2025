export interface PurchaseHistoryItem {
  id: string;
  productName: string;
  productType: "assessment";
  purchasedAt: string;
  amountCents: number | null;
  paymentMethod: "card" | "pix" | "unknown";
  paymentProvider: "stripe" | "abacatepay" | "unknown";
  paymentReference: string | null;
  accessUrl: string;
}
