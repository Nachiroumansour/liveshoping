-- Script pour créer un compte superadmin en production
-- À exécuter sur ta base de données PostgreSQL

-- 1. Créer le vendeur avec role superadmin
INSERT INTO sellers (
  phone_number,
  name,
  pin_hash,
  public_link_id,
  is_active,
  role,
  credit_balance,
  created_at,
  updated_at
) VALUES (
  '+221700000000',  -- CHANGE CE NUMÉRO
  'Super Admin',
  '$2a$10$XxXxXxXxXxXxXxXxXxXxXe',  -- Hash temporaire, à changer via l'app
  'superadmin',
  true,
  'superadmin',  -- ou 'super_admin'
  9999,  -- Crédits illimités
  NOW(),
  NOW()
) ON CONFLICT (phone_number) DO UPDATE 
SET role = 'superadmin', credit_balance = 9999;

-- 2. Vérifier la création
SELECT id, name, phone_number, role, credit_balance 
FROM sellers 
WHERE role IN ('superadmin', 'super_admin');
