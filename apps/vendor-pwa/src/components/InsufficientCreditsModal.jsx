import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InsufficientCreditsModal.css';

/**
 * Modal pour afficher un message d'insuffisance de crédits
 * Permet à l'utilisateur d'acheter des crédits ou d'annuler l'action
 */
const InsufficientCreditsModal = ({
  isOpen,
  onClose,
  currentBalance = 0,
  requiredCredits = 0,
  actionName = 'cette action',
  onProceedToBuy = null
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const missingCredits = requiredCredits - currentBalance;

  const handleBuyCredits = async () => {
    setIsLoading(true);
    if (onProceedToBuy) {
      try {
        await onProceedToBuy();
      } catch (error) {
        console.error('Erreur lors de la navigation vers l\'achat:', error);
      }
    } else {
      navigate('/credits');
    }
    setIsLoading(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="insufficient-credits-modal-overlay" onClick={onClose}>
      <div
        className="insufficient-credits-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec icône */}
        <div className="modal-header">
          <div className="credits-icon">⚠️</div>
          <h2>Crédits insuffisants</h2>
        </div>

        {/* Body avec détails */}
        <div className="modal-body">
          <div className="credit-info">
            <p className="info-text">
              Vous avez besoin de <strong>{requiredCredits}</strong> crédits pour {actionName}
            </p>
            
            <div className="credit-comparison">
              <div className="credit-item current">
                <span className="label">Vous avez:</span>
                <span className="value">{currentBalance} cr</span>
              </div>
              <div className="credit-item required">
                <span className="label">Vous en avez besoin:</span>
                <span className="value">{requiredCredits} cr</span>
              </div>
              <div className="credit-item missing">
                <span className="label">Manquants:</span>
                <span className="value">-{missingCredits} cr</span>
              </div>
            </div>

            <div className="help-text">
              <p>
                Achetez des crédits pour continuer. Plus vous en achetez,
                moins cher ils sont !
              </p>
            </div>
          </div>
        </div>

        {/* Footer avec boutons */}
        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            className="btn-buy-credits"
            onClick={handleBuyCredits}
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : 'Acheter des crédits'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsufficientCreditsModal;
