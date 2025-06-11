// utils/payloadProcessor.ts
export interface KiwifyCustomer {
  full_name: string;
  first_name: string;
  email: string;
  mobile: string;
  cnpj?: string; // Opcional
  ip?: string; // Opcional
  instagram?: string; // Opcional
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

export interface KiwifyProduct {
  product_id: string;
  product_name: string;
}

export interface KiwifyOrder {
  order_id: string;
  order_ref: string;
  order_status: string; // ex: 'approved', 'waiting_payment', 'canceled', 'refunded'
  product_type: string;
  payment_method: string;
  store_id: string;
  payment_merchant_id: number;
  installments?: number | null;
  card_type?: string;
  card_last4digits?: string;
  card_rejection_reason?: string | null;
  boleto_URL?: string | null;
  boleto_barcode?: string | null;
  boleto_expiry_date?: string | null;
  pix_code?: string | null;
  pix_expiration?: string | null;
  sale_type: string;
  created_at: string; // Data e hora do evento
  updated_at: string; // Data e hora da última atualização do pedido
  approved_date?: string | null; // Data de aprovação do pedido
  refunded_at?: string | null; // Data de reembolso
  webhook_event_type: string; // pix_created, order_approved, order_canceled, etc.
  Product: KiwifyProduct;
  Customer: KiwifyCustomer;
  // Outros campos como Commissions, TrackingParameters, Subscription podem ser incluídos se necessário
  Commissions?: any;
  TrackingParameters?: any;
  Subscription?: any;
  subscription_id?: string;
}

// Função para sanitizar o e-mail para uso como ID de documento do Firebase
export function sanitizeEmailForFirebase(email: string): string {
    return email.replace(/\./g, '_').replace(/@/g, '_');
}

export function processKiwifyPayload(payload: any): KiwifyOrder {
  // Realiza uma validação básica e extrai apenas os campos relevantes
  // Você pode ajustar isso para incluir mais campos ou transformar dados
  const processed: KiwifyOrder = {
    order_id: payload.order_id,
    order_ref: payload.order_ref,
    order_status: payload.order_status,
    product_type: payload.product_type,
    payment_method: payload.payment_method,
    store_id: payload.store_id,
    payment_merchant_id: payload.payment_merchant_id,
    installments: payload.installments,
    card_type: payload.card_type,
    card_last4digits: payload.card_last4digits,
    card_rejection_reason: payload.card_rejection_reason,
    boleto_URL: payload.boleto_URL,
    boleto_barcode: payload.boleto_barcode,
    boleto_expiry_date: payload.boleto_expiry_date,
    pix_code: payload.pix_code,
    pix_expiration: payload.pix_expiration,
    sale_type: payload.sale_type,
    created_at: payload.created_at,
    updated_at: payload.updated_at,
    approved_date: payload.approved_date,
    refunded_at: payload.refunded_at,
    webhook_event_type: payload.webhook_event_type,
    Product: {
      product_id: payload.Product?.product_id,
      product_name: payload.Product?.product_name,
    },
    Customer: {
      full_name: payload.Customer?.full_name,
      first_name: payload.Customer?.first_name,
      email: payload.Customer?.email,
      mobile: payload.Customer?.mobile,
      cnpj: payload.Customer?.cnpj,
      ip: payload.Customer?.ip,
      instagram: payload.Customer?.instagram,
      street: payload.Customer?.street,
      number: payload.Customer?.number,
      complement: payload.Customer?.complement,
      neighborhood: payload.Customer?.neighborhood,
      city: payload.Customer?.city,
      state: payload.Customer?.state,
      zipcode: payload.Customer?.zipcode,
    },
    Subscription: payload.Subscription ? {
      id: payload.Subscription.id,
      start_date: payload.Subscription.start_date,
      next_payment: payload.Subscription.next_payment,
      status: payload.Subscription.status,
      plan: payload.Subscription.plan ? {
        id: payload.Subscription.plan.id,
        name: payload.Subscription.plan.name,
        frequency: payload.Subscription.plan.frequency,
        qty_charges: payload.Subscription.plan.qty_charges,
      } : null,
      charges: payload.Subscription.charges, // Pode precisar de um tratamento mais profundo se for usar
    } : null,
    subscription_id: payload.subscription_id,
  };

  return processed;
}

// Função de utilidade para auxiliar no cálculo de datas
export function addDays(date: string, days: number): string {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString(); // Formato ISO para consistência
}

export function addYears(date: string, years: number): string {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d.toISOString(); // Formato ISO para consistência
}