import React from 'react';
import { AlertCircle, Coins, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const CreditAlert = ({ 
  currentBalance, 
  requiredCredits, 
  actionDescription, 
  onClose,
  showPurchaseButton = true 
}) => {
  const navigate = useNavigate();

  const handlePurchaseCredits = () => {
    // navigate('/credits'); // Désactivé temporairement
    if (onClose) onClose();
  };

  return (
    <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 ">
      <AlertCircle className="h-4 w-4 text-red-600 " />
      <AlertDescription className="text-red-800 dark:text-red-200 ">
        <div className="flex items-start justify-between ">
          <div className="flex-1 ">
            <p className="font-medium mb-2 ">
              Crédits insuffisants pour {actionDescription}
            </p>
            <div className="flex items-center gap-4 text-sm ">
              <div className="flex items-center gap-1 ">
                <Coins className="w-4 h-4 " />
                <span>Solde actuel: <strong>{currentBalance}</strong> crédits</span>
              </div>
              <div className="flex items-center gap-1 ">
                <span>Nécessaire: <strong>{requiredCredits}</strong> crédits</span>
              </div>
            </div>
            <p className="text-xs mt-2 opacity-75 ">
              Vous devez acheter des crédits pour continuer à utiliser cette fonctionnalité.
            </p>
          </div>
          {showPurchaseButton && (
            <Button
              size="sm"
              onClick={handlePurchaseCredits}
              className="bg-red-600 hover:bg-red-700 text-white ml-4 "
            >
              <ExternalLink className="w-4 h-4 mr-1 " />
              Acheter
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default CreditAlert; 