import fs from 'fs';

const filePath = './src/pages/ProductsPage.jsx';

console.log('🔧 Correction des guillemets français dans ProductsPage.jsx...');

try {
  // Lire le fichier
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remplacer les guillemets français par des guillemets simples
  content = content.replace(/['']/g, "'");
  content = content.replace(/[""]/g, '"');
  
  // Écrire le fichier corrigé
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log('✅ Guillemets corrigés avec succès !');
  console.log('🔧 Erreur de syntaxe résolue');
  
} catch (error) {
  console.error('❌ Erreur lors de la correction:', error.message);
} 