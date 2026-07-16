import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminCreditsSettingsPage.css';

/**
 * Page d'administration pour gérer les paramètres du module de crédits
 */
const AdminCreditsSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  // État pour l'édition des packages
  const [editingPackage, setEditingPackage] = useState(null);
  const [editingCost, setEditingCost] = useState(null);
  const [stats, setStats] = useState(null);

  /**
   * Charger les paramètres
   */
  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/admin/settings/credits');
      setSettings(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/admin/settings/credits/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des stats:', err);
    }
  };

  /**
   * Activer/Désactiver le module
   */
  const handleToggleModule = async () => {
    try {
      setIsSaving(true);
      const response = await axios.post('/api/admin/settings/credits/toggle');
      setSettings(response.data.data);
      setSuccess(response.data.message);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du toggle');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Sauvegarder les modifications
   */
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await axios.put('/api/admin/settings/credits', settings);
      setSettings(response.data.data);
      setSuccess(response.data.message);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Mettre à jour le prix d'un package
   */
  const handleUpdatePackage = async (packageType, updatedData) => {
    try {
      setIsSaving(true);
      const response = await axios.put(
        `/api/admin/settings/credits/package/${packageType}`,
        updatedData
      );
      
      // Mettre à jour l'état local
      setSettings(prev => ({
        ...prev,
        packages: {
          ...prev.packages,
          [packageType]: response.data.data
        }
      }));
      
      setEditingPackage(null);
      setSuccess(`Package ${packageType} mis à jour`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Mettre à jour le coût d'une action
   */
  const handleUpdateActionCost = async (actionType, cost) => {
    try {
      setIsSaving(true);
      const response = await axios.put(
        `/api/admin/settings/credits/action-cost/${actionType}`,
        { cost: parseInt(cost) }
      );
      
      setSettings(prev => ({
        ...prev,
        actionCosts: response.data.data
      }));
      
      setEditingCost(null);
      setSuccess(response.data.message);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-credits-settings-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return <div className="admin-credits-settings-page error-message">Impossible de charger les paramètres</div>;
  }

  return (
    <div className="admin-credits-settings-page">
      {/* Header */}
      <div className="settings-header">
        <h1>🎛️ Gestion du Module de Crédits</h1>
        <p>Contrôlez l'activation, les tarifs et les règles du système de crédits</p>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Section Status */}
      <div className="status-card">
        <div className="status-info">
          <span className={`status-badge ${settings.enabled ? 'active' : 'inactive'}`}>
            {settings.enabled ? '🟢 Actif' : '🔴 Inactif'}
          </span>
          <p className="mode-text">Mode: <strong>{settings.mode === 'paid' ? '💳 Payant' : '🆓 Gratuit'}</strong></p>
        </div>
        <button
          className={`btn-toggle ${settings.enabled ? 'btn-disable' : 'btn-enable'}`}
          onClick={handleToggleModule}
          disabled={isSaving}
        >
          {settings.enabled ? 'Désactiver le module' : 'Activer le module'}
        </button>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          ⚙️ Général
        </button>
        <button
          className={`tab ${activeTab === 'packages' ? 'active' : ''}`}
          onClick={() => setActiveTab('packages')}
        >
          📦 Packages
        </button>
        <button
          className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          ⚡ Coûts des Actions
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistiques
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="general-settings">
            <div className="settings-group">
              <label>Crédits initiaux pour les nouveaux vendeurs</label>
              <input
                type="number"
                value={settings.initialCredits || 0}
                onChange={(e) => setSettings({
                  ...settings,
                  initialCredits: parseInt(e.target.value)
                })}
                min="0"
              />
              <p className="hint">Nombre de crédits donnés gratuitement aux nouveaux vendeurs</p>
            </div>

            <div className="settings-group">
              <label>Méthodes de paiement actives</label>
              <div className="payment-methods">
                {Object.entries(settings.paymentMethods || {}).map(([method, config]) => (
                  <label key={method} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        paymentMethods: {
                          ...settings.paymentMethods,
                          [method]: { ...config, enabled: e.target.checked }
                        }
                      })}
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              className="btn-save"
              onClick={handleSaveSettings}
              disabled={isSaving}
            >
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
            </button>
          </div>
        )}

        {/* Packages */}
        {activeTab === 'packages' && (
          <div className="packages-section">
            <div className="packages-grid">
              {Object.entries(settings.packages || {}).map(([packageType, data]) => (
                <div key={packageType} className="package-card">
                  <div className="package-header">
                    <h3>{packageType}</h3>
                    <p className="label">{data.label || packageType}</p>
                  </div>
                  <div className="package-body">
                    <div className="package-stat">
                      <span className="label">Crédits:</span>
                      <span className="value">{data.credits}</span>
                    </div>
                    <div className="package-stat">
                      <span className="label">Prix (XOF):</span>
                      <span className="value">{data.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="package-footer">
                    {editingPackage === packageType ? (
                      <div className="edit-form">
                        <input
                          type="number"
                          placeholder="Crédits"
                          defaultValue={data.credits}
                          id={`credits-${packageType}`}
                        />
                        <input
                          type="number"
                          placeholder="Prix"
                          defaultValue={data.price}
                          id={`price-${packageType}`}
                        />
                        <div className="edit-buttons">
                          <button
                            className="btn-save-edit"
                            onClick={() => {
                              const credits = parseInt(document.getElementById(`credits-${packageType}`).value);
                              const price = parseInt(document.getElementById(`price-${packageType}`).value);
                              handleUpdatePackage(packageType, { credits, price });
                            }}
                          >
                            ✓
                          </button>
                          <button
                            className="btn-cancel-edit"
                            onClick={() => setEditingPackage(null)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn-edit"
                        onClick={() => setEditingPackage(packageType)}
                      >
                        ✏️ Modifier
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Costs */}
        {activeTab === 'actions' && (
          <div className="action-costs-section">
            <div className="costs-table">
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Coût (Crédits)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(settings.actionCosts || {}).map(([actionType, cost]) => (
                    <tr key={actionType}>
                      <td>
                        <strong>{actionType}</strong>
                      </td>
                      <td>
                        {editingCost === actionType ? (
                          <input
                            type="number"
                            defaultValue={cost}
                            id={`cost-${actionType}`}
                            min="0"
                          />
                        ) : (
                          <span className="cost-value">{cost} cr</span>
                        )}
                      </td>
                      <td>
                        {editingCost === actionType ? (
                          <div className="action-buttons">
                            <button
                              className="btn-save-edit"
                              onClick={() => {
                                const newCost = parseInt(document.getElementById(`cost-${actionType}`).value);
                                handleUpdateActionCost(actionType, newCost);
                              }}
                            >
                              ✓
                            </button>
                            <button
                              className="btn-cancel-edit"
                              onClick={() => setEditingCost(null)}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn-edit-small"
                            onClick={() => setEditingCost(actionType)}
                          >
                            Modifier
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistics */}
        {activeTab === 'stats' && (
          <div className="stats-section">
            {stats ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <p className="stat-label">Transactions totales</p>
                    <p className="stat-value">{stats.totalTransactions}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <p className="stat-label">Transactions complétées</p>
                    <p className="stat-value">{stats.completedTransactions}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💳</div>
                  <div className="stat-content">
                    <p className="stat-label">Crédits consommés</p>
                    <p className="stat-value">{stats.totalCreditsUsed}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <p className="stat-label">Revenu total (XOF)</p>
                    <p className="stat-value">{stats.totalRevenue?.toLocaleString() || 0}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <p className="stat-label">Vendeurs avec crédits</p>
                    <p className="stat-value">{stats.sellersWithCredits}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p>Chargement des statistiques...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCreditsSettingsPage;
