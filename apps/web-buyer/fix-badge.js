import fs from 'fs';

const filePath = './src/pages/ProductsPage.jsx';

console.log('🔧 Modification du badge "En Live" en "⭐ Épinglé"...');

try {
  // Lire le fichier
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remplacer le badge "En Live" par "⭐ Épinglé"
  const oldBadge = `                {/* Badge Live */}
                {product.is_pinned && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="badge-live">
                      <Star className="w-3 h-3 mr-1" />
                      En Live
                    </Badge>
                  </div>
                )}`;
  
  const newBadge = `                {/* Badge Épinglé */}
                {product.is_pinned && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="badge-pinned bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                      <Star className="w-3 h-3 mr-1" />
                      ⭐ Épinglé
                    </Badge>
                  </div>
                )}`;
  
  // Appliquer le remplacement
  content = content.replace(oldBadge, newBadge);
  
  // Écrire le fichier modifié
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log('✅ Badge modifié avec succès !');
  console.log('🔧 "En Live" → "⭐ Épinglé"');
  
} catch (error) {
  console.error('❌ Erreur lors de la modification:', error.message);
} 