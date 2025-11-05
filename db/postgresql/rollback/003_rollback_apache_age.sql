-- Rollback Migration: Remove Apache AGE Graph Database
-- Created: 2025-01-15
-- Description: Drops Apache AGE graph and extension
-- WARNING: This will permanently delete all graph data!

-- Set search path to include ag_catalog
SET search_path = ag_catalog, "$user", public;

-- ============================================================================
-- Step 1: Drop Helper Functions
-- ============================================================================
DROP FUNCTION IF EXISTS execute_cypher(text, text) CASCADE;

-- ============================================================================
-- Step 2: Drop Graph (this will cascade to all vertices and edges)
-- ============================================================================
SELECT ag_catalog.drop_graph('user_journey', true);

-- ============================================================================
-- Step 3: Drop Apache AGE Extension
-- ============================================================================
-- Note: Only drop extension if no other graphs exist
-- Uncomment the following line if you want to completely remove Apache AGE
-- DROP EXTENSION IF EXISTS age CASCADE;

-- ============================================================================
-- Rollback Complete
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'Apache AGE Rollback Complete';
  RAISE NOTICE 'Dropped graph: user_journey';
  RAISE NOTICE 'Dropped helper functions: execute_cypher()';
  RAISE NOTICE 'Note: Apache AGE extension was NOT dropped (may be used by other graphs)';
  RAISE NOTICE '=================================================================';
END $$;

