// utils/payloadProcessor.js

const processKiwifyPayload = (payload) => {
  // Crie um novo objeto com apenas os campos que você deseja salvar
  const processedPayload = {
    order_id: payload.order_id,
    order_status: payload.order_status,
    payment_method: payload.payment_method,
    store_id: payload.store_id,
    approved_date: payload.approved_date,
    created_at: payload.created_at,
    updated_at: payload.updated_at,
    webhook_event_type: payload.webhook_event_type,
    product_type: payload.product_type,
    // Informações do Produto
    Product: {
      product_id: payload.Product ? payload.Product.product_id : null,
      product_name: payload.Product ? payload.Product.product_name : null,
    },
    // Informações do Cliente
    Customer: {
      full_name: payload.Customer ? payload.Customer.full_name : null,
      email: payload.Customer ? payload.Customer.email : null,
      mobile: payload.Customer ? payload.Customer.mobile : null,
      CPF: payload.Customer ? payload.Customer.CPF : null,
    },
    // Informações de Comissões (opcional, remova se não for usar)
    Commissions: {
      charge_amount: payload.Commissions ? payload.Commissions.charge_amount : null,
      currency: payload.Commissions ? payload.Commissions.currency : null,
      my_commission: payload.Commissions ? payload.Commissions.my_commission : null,
    },
    // Informações de Assinatura (opcional, remova se não for usar)
    Subscription: {
      status: payload.Subscription ? payload.Subscription.status : null,
      next_payment: payload.Subscription ? payload.Subscription.next_payment : null,
      plan_name: (payload.Subscription && payload.Subscription.plan) ? payload.Subscription.plan.name : null,
      subscription_id: payload.Subscription ? payload.Subscription.subscription_id : null,
      // Você pode adicionar mais detalhes de charges se necessário
      charges_completed_count: (payload.Subscription && payload.Subscription.charges && payload.Subscription.charges.completed) ? payload.Subscription.charges.completed.length : 0,
      charges_future_count: (payload.Subscription && payload.Subscription.charges && payload.Subscription.charges.future) ? payload.Subscription.charges.future.length : 0,
    },
    checkout_link: payload.checkout_link,
    access_url: payload.access_url,
    // Adicione ou remova outros campos conforme sua necessidade
    // Por exemplo:
    // installments: payload.installments,
    // card_type: payload.card_type,
  };

  // Remova campos nulos ou vazios para manter o payload limpo no Firebase (opcional)
  Object.keys(processedPayload).forEach(key => {
    if (processedPayload[key] === null || processedPayload[key] === undefined) {
      delete processedPayload[key];
    } else if (typeof processedPayload[key] === 'object' && !Array.isArray(processedPayload[key])) {
      // Recursivamente remova campos nulos de objetos aninhados
      Object.keys(processedPayload[key]).forEach(subKey => {
        if (processedPayload[key][subKey] === null || processedPayload[key][subKey] === undefined) {
          delete processedPayload[key][subKey];
        }
      });
      // Se o objeto aninhado ficar vazio, remova-o também
      if (Object.keys(processedPayload[key]).length === 0) {
        delete processedPayload[key];
      }
    }
  });

  return processedPayload;
};

module.exports = {
  processKiwifyPayload
};