import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getBackendUrl } from '../config/domains';
import ApiService from '../services/api';
import { toast } from 'sonner';
import {
  Store,
  Camera,
  Trash2,
  Save,
  Loader2,
  User,
  FileText,
  Image,
} from 'lucide-react';

const SettingsPage = () => {
  const { seller } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getShopProfile();
      const data = res.data || {};
      setName(data.name || '');
      setDescription(data.description || '');
      setLogoUrl(data.logo_url || null);
    } catch (err) {
      console.error(err);
      // Fallback to seller context
      if (seller) {
        setName(seller.name || '');
        setDescription(seller.description || '');
        setLogoUrl(seller.logo_url || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Le nom de la boutique est requis');
      return;
    }
    setSaving(true);
    try {
      await ApiService.updateShopProfile({ name: name.trim(), description: description.trim() });
      toast.success('Profil mis à jour');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await ApiService.uploadLogo(formData);
      setLogoUrl(res.data.logo_url);
      setLogoPreview(null);
      toast.success('Logo mis à jour');
    } catch (err) {
      toast.error(err.message || 'Erreur upload');
      setLogoPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteLogo = async () => {
    setUploading(true);
    try {
      await ApiService.deleteLogo();
      setLogoUrl(null);
      setLogoPreview(null);
      toast.success('Logo supprimé');
    } catch (err) {
      toast.error(err.message || 'Erreur');
    } finally {
      setUploading(false);
    }
  };

  const getLogoSrc = () => {
    if (logoPreview) return logoPreview;
    if (logoUrl) {
      return logoUrl.startsWith('http') ? logoUrl : `${getBackendUrl()}${logoUrl}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  const logoSrc = getLogoSrc();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg mx-auto px-4 py-6 lg:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
          <p className="text-sm text-gray-400 mt-1">Personnalisez votre boutique</p>
        </div>

        {/* Logo section */}
        <div className="mb-8">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block">
            Logo de la boutique
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt="Logo"
                  className="w-20 h-20 rounded-2xl object-cover bg-gray-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Store className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-gray-900 animate-spin" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                {logoSrc ? 'Changer' : 'Ajouter'}
              </button>
              {logoUrl && (
                <button
                  onClick={handleDeleteLogo}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 text-red-500 text-sm font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoSelect}
            className="hidden"
          />
          <p className="text-xs text-gray-400 mt-2">PNG, JPG. Max 5 Mo. S'affiche sur votre boutique en ligne.</p>
        </div>

        {/* Name */}
        <div className="mb-6">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
            Nom de la boutique
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Boutique Awa"
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
            Description
          </label>
          <div className="relative">
            <FileText className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Décrivez votre boutique en quelques mots..."
              rows={3}
              maxLength={500}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 transition-all resize-none"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/500</p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white h-[52px] rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Enregistrer
            </>
          )}
        </button>

        {/* Info */}
        <div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Image className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Le logo et le nom s'affichent sur votre boutique en ligne visible par vos clients. Choisissez une image carrée pour un meilleur rendu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
