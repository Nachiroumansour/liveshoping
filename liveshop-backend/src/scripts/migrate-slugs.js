/**
 * Migration script: Convert existing random public_link_id to name-based slugs
 *
 * Run: node src/scripts/migrate-slugs.js
 *
 * - Generates slugs from seller names
 * - Handles duplicates with numeric suffixes
 * - Preserves old IDs in console output for reference
 */

const { sequelize } = require('../config/database');
const Seller = require('../models/Seller');
const { slugify } = Seller;

async function migrateSlugs() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB établie\n');

    const sellers = await Seller.findAll({ order: [['created_at', 'ASC']] });
    console.log(`📦 ${sellers.length} vendeurs trouvés\n`);

    const usedSlugs = new Set();
    let migrated = 0;
    let skipped = 0;

    for (const seller of sellers) {
      const oldId = seller.public_link_id;

      // Si c'est déjà un slug (contient un tiret ou est un mot lisible), skip
      if (oldId.includes('-') && oldId.length > 12) {
        console.log(`⏭️  ${seller.name} → "${oldId}" (déjà un slug)`);
        usedSlugs.add(oldId);
        skipped++;
        continue;
      }

      const baseSlug = slugify(seller.name);
      if (!baseSlug) {
        console.log(`⚠️  ${seller.name} → slug vide, skip`);
        skipped++;
        continue;
      }

      let finalSlug = baseSlug;
      let suffix = 2;

      // Vérifier unicité en mémoire + DB
      while (usedSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${suffix}`;
        suffix++;
      }

      // Vérifier aussi en DB (au cas où)
      const existing = await Seller.findOne({ where: { public_link_id: finalSlug } });
      if (existing && existing.id !== seller.id) {
        while (true) {
          finalSlug = `${baseSlug}-${suffix}`;
          suffix++;
          const check = await Seller.findOne({ where: { public_link_id: finalSlug } });
          if (!check || check.id === seller.id) break;
        }
      }

      usedSlugs.add(finalSlug);

      await seller.update({ public_link_id: finalSlug });
      console.log(`✅ ${seller.name}: "${oldId}" → "${finalSlug}"`);
      migrated++;
    }

    console.log(`\n🎉 Migration terminée: ${migrated} migrés, ${skipped} ignorés`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    process.exit(1);
  }
}

migrateSlugs();
