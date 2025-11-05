-- Migration: Setup Apache AGE Graph Database
-- Created: 2025-01-15
-- Description: Installs Apache AGE extension and creates graph schema for user journey tracking
-- Requirements: PostgreSQL 17 + Apache AGE 1.6.0

-- ============================================================================
-- Step 1: Install Apache AGE Extension
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS age;

-- Load AGE into search path
SET search_path = ag_catalog, "$user", public;

-- ============================================================================
-- Step 2: Create Graph for User Journey Tracking
-- ============================================================================
SELECT ag_catalog.create_graph('user_journey');

-- ============================================================================
-- Step 3: Create Vertex Labels (Node Types)
-- ============================================================================

-- User nodes (represents sessions or logged-in users)
SELECT ag_catalog.create_vlabel('user_journey', 'User');

-- Product nodes
SELECT ag_catalog.create_vlabel('user_journey', 'Product');

-- Category nodes
SELECT ag_catalog.create_vlabel('user_journey', 'Category');

-- Page nodes
SELECT ag_catalog.create_vlabel('user_journey', 'Page');

-- Event nodes (for anomaly detection)
SELECT ag_catalog.create_vlabel('user_journey', 'Event');

-- ============================================================================
-- Step 4: Create Edge Labels (Relationship Types)
-- ============================================================================

-- Generic Relationships (Mode 1 - Always Available)
SELECT ag_catalog.create_elabel('user_journey', 'VIEWED');
SELECT ag_catalog.create_elabel('user_journey', 'ADDED_TO_CART');
SELECT ag_catalog.create_elabel('user_journey', 'PURCHASED');
SELECT ag_catalog.create_elabel('user_journey', 'SEARCHED_FOR');
SELECT ag_catalog.create_elabel('user_journey', 'NAVIGATED_TO');
SELECT ag_catalog.create_elabel('user_journey', 'BOUGHT_TOGETHER');
SELECT ag_catalog.create_elabel('user_journey', 'VIEWED_TOGETHER');
SELECT ag_catalog.create_elabel('user_journey', 'IN_CATEGORY');

-- Adaptive Relationships (Mode 2 - LLM-Enhanced, Optional)
SELECT ag_catalog.create_elabel('user_journey', 'SEMANTICALLY_SIMILAR');
SELECT ag_catalog.create_elabel('user_journey', 'PREDICTED_INTEREST');
SELECT ag_catalog.create_elabel('user_journey', 'COMPLEMENTARY');
SELECT ag_catalog.create_elabel('user_journey', 'ANOMALOUS_BEHAVIOR');

-- ============================================================================
-- Step 5: Create Helper Functions
-- ============================================================================

-- Function to execute Cypher queries safely
CREATE OR REPLACE FUNCTION execute_cypher(graph_name text, query text)
RETURNS SETOF agtype
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY EXECUTE format('SELECT * FROM ag_catalog.cypher(%L, %L) AS (result agtype)', graph_name, query);
END;
$$;

COMMENT ON FUNCTION execute_cypher IS 'Helper function to execute Cypher queries on Apache AGE graphs';

-- ============================================================================
-- Step 6: Create Indexes for Graph Performance
-- ============================================================================

-- Note: Apache AGE automatically creates indexes for vertex and edge IDs
-- Additional indexes can be created on properties as needed

-- ============================================================================
-- Step 7: Verify Installation
-- ============================================================================

-- Verify graph exists
DO $$
DECLARE
  graph_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO graph_count
  FROM ag_catalog.ag_graph
  WHERE name = 'user_journey';
  
  IF graph_count = 0 THEN
    RAISE EXCEPTION 'Graph user_journey was not created successfully';
  ELSE
    RAISE NOTICE 'Apache AGE setup complete: Graph user_journey created successfully';
  END IF;
END $$;

-- Verify vertex labels
DO $$
DECLARE
  vlabel_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO vlabel_count
  FROM ag_catalog.ag_label
  WHERE graph = (SELECT graphid FROM ag_catalog.ag_graph WHERE name = 'user_journey')
    AND kind = 'v';
  
  RAISE NOTICE 'Created % vertex labels', vlabel_count;
END $$;

-- Verify edge labels
DO $$
DECLARE
  elabel_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO elabel_count
  FROM ag_catalog.ag_label
  WHERE graph = (SELECT graphid FROM ag_catalog.ag_graph WHERE name = 'user_journey')
    AND kind = 'e';
  
  RAISE NOTICE 'Created % edge labels', elabel_count;
END $$;

-- ============================================================================
-- Step 8: Grant Permissions
-- ============================================================================

-- Grant usage on ag_catalog schema to application user
-- Note: Replace 'umami_user' with your actual database user
-- GRANT USAGE ON SCHEMA ag_catalog TO umami_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ag_catalog TO umami_user;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'Apache AGE Migration Complete';
  RAISE NOTICE 'Graph: user_journey';
  RAISE NOTICE 'Vertex Labels: User, Product, Category, Page, Event';
  RAISE NOTICE 'Edge Labels: VIEWED, ADDED_TO_CART, PURCHASED, SEARCHED_FOR, etc.';
  RAISE NOTICE 'Helper Functions: execute_cypher()';
  RAISE NOTICE '=================================================================';
END $$;

