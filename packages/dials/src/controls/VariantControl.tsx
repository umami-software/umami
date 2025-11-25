/**
 * Variant control component for the overlay UI
 */

import React from 'react';
import type { VariantDialConfig } from '../types';

export interface VariantControlProps {
  id: string;
  value: string;
  config: VariantDialConfig;
  onChange: (value: string) => void;
  onReset: () => void;
}

export function VariantControl({ id, value, config, onChange, onReset }: VariantControlProps) {
  // Check if all options are numeric strings
  const allNumeric = config.options.every(opt => !isNaN(Number(opt)));

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = Number(e.target.value);
    onChange(config.options[index]);
  };

  const currentIndex = config.options.indexOf(value);

  return (
    <div className="dial-control variant-control">
      <div className="control-header">
        <label htmlFor={id}>{config.label}</label>
        {config.description && <span className="control-description">{config.description}</span>}
        <button className="reset-button" onClick={onReset} title="Reset to default">
          ↺
        </button>
      </div>

      <div className="control-body">
        {allNumeric ? (
          <div className="variant-slider">
            <input
              type="range"
              min={0}
              max={config.options.length - 1}
              step={1}
              value={currentIndex}
              onChange={handleSliderChange}
              title={`${config.options[0]} - ${config.options[config.options.length - 1]}`}
            />
          </div>
        ) : (
          <select className="variant-select" value={value} onChange={e => onChange(e.target.value)}>
            {config.options.map(option => {
              const label = config.optionLabels?.[option] || option;
              return (
                <option key={option} value={option}>
                  {label}
                </option>
              );
            })}
          </select>
        )}
      </div>
    </div>
  );
}
