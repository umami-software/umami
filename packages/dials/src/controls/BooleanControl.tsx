/**
 * Boolean control component for the overlay UI
 */

import React from 'react';
import type { BooleanDialConfig } from '../types';

export interface BooleanControlProps {
  id: string;
  value: boolean;
  config: BooleanDialConfig;
  onChange: (value: boolean) => void;
  onReset: () => void;
}

export function BooleanControl({ id, value, config, onChange, onReset }: BooleanControlProps) {
  const trueLabel = config.trueLabel || 'On';
  const falseLabel = config.falseLabel || 'Off';

  return (
    <div className="dial-control boolean-control">
      <div className="control-header">
        <label htmlFor={id}>{config.label}</label>
        {config.description && <span className="control-description">{config.description}</span>}
        <button className="reset-button" onClick={onReset} title="Reset to default">
          ↺
        </button>
      </div>

      <div className="control-body">
        <div className="boolean-toggle">
          <button
            className={`toggle-option ${value ? 'active' : ''}`}
            onClick={() => onChange(true)}
          >
            {trueLabel}
          </button>
          <button
            className={`toggle-option ${!value ? 'active' : ''}`}
            onClick={() => onChange(false)}
          >
            {falseLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
