-- Migration: Create Recommendation Engine Tables
-- Created: 2025-01-15
-- Description: Creates tables for user profiles, recommendations tracking, and ML model registry

-- ============================================================================
-- Table: user_profiles
-- Purpose: Aggregated user behavior and preferences for personalization
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) UNIQUE NOT NULL, -- Can be session_id or logged-in user_id
  website_id UUID NOT NULL,
  
  -- Lifecycle
  lifecycle_stage VARCHAR(50), -- 'new', 'active', 'at_risk', 'churned'
  funnel_position VARCHAR(50), -- 'awareness', 'consideration', 'decision', 'retention'
  
  -- Engagement metrics
  session_count INTEGER DEFAULT 0,
  total_pageviews INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  total_revenue DECIMAL(19, 4) DEFAULT 0,
  
  -- Behavior
  avg_session_duration INTEGER, -- seconds
  avg_time_on_page INTEGER, -- seconds
  avg_scroll_depth INTEGER, -- percentage
  bounce_rate DECIMAL(5, 4),
  
  -- Preferences (JSONB for flexibility)
  favorite_categories JSONB, -- ['electronics', 'books']
  favorite_products JSONB, -- ['product_id_1', 'product_id_2']
  price_sensitivity VARCHAR(20), -- 'low', 'medium', 'high'
  preferred_brands JSONB,
  device_preference VARCHAR(20), -- 'mobile', 'tablet', 'desktop'
  
  -- Timestamps
  first_visit TIMESTAMPTZ,
  last_visit TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_user_profiles_website FOREIGN KEY (website_id) REFERENCES website(website_id) ON DELETE CASCADE
);

-- Indexes for user_profiles
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_website_id ON user_profiles(website_id);
CREATE INDEX idx_user_profiles_lifecycle ON user_profiles(lifecycle_stage);
CREATE INDEX idx_user_profiles_last_visit ON user_profiles(last_visit);

-- Comments for user_profiles
COMMENT ON TABLE user_profiles IS 'Aggregated user behavior and preferences for personalization';
COMMENT ON COLUMN user_profiles.lifecycle_stage IS 'User lifecycle stage: new, active, at_risk, churned';
COMMENT ON COLUMN user_profiles.funnel_position IS 'User position in marketing funnel';
COMMENT ON COLUMN user_profiles.favorite_categories IS 'JSONB array of favorite product categories';
COMMENT ON COLUMN user_profiles.favorite_products IS 'JSONB array of favorite product IDs';

-- ============================================================================
-- Table: recommendations
-- Purpose: Historical recommendations for analysis and learning
-- ============================================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  user_id VARCHAR(255),
  website_id UUID NOT NULL,
  
  -- Recommendation details
  recommendation_type VARCHAR(50), -- 'product', 'content', 'offer'
  item_id VARCHAR(255) NOT NULL,
  score DECIMAL(5, 4),
  rank INTEGER,
  
  -- Context
  context JSONB, -- Page, product, category where shown
  strategy VARCHAR(50), -- 'collaborative', 'sequential', 'graph', etc.
  model_version VARCHAR(50),
  
  -- Personalization factors
  personalization_factors JSONB,
  
  -- Outcome
  shown BOOLEAN DEFAULT TRUE,
  clicked BOOLEAN DEFAULT FALSE,
  converted BOOLEAN DEFAULT FALSE,
  revenue DECIMAL(19, 4),
  
  -- Timestamps
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  
  CONSTRAINT fk_recommendations_website FOREIGN KEY (website_id) REFERENCES website(website_id) ON DELETE CASCADE
);

-- Indexes for recommendations
CREATE INDEX idx_recommendations_session ON recommendations(session_id);
CREATE INDEX idx_recommendations_user ON recommendations(user_id);
CREATE INDEX idx_recommendations_item ON recommendations(item_id);
CREATE INDEX idx_recommendations_shown_at ON recommendations(shown_at);
CREATE INDEX idx_recommendations_outcome ON recommendations(clicked, converted);
CREATE INDEX idx_recommendations_website ON recommendations(website_id);

-- Comments for recommendations
COMMENT ON TABLE recommendations IS 'Historical recommendations for analysis and learning';
COMMENT ON COLUMN recommendations.strategy IS 'Recommendation strategy used: collaborative, sequential, graph, etc.';
COMMENT ON COLUMN recommendations.personalization_factors IS 'JSONB object containing factors that influenced this recommendation';

-- ============================================================================
-- Table: ml_models
-- Purpose: Model registry and versioning
-- ============================================================================
CREATE TABLE IF NOT EXISTS ml_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  version VARCHAR(50) NOT NULL,
  model_type VARCHAR(50), -- 'collaborative_filtering', 'sequential', etc.
  
  -- Model metadata
  algorithm VARCHAR(100),
  hyperparameters JSONB,
  training_data_period JSONB, -- {start: '2025-01-01', end: '2025-01-15'}
  
  -- Performance metrics
  metrics JSONB, -- {precision: 0.15, recall: 0.25, ndcg: 0.30}
  
  -- Storage
  artifact_path VARCHAR(500), -- S3/local path to model file
  artifact_size_bytes BIGINT,
  
  -- Status
  status VARCHAR(20), -- 'training', 'validating', 'production', 'archived'
  is_active BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  trained_at TIMESTAMPTZ,
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(name, version)
);

-- Indexes for ml_models
CREATE INDEX idx_ml_models_name ON ml_models(name);
CREATE INDEX idx_ml_models_status ON ml_models(status);
CREATE INDEX idx_ml_models_active ON ml_models(is_active) WHERE is_active = TRUE;

-- Comments for ml_models
COMMENT ON TABLE ml_models IS 'ML model registry and versioning';
COMMENT ON COLUMN ml_models.status IS 'Model status: training, validating, production, archived';
COMMENT ON COLUMN ml_models.is_active IS 'Whether this model version is currently active in production';

