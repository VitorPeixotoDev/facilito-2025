-- Enriquecer o histórico de compras com dados necessários para recibo e listagem.
ALTER TABLE assessment_purchases
    ADD COLUMN IF NOT EXISTS product_name TEXT,
    ADD COLUMN IF NOT EXISTS amount_cents INTEGER,
    ADD COLUMN IF NOT EXISTS payment_method TEXT,
    ADD COLUMN IF NOT EXISTS payment_provider TEXT,
    ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Backfill para compras antigas com base no catálogo/preços atuais.
UPDATE assessment_purchases ap
SET
    product_name = COALESCE(ap.product_name, a.name),
    amount_cents = COALESCE(ap.amount_cents, pr.price_cents, 2000),
    payment_reference = COALESCE(ap.payment_reference, ap.stripe_session_id),
    payment_provider = COALESCE(
        ap.payment_provider,
        CASE
            WHEN ap.stripe_session_id LIKE 'cs_%' THEN 'stripe'
            ELSE 'abacatepay'
        END
    ),
    payment_method = COALESCE(
        ap.payment_method,
        CASE
            WHEN ap.stripe_session_id LIKE 'cs_%' THEN 'card'
            ELSE 'pix'
        END
    )
FROM assessments a
LEFT JOIN assessment_prices pr ON pr.assessment_id = a.id
WHERE ap.assessment_id = a.id;

CREATE INDEX IF NOT EXISTS idx_assessment_purchases_created_at
    ON assessment_purchases(created_at DESC);
