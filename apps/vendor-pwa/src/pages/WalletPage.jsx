import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Smartphone, CreditCard, Save, Trash2, Plus } from 'lucide-react';
import ApiService from '../services/api';
import { toast } from 'sonner';

const defaultAccounts = [
  { method: 'wave', label: 'Wave', icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-50' },
  { method: 'orange_money', label: 'Orange Money', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50' },
];

const WalletPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState({});

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getPaymentSettings();
      const data = res.data || {};
      // Normaliser un conteneur simple { wave: { phone, enabled }, orange_money: { phone, enabled } }
      const settings = data.payment_settings || {};
      const enabled = Array.isArray(data.payment_methods_enabled) ? data.payment_methods_enabled : (typeof data.payment_methods_enabled === 'string' ? (JSON.parse(data.payment_methods_enabled || '[]')) : []);
      const normalized = {
        wave: { phone: settings.wave?.phone || '', enabled: enabled.includes('wave') },
        orange_money: { phone: settings.orange_money?.phone || '', enabled: enabled.includes('orange_money') },
      };
      setAccounts(normalized);
    } catch (e) {
      console.error(e);
      toast.error('Impossible de charger les moyens de paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (method, field, value) => {
    setAccounts(prev => ({
      ...prev,
      [method]: { ...prev[method], [field]: value }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const enabled = Object.entries(accounts)
        .filter(([, v]) => v.enabled && v.phone)
        .map(([k]) => k);
      await ApiService.updatePaymentSettings({
        wave_phone: accounts.wave?.phone || '',
        orange_money_phone: accounts.orange_money?.phone || '',
        payment_methods_enabled: enabled,
      });
      toast.success('Wallet enregistré');
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet</h1>
        <p className="text-gray-600 dark:text-gray-400">Ajoutez vos numéros Wave et Orange Money. Ils seront affichés au client lors du choix du paiement.</p>
      </div>

      <div className="grid gap-6">
        {defaultAccounts.map(({ method, label, icon: Icon, color, bg }) => (
          <Card key={method}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${color}`} /> {label}
              </CardTitle>
              <CardDescription>Numéro utilisé pour recevoir les paiements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Numéro</Label>
                <Input
                  type="tel"
                  placeholder="Ex: +221771234567"
                  value={accounts[method]?.phone || ''}
                  onChange={(e) => handleChange(method, 'phone', e.target.value)}
                />
                <p className="text-xs text-gray-500">Format international recommandé</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`${accounts[method]?.enabled ? bg : 'bg-gray-100'} text-gray-700`}>{accounts[method]?.enabled ? 'Activé' : 'Désactivé'}</Badge>
                </div>
                <Button
                  variant={accounts[method]?.enabled ? 'outline' : 'default'}
                  onClick={() => handleChange(method, 'enabled', !accounts[method]?.enabled)}
                >
                  {accounts[method]?.enabled ? 'Désactiver' : 'Activer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  );
};

export default WalletPage;


