/**
 * Number control component for the overlay UI
 */

import React from 'react';
import type { NumberDialConfig } from '../types';

export interface NumberControlProps {
  id: string;
  value: number;
  config: NumberDialConfig;
  onChange: (value: number) => void;
  onReset: () => void;
}

export function NumberControl({ id, value, config, onChange, onReset }: NumberControlProps) {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  const hasRange = config.min !== undefined && config.max !== undefined;

  return (
    <div className="dial-control number-control">
      <div className="control-header">
        <label htmlFor={id}>{config.label}</label>
        {config.description && <span className="control-description">{config.description}</span>}
        <button className="reset-button" onClick={onReset} title="Reset to default">
          ↺
        </button>
      </div>

      <div className="control-body">
        {hasRange && (
          <>
            {/* Slider */}
            <div className="number-slider">
              <input
                type="range"
                min={config.min}
                max={config.max}
                step={config.step || 1}
                value={value}
                onChange={handleSliderChange}
                title={`${config.min} - ${config.max}`}
              />
            </div>
            {/* Input */}
            <div className="number-input">
              <input
                type="number"
                value={value}
                onChange={handleInputChange}
                min={config.min}
                max={config.max}
                step={config.step || 1}
              />
              {config.unit && <span className="number-unit">{config.unit}</span>}
            </div>
          </>
        )}
        {!hasRange && (
          <div className="number-input" style={{ gridColumn: '1 / -1' }}>
            <input
              type="number"
              value={value}
              onChange={handleInputChange}
              min={config.min}
              max={config.max}
              step={config.step || 1}
            />
            {config.unit && <span className="number-unit">{config.unit}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
