// Script de correction des imports (ES Module)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src/pages/ProductsPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Correction des imports...');

// Remplacer les imports problématiques
content = content.replace(
  "import { realtimeService } from '@/config/supabase';",
  "// import { realtimeService } from '@/config/supabase'; // SUPPRIMÉ - Supabase retiré"
);

content = content.replace(
  "import { getApiUrl, getPublicLink } from '../config/domains';",
  "import { getPublicLink } from '../config/domains';"
);

content = content.replace(
  "import { useRealtimeService } from '../services/realtimeService';",
  "// import { useRealtimeService } from '../services/realtimeService'; // SUPPRIMÉ - Non utilisé"
);

// Supprimer les variables inutilisées
content = content.replace(
  "  const [realtimeStatus, setRealtimeStatus] = useState('disconnected');\n  const [realtimeChannel, setRealtimeChannel] = useState(null);",
  ""
);

// Simplifier le useEffect
content = content.replace(
  `  useEffect(() => {
    console.log('🚀 ProductsPage monté - linkId:', linkId);
    
    fetchProducts();
    setupRealtime();
    
    return () => {
      console.log('🧹 Nettoyage ProductsPage...');
      if (realtimeChannel) {
        realtimeService.unsubscribe(realtimeChannel);
      }
    };
  }, [linkId]);`,
  `  useEffect(() => {
    console.log('🚀 ProductsPage monté - linkId:', linkId);
    fetchProducts();
  }, [linkId]);`
);

// Supprimer les fonctions Supabase
const startMarker = "  // Configuration du temps réel avec Supabase";
const endMarker = "  const fetchProducts = async () => {";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
}

fs.writeFileSync(filePath, content);
console.log('✅ Fichier ProductsPage.jsx corrigé !'); 