/**
 * Spacing control component for the overlay UI
 */

import React from 'react';
import type { SpacingDialConfig } from '../types';

export interface SpacingControlProps {
  id: string;
  value: string;
  config: SpacingDialConfig;
  onChange: (value: string) => void;
  onReset: () => void;
}

export function SpacingControl({ id, value, config, onChange, onReset }: SpacingControlProps) {
  return (
    <div className="dial-control spacing-control">
      <div className="control-header">
        <label htmlFor={id}>{config.label}</label>
        {config.description && <span className="control-description">{config.description}</span>}
        <button className="reset-button" onClick={onReset} title="Reset to default">
          ↺
        </button>
      </div>

      <div className="control-body">
        {/* Preset spacing values */}
        {config.options && config.options.length > 0 && (
          <div className="spacing-options">
            {config.options.map(spacing => (
              <button
                key={spacing}
                className={`spacing-option ${value === spacing ? 'active' : ''}`}
                onClick={() => onChange(spacing)}
              >
                {spacing}
              </button>
            ))}
          </div>
        )}

        {/* Custom spacing input */}
        {config.allowCustom && (
          <div className="spacing-custom">
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={`e.g., 16${config.unit || 'px'}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
