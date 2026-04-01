
CREATE TABLE IF NOT EXISTS t_p78644969_casino_slot_mine.users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(10) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  balance NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p78644969_casino_slot_mine.transactions (
  id SERIAL PRIMARY KEY,
  from_user_id VARCHAR(10),
  to_user_id VARCHAR(10),
  amount NUMERIC(15, 2) NOT NULL,
  type VARCHAR(30) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p78644969_casino_slot_mine.promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  bonus_amount NUMERIC(15, 2) NOT NULL,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p78644969_casino_slot_mine.promo_uses (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(10),
  promo_code VARCHAR(50),
  used_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, promo_code)
);

INSERT INTO t_p78644969_casino_slot_mine.promo_codes (code, bonus_amount, max_uses) VALUES
  ('KAZAH100', 100, 999),
  ('WELCOME50', 50, 999),
  ('LUCKY200', 200, 100)
ON CONFLICT (code) DO NOTHING;
