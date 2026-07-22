const Event = require('../models/Event');

/**
 * Émission d'un événement de boutique — double écriture best-effort.
 * NE JETTE JAMAIS : un échec d'émission ne doit pas casser le flux métier
 * appelant (commande, produit, commentaire).
 */
async function emit(sellerId, type, payload = {}) {
  try {
    const event = await Event.create({ seller_id: sellerId, type, payload });

    // Temps réel best-effort vers la PWA (room seller_{id} via app.js)
    try {
      if (global.notifySeller) {
        global.notifySeller(sellerId, 'shop_activity', {
          id: event.id,
          type: event.type,
          payload: event.payload,
          created_at: event.created_at
        });
      }
    } catch (socketError) {
      console.error(`⚠️ Event ${type} enregistré mais push temps réel échoué:`, socketError.message);
    }

    return event;
  } catch (error) {
    console.error(`❌ Émission événement ${type} échouée (seller ${sellerId}):`, error.message);
    return null;
  }
}

module.exports = { emit };
