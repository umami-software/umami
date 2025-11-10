/**
 * Validation result structure
 */
export interface ValidationResult {
  /** Name of the validation check */
  check: string;

  /** Status of the check */
  status: 'pass' | 'fail' | 'warning';

  /** Human-readable message */
  message: string;

  /** Suggested fix for failures (optional) */
  solution?: string;

  /** Link to relevant documentation (optional) */
  documentation?: string;
}

/**
 * Overall setup status
 */
export interface SetupStatus {
  /** Overall status */
  overall: 'ready' | 'incomplete' | 'error';

  /** Number of passed checks */
  passed: number;

  /** Number of failed checks */
  failed: number;

  /** Number of warnings */
  warnings: number;

  /** All validation results */
  results: ValidationResult[];

  /** Suggested next steps */
  nextSteps?: string[];
}

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  /** PostgreSQL database connection string (required) */
  DATABASE_URL: string;

  /** Base path for deployment (optional) */
  BASE_PATH?: string;

  /** Cloud mode enabled (optional) */
  CLOUD_MODE?: string;

  /** Cloud URL (optional) */
  CLOUD_URL?: string;

  /** Tracker script name (optional) */
  TRACKER_SCRIPT_NAME?: string;

  /** Force SSL (optional) */
  FORCE_SSL?: string;

  /** Default locale (optional) */
  DEFAULT_LOCALE?: string;

  /** Allowed frame URLs (optional) */
  ALLOWED_FRAME_URLS?: string;
}
