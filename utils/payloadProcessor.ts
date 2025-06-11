// utils/payloadProcessor.ts

interface Product {
  product_id: string;
  product_name: string;
}

interface Customer {
  full_name: string;
  email: string;
  mobile: string | null;
  CPF: string | null;
  ip: string;
}

interface Plan {
    id: string;
    name: string;
    frequency: string;
    qty_charges: number;
}

interface Subscription {
    status: string;
    next_payment: string;
    plan: Plan;
    subscription_id: string;
}

interface KiwifyPayload {
  order_id: string;
  order_status: string;
  payment_method: string;
  store_id: string;
  approved_date: string;
  created_at: string;
  updated_at: string;
  webhook_event_type: string;
  product_type: string;
  Product: Product;
  Customer: Customer;
  Commissions: {
    charge_amount: string;
    currency: string;
    my_commission: string;
  };
  Subscription?: Subscription;
  checkout_link?: string;
  access_url?: string;
  [key: string]: any;
}

export const processKiwifyPayload = (payload: KiwifyPayload): any => {
  return {
    order_id: payload.order_id,
    order_status: payload.order_status,
    webhook_event_type: payload.webhook_event_type,
    product_name: payload.Product ? payload.Product.product_name : 'N/A',
    customer_email: payload.Customer ? payload.Customer.email : 'N/A',
    timestamp: new Date().toISOString(),
  };
};