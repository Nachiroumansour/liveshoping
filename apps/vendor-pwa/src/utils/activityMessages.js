// Traduit un événement de boutique en phrase française lisible.
// Règle produit : l'interface n'affiche jamais un type d'événement brut.
const FCFA = (n) => `${Number(n || 0).toLocaleString('fr-FR').replace(/ | /g, ' ')} FCFA`;

const RENDERERS = {
  order_created: (p) => ({
    emoji: '🛍️',
    sentence: `${p.customer_name || 'Un client'} a commandé ${p.product_name || 'un produit'}${p.quantity > 1 ? ` (x${p.quantity})` : ''} — ${FCFA(p.total_price)}`
  }),
  order_paid: (p) => ({
    emoji: '💰',
    sentence: `Commande #${p.order_id} payée — ${FCFA(p.total_price)}`
  }),
  order_delivered: (p) => ({
    emoji: '🚚',
    sentence: `Commande #${p.order_id} livrée à ${p.customer_name || 'un client'}`
  }),
  product_created: (p) => ({
    emoji: '📦',
    sentence: `Nouveau produit en boutique : ${p.product_name} — ${FCFA(p.price)}`
  }),
  stock_low: (p) => ({
    emoji: '⚠️',
    sentence: `Stock faible : ${p.product_name} (${p.stock_quantity} restant${p.stock_quantity > 1 ? 's' : ''})`
  }),
  stock_out: (p) => ({
    emoji: '🔴',
    sentence: `Stock épuisé : ${p.product_name}`
  }),
  comment_added: (p) => ({
    emoji: '💬',
    sentence: `${p.author_name || 'Un client'} a laissé un commentaire`
  })
};

export function formatActivityEvent(event) {
  const render = RENDERERS[event.type];
  if (!render) return null; // type inconnu : on n'affiche rien plutôt qu'un type brut
  const { emoji, sentence } = render(event.payload || {});
  const d = new Date(event.created_at);
  const timeLabel = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return { emoji, sentence, timeLabel, date: d };
}
