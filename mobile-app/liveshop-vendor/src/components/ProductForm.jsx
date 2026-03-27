import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X, Plus, Search } from 'lucide-react';
import ImageCapture from './ImageCapture';
import ImageGallery from './ImageGallery';
import SimpleImageLibrary from './test/SimpleImageLibrary';

const ProductForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: 'general',
    attributes: {},
    images: [],
    tags: [],
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    has_variants: false
  });


  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showImageLibrary, setShowImageLibrary] = useState(false);

  // Configuration des catégories
  const categories = {
    general: { name: 'Général', attributes: [] },
    vetements: {
      name: 'Vêtements',
      attributes: [
        { name: 'size', label: 'Taille', type: 'select', required: false, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] },
        { name: 'color', label: 'Couleur', type: 'select', required: false, options: ['Rouge', 'Bleu', 'Vert', 'Noir', 'Blanc', 'Jaune', 'Orange', 'Violet', 'Rose', 'Gris', 'Marron'] },
        { name: 'material', label: 'Matériau', type: 'text', required: false },
        { name: 'gender', label: 'Genre', type: 'select', required: false, options: ['Homme', 'Femme', 'Unisexe', 'Enfant'] }
      ]
    },
    chaussures: {
      name: 'Chaussures',
      attributes: [
        { name: 'size', label: 'Pointure', type: 'select', required: false, options: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'] },
        { name: 'color', label: 'Couleur', type: 'text', required: false },
        { name: 'type', label: 'Type', type: 'select', required: false, options: ['Sneakers', 'Baskets', 'Tongs', 'Sandales', 'Bottes', 'Escarpins', 'Mocassins', 'Chaussons'] },
        { name: 'material', label: 'Matériau', type: 'text', required: false }
      ]
    },
    sacs: {
      name: 'Sacs & Bagages',
      attributes: [
        { name: 'type', label: 'Type', type: 'select', required: false, options: ['Sac à main', 'Sac à dos', 'Pochette', 'Valise', 'Sacoche', 'Cabas', 'Besace', 'Trousse'] },
        { name: 'material', label: 'Matériau', type: 'select', required: false, options: ['Cuir', 'Simili cuir', 'Tissu', 'Toile', 'Nylon', 'Plastique'] },
        { name: 'color', label: 'Couleur', type: 'text', required: false }
      ]
    },
    bijoux: {
      name: 'Bijoux',
      attributes: [
        { name: 'material', label: 'Matériau', type: 'select', required: false, options: ['Or', 'Argent', 'Platine', 'Acier', 'Cuivre', 'Laiton', 'Plastique', 'Bois', 'Pierre'] },
        { name: 'weight', label: 'Poids (grammes)', type: 'number', required: false, unit: 'g' },
        { name: 'size', label: 'Taille', type: 'text', required: false },
        { name: 'type', label: 'Type', type: 'select', required: false, options: ['Bague', 'Collier', 'Bracelet', 'Boucles d\'oreilles', 'Montre', 'Chaîne', 'Pendentif'] }
      ]
    },
    accessoires: {
      name: 'Accessoires',
      attributes: [
        { name: 'color', label: 'Couleur', type: 'text', required: false },
        { name: 'material', label: 'Matériau', type: 'text', required: false },
        { name: 'size', label: 'Taille', type: 'text', required: false }
      ]
    },
    cosmetiques: {
      name: 'Cosmétiques',
      attributes: [
        { name: 'volume', label: 'Volume', type: 'text', required: false },
        { name: 'skin_type', label: 'Type de peau', type: 'select', required: false, options: ['Normale', 'Sèche', 'Grasse', 'Mixte', 'Sensible'] },
        { name: 'brand', label: 'Marque', type: 'text', required: false },
        { name: 'expiry_date', label: 'Date d\'expiration', type: 'date', required: false }
      ]
    },
    parfums: {
      name: 'Parfums',
      attributes: [
        { name: 'volume', label: 'Volume (ml)', type: 'text', required: false },
        { name: 'type', label: 'Type', type: 'select', required: false, options: ['Eau de parfum', 'Eau de toilette', 'Brume', 'Huile parfumée', 'Encens', 'Thiouraye'] },
        { name: 'gender', label: 'Genre', type: 'select', required: false, options: ['Homme', 'Femme', 'Unisexe'] }
      ]
    },
    tissus: {
      name: 'Tissus',
      attributes: [
        { name: 'length', label: 'Longueur (mètres)', type: 'number', required: false, unit: 'm' },
        { name: 'width', label: 'Largeur (cm)', type: 'number', required: false, unit: 'cm' },
        { name: 'material', label: 'Type de tissu', type: 'select', required: false, options: ['Coton', 'Soie', 'Laine', 'Polyester', 'Lin', 'Velours', 'Denim', 'Satin', 'Crêpe'] },
        { name: 'pattern', label: 'Motif', type: 'select', required: false, options: ['Uni', 'Rayé', 'À pois', 'Fleuré', 'Géométrique', 'Abstrait', 'Animaux'] },
        { name: 'color', label: 'Couleur', type: 'text', required: false }
      ]
    },
    telephones: {
      name: 'Téléphones & Tablettes',
      attributes: [
        { name: 'brand', label: 'Marque', type: 'select', required: false, options: ['Samsung', 'iPhone', 'Xiaomi', 'Tecno', 'Infinix', 'Huawei', 'Oppo', 'Realme', 'Autre'] },
        { name: 'storage', label: 'Stockage', type: 'select', required: false, options: ['16 Go', '32 Go', '64 Go', '128 Go', '256 Go', '512 Go', '1 To'] },
        { name: 'condition', label: 'État', type: 'select', required: false, options: ['Neuf', 'Reconditionné', 'Occasion'] },
        { name: 'color', label: 'Couleur', type: 'text', required: false }
      ]
    },
    electronique: {
      name: 'Électronique',
      attributes: [
        { name: 'brand', label: 'Marque', type: 'text', required: false },
        { name: 'condition', label: 'État', type: 'select', required: false, options: ['Neuf', 'Reconditionné', 'Occasion'] },
        { name: 'warranty', label: 'Garantie', type: 'text', required: false }
      ]
    },
    informatique: {
      name: 'Informatique',
      attributes: [
        { name: 'brand', label: 'Marque', type: 'text', required: false },
        { name: 'type', label: 'Type', type: 'select', required: false, options: ['Ordinateur portable', 'Ordinateur bureau', 'Écran', 'Clavier', 'Souris', 'Imprimante', 'Câble', 'Disque dur', 'Clé USB', 'Autre'] },
        { name: 'condition', label: 'État', type: 'select', required: false, options: ['Neuf', 'Reconditionné', 'Occasion'] }
      ]
    },
    alimentation: {
      name: 'Alimentation',
      attributes: [
        { name: 'weight', label: 'Poids', type: 'number', required: false, unit: 'kg' },
        { name: 'expiry_date', label: 'Date d\'expiration', type: 'date', required: false },
        { name: 'origin', label: 'Origine', type: 'text', required: false },
        { name: 'storage', label: 'Conservation', type: 'select', required: false, options: ['Ambiance', 'Réfrigérateur', 'Congélateur', 'Sec'] }
      ]
    },
    maison: {
      name: 'Maison',
      attributes: [
        { name: 'dimensions', label: 'Dimensions', type: 'text', required: false },
        { name: 'material', label: 'Matériau', type: 'text', required: false },
        { name: 'color', label: 'Couleur', type: 'text', required: false },
        { name: 'room', label: 'Pièce', type: 'select', required: false, options: ['Salon', 'Cuisine', 'Chambre', 'Salle de bain', 'Bureau', 'Jardin', 'Balcon'] }
      ]
    },
    decoration: {
      name: 'Décoration',
      attributes: [
        { name: 'type', label: 'Type', type: 'select', required: false, options: ['Tableau', 'Cadre', 'Vase', 'Coussin', 'Tapis', 'Rideau', 'Miroir', 'Bougie', 'Plante artificielle', 'Autre'] },
        { name: 'color', label: 'Couleur', type: 'text', required: false },
        { name: 'dimensions', label: 'Dimensions', type: 'text', required: false }
      ]
    },
    sport: {
      name: 'Sport & Fitness',
      attributes: [
        { name: 'type', label: 'Type', type: 'select', required: false, options: ['Vêtement sport', 'Équipement', 'Chaussure sport', 'Accessoire', 'Nutrition sportive'] },
        { name: 'size', label: 'Taille', type: 'select', required: false, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique'] }
      ]
    },
    bebe: {
      name: 'Bébé & Enfants',
      attributes: [
        { name: 'age_range', label: 'Tranche d\'âge', type: 'select', required: false, options: ['0-3 mois', '3-6 mois', '6-12 mois', '1-2 ans', '2-4 ans', '4-8 ans', '8-12 ans'] },
        { name: 'type', label: 'Type', type: 'select', required: false, options: ['Vêtement', 'Jouet', 'Puériculture', 'Couches', 'Alimentation', 'Accessoire'] },
        { name: 'gender', label: 'Genre', type: 'select', required: false, options: ['Garçon', 'Fille', 'Mixte'] }
      ]
    },
    auto: {
      name: 'Auto & Moto',
      attributes: [
        { name: 'type', label: 'Type', type: 'select', required: false, options: ['Pièce détachée', 'Accessoire', 'Huile & Lubrifiant', 'Pneu', 'Entretien', 'Décoration'] },
        { name: 'vehicle', label: 'Véhicule', type: 'select', required: false, options: ['Voiture', 'Moto', 'Scooter', 'Camion', 'Universel'] }
      ]
    },
    artisanat: {
      name: 'Artisanat',
      attributes: [
        { name: 'technique', label: 'Technique', type: 'select', required: false, options: ['Couture', 'Crochet', 'Tricot', 'Poterie', 'Vannerie', 'Sculpture', 'Peinture', 'Broderie', 'Teinture'] },
        { name: 'material', label: 'Matériau', type: 'text', required: false },
        { name: 'origin', label: 'Origine', type: 'text', required: false }
      ]
    },
    services: {
      name: 'Services',
      attributes: [
        { name: 'duration', label: 'Durée', type: 'text', required: false },
        { name: 'location', label: 'Lieu', type: 'text', required: false },
        { name: 'type', label: 'Type de service', type: 'select', required: false, options: ['Coiffure', 'Manucure', 'Massage', 'Cours', 'Réparation', 'Transport', 'Nettoyage', 'Consultation'] }
      ]
    }
  };

  useEffect(() => {
    if (initialData) {
      // Traiter les images
      let images = initialData.images;
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch (e) {
          images = [];
        }
      }
      if (!Array.isArray(images)) {
        images = [];
      }

      // Traiter les tags
      let tags = initialData.tags;
      if (typeof tags === 'string') {
        try {
          tags = JSON.parse(tags);
        } catch (e) {
          tags = [];
        }
      }
      if (!Array.isArray(tags)) {
        tags = [];
      }

      // Traiter les attributs
      let attributes = initialData.attributes;
      if (typeof attributes === 'string') {
        try {
          attributes = JSON.parse(attributes);
        } catch (e) {
          attributes = {};
        }
      }
      if (!attributes || typeof attributes !== 'object') {
        attributes = {};
      }

      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price?.toString() || '',
        stock_quantity: initialData.stock_quantity?.toString() || '',
        category: initialData.category || 'general',
        weight: initialData.weight?.toString() || '',
        dimensions: initialData.dimensions || { length: '', width: '', height: '' },
        images: images,
        tags: tags,
        attributes: attributes,
        has_variants: initialData.has_variants || false
      });
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Réinitialiser les attributs si la catégorie change
    if (field === 'category') {
      setFormData(prev => ({
        ...prev,
        category: value,
        attributes: {}
      }));
    }
  };

  const handleAttributeChange = (attrName, value) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attrName]: value
      }
    }));
  };

  const handleDimensionChange = (dimension, value) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value
      }
    }));
  };

  const handlePhotoCaptured = (images) => {
    // Si c'est une seule image (pas un tableau)
    if (!Array.isArray(images)) {
      images = [images];
    }
    
    // Formater les images pour s'assurer qu'elles ont les bonnes propriétés
    const formattedImages = images.map(image => {
      // Si c'est un objet d'Unsplash, extraire l'URL
      if (typeof image === 'object' && image.url) {
        return {
          id: image.id,
          url: image.url,
          thumbnail: image.thumbnail || image.url,
          alt: image.alt || 'Image de produit',
          source: image.source || 'unsplash',
          photographer: image.photographer
        };
      }
      // Si c'est déjà une URL string
      else if (typeof image === 'string') {
        return {
          id: Date.now() + Math.random(),
          url: image,
          thumbnail: image,
          alt: 'Image de produit',
          source: 'upload'
        };
      }
      // Sinon, retourner tel quel
      return image;
    });
    
    console.log('📸 Images formatées pour sauvegarde:', formattedImages);
    
    setFormData(prev => ({
      ...prev,
      images: [...(Array.isArray(prev.images) ? prev.images : []), ...formattedImages]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: (Array.isArray(prev.images) ? prev.images : []).filter((_, i) => i !== index)
    }));
  };

  const addTag = (tag) => {
    if (tag && !(Array.isArray(formData.tags) ? formData.tags : []).includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(Array.isArray(prev.tags) ? prev.tags : []), tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: (Array.isArray(prev.tags) ? prev.tags : []).filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Le nom du produit est requis';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Le prix doit être supérieur à 0';
    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) newErrors.stock_quantity = 'La quantité doit être 0 ou plus';

    // Validation des attributs (tous optionnels pour plus de flexibilité)
    // Les attributs sont maintenant tous optionnels

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Version de test avec données minimales
      const submitData = {
        name: formData.name,
        description: formData.description || '',
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        category: formData.category || 'general',
        // Images simplifiées - seulement les URLs
        images: Array.isArray(formData.images) ? formData.images.map(img => {
          if (typeof img === 'object' && img.url) {
            return img.url; // Seulement l'URL
          }
          return img;
        }) : [],
        // Attributs simplifiés
        attributes: formData.attributes || {},
        // Tags
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        // Dimensions seulement si définies
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions.length || formData.dimensions.width || formData.dimensions.height ? {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : null,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : null,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : null
        } : null
      };

      console.log('📤 Données envoyées au serveur (version test):', submitData);
      console.log('📤 Images simplifiées:', submitData.images);

      await onSubmit(submitData);
    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      console.error('❌ Détails de l\'erreur:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Color map for visual swatches
  const colorMap = {
    'Rouge': '#EF4444',
    'Bleu': '#3B82F6',
    'Vert': '#22C55E',
    'Noir': '#111827',
    'Blanc': '#F9FAFB',
    'Jaune': '#EAB308',
    'Orange': '#F97316',
    'Violet': '#8B5CF6',
    'Rose': '#EC4899',
    'Gris': '#9CA3AF',
    'Marron': '#92400E',
    'Beige': '#D2B48C',
    'Bordeaux': '#7F1D1D',
    'Turquoise': '#06B6D4',
    'Doré': '#D4A017',
  };

  const renderAttributeField = (attr) => {
    const value = formData.attributes[attr.name] || '';
    const error = errors[`attr_${attr.name}`];

    // Color swatch picker for color attributes
    if (attr.name === 'color' && attr.type === 'select') {
      return (
        <div key={attr.name} className="space-y-2">
          <Label className="text-sm font-medium">{attr.label}</Label>
          <div className="flex flex-wrap gap-2">
            {attr.options.map(colorName => {
              const hex = colorMap[colorName] || '#9CA3AF';
              const isSelected = value === colorName;
              const isWhite = colorName === 'Blanc';
              return (
                <button
                  key={colorName}
                  type="button"
                  onClick={() => handleAttributeChange('color', colorName)}
                  className={`w-9 h-9 rounded-full transition-all duration-150 flex items-center justify-center ${
                    isSelected
                      ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110'
                      : 'hover:scale-105'
                  } ${isWhite ? 'border border-gray-200' : ''}`}
                  style={{ backgroundColor: hex }}
                  title={colorName}
                >
                  {isSelected && (
                    <svg className={`w-4 h-4 ${isWhite || colorName === 'Jaune' ? 'text-gray-900' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          {value && <p className="text-xs text-gray-500 mt-1">{value}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );
    }

    switch (attr.type) {
      case 'select':
        return (
          <div key={attr.name} className="space-y-2">
            <Label htmlFor={attr.name} className="text-sm font-medium">
              {attr.label}
            </Label>
            <Select value={value} onValueChange={(val) => handleAttributeChange(attr.name, val)}>
              <SelectTrigger className={`w-full ${error ? 'border-red-500' : ''}`}>
                <SelectValue placeholder={`Sélectionner ${attr.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {attr.options.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={attr.name} className="space-y-2">
            <Label htmlFor={attr.name} className="text-sm font-medium">
              {attr.label}
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={value}
                onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                className={`flex-1 ${error ? 'border-red-500' : ''}`}
                step="0.01"
              />
              {attr.unit && <span className="text-sm text-gray-500 self-center">{attr.unit}</span>}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={attr.name} className="space-y-2">
            <Label htmlFor={attr.name} className="text-sm font-medium">
              {attr.label}
            </Label>
            <Input
              type="date"
              value={value}
              onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
              className={`w-full ${error ? 'border-red-500' : ''}`}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      default: // text
        return (
          <div key={attr.name} className="space-y-2">
            <Label htmlFor={attr.name} className="text-sm font-medium">
              {attr.label}
            </Label>
            <Input
              type="text"
              value={value}
              onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
              className={`w-full ${error ? 'border-red-500' : ''}`}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Informations de base */}
      <Card className="dark:bg-[#0f1a2a] dark:border-[#1c2638]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Informations de base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nom du produit <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Robe élégante"
              className={`w-full ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">Catégorie</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categories).map(([key, category]) => (
                  <SelectItem key={key} value={key}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Prix (FCFA) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Ex: 25000"
                className={`w-full ${errors.price ? 'border-red-500' : ''}`}
                step="100"
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity" className="text-sm font-medium">
                Quantité en stock <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                placeholder="Ex: 10"
                className={`w-full ${errors.stock_quantity ? 'border-red-500' : ''}`}
                min="0"
              />
              {errors.stock_quantity && <p className="text-sm text-red-500">{errors.stock_quantity}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Décrivez votre produit..."
              rows={3}
              className="w-full resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Attributs spécifiques à la catégorie */}
      {categories[formData.category]?.attributes?.length > 0 && (
        <Card className="dark:bg-[#0f1a2a] dark:border-[#1c2638]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Attributs spécifiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories[formData.category].attributes.map(renderAttributeField)}
          </CardContent>
        </Card>
      )}

      {/* Photos */}
      <Card className="dark:bg-[#0f1a2a] dark:border-[#1c2638]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Photos du produit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageGallery
            images={Array.isArray(formData.images) ? formData.images : []}
            onImageRemove={removeImage}
            showThumbnails={true}
            maxThumbnails={6}
            className="mb-4"
          />
          
          {/* Bouton Unsplash - TRÈS VISIBLE */}
          <Button
            type="button"
            onClick={() => setShowImageLibrary(true)}
            variant="outline"
            className="w-full py-3 sm:py-4 border-2 border-dashed border-blue-500 hover:border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm sm:text-base"
          >
            <Search className="w-4 h-4 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            <span className="hidden sm:inline">📸 Rechercher dans la librairie d'images Unsplash</span>
            <span className="sm:hidden">📸 Rechercher images</span>
          </Button>
          
          <div className="text-center text-xs sm:text-sm text-gray-500 font-medium">
            ─── ou ───
          </div>
          
          <ImageCapture
            onImageUpload={handlePhotoCaptured}
            multiple={true}
            maxImages={10}
            uploadType="product"
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Tags */}
      <Card className="dark:bg-[#0f1a2a] dark:border-[#1c2638]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(formData.tags) ? formData.tags : []).map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs sm:text-sm">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter un tag"
              className="flex-1 text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.querySelector('input[placeholder="Ajouter un tag"]');
                if (input && input.value) {
                  addTag(input.value);
                  input.value = '';
                }
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 py-3 sm:py-2 text-sm sm:text-base"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 sm:py-2 text-sm sm:text-base"
        >
          {isLoading ? 'Enregistrement...' : (initialData ? 'Modifier' : 'Ajouter')}
        </Button>
      </div>

      {/* Modal Librairie d'images */}
      {showImageLibrary && (
        <SimpleImageLibrary
          onImageSelect={handlePhotoCaptured}
          onClose={() => setShowImageLibrary(false)}
        />
      )}
    </form>
  );
};

export default ProductForm; 