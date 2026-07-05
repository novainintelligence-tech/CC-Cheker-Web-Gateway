-- 001_init.sql: initial schema for CC-Cheker Web Gateway

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gateways (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  tx_ref VARCHAR(200) UNIQUE NOT NULL,
  gateway VARCHAR(200) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(200) NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bulk_jobs (
  id SERIAL PRIMARY KEY,
  job_ref VARCHAR(200) UNIQUE NOT NULL,
  total INT DEFAULT 0,
  processed INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  result JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed some gateways
INSERT INTO gateways (name, slug, config, enabled)
VALUES
('Flutterwave','flutterwave','{}', true),
('Stripe','stripe','{}', true),
('PayPal','paypal','{}', true)
ON CONFLICT (slug) DO NOTHING;
