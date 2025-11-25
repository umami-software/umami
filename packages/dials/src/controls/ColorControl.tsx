/**
 * Color control component for the overlay UI
 */

import React, { useState, useRef, useEffect } from 'react';
import type { ColorDialConfig } from '../types';
import { designManifest } from '@/config/niteshift-manifest';

export interface ColorControlProps {
  id: string;
  value: string;
  config: ColorDialConfig;
  onChange: (value: string) => void;
  onReset: () => void;
}

// Helper to get color name from design system
function getColorName(hex: string): string | null {
  const normalizedHex = hex.toLowerCase();

  // Check accent colors
  if (designManifest.colors.accent.values) {
    for (const [name, color] of Object.entries(designManifest.colors.accent.values)) {
      if (color.toLowerCase() === normalizedHex) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    }
  }

  // Check semantic colors
  if (designManifest.colors.semantic.values) {
    for (const [name, color] of Object.entries(designManifest.colors.semantic.values)) {
      if (color.toLowerCase() === normalizedHex) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    }
  }

  return null;
}

export function ColorControl({ id, value, config, onChange, onReset }: ColorControlProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const swatchRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const colorName = getColorName(value);

  const handleSwatchClick = () => {
    if (swatchRef.current) {
      const rect = swatchRef.current.getBoundingClientRect();
      setPickerPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
      setShowPicker(true);
    }
  };

  const handlePresetClick = (color: string) => {
    onChange(color);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Close picker when clicking outside
  useEffect(() => {
    if (!showPicker) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        swatchRef.current &&
        !swatchRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  return (
    <div className="dial-control color-control">
      <div className="control-header">
        <label htmlFor={id} title={config.description}>
          {config.label}
        </label>
        <button className="reset-button" onClick={onReset} title="Reset to default">
          ↺
        </button>
      </div>

      <div className="control-body">
        {/* Swatch */}
        <div
          ref={swatchRef}
          className="color-swatch"
          style={{ backgroundColor: value }}
          onClick={handleSwatchClick}
          title={colorName || value}
        />

        {/* Input */}
        <input
          type="text"
          className="color-value-input"
          value={colorName || value}
          onChange={handleInputChange}
          placeholder="#000000"
        />

        {/* Popover picker */}
        {showPicker && (
          <>
            <div className="color-picker-overlay" onClick={() => setShowPicker(false)} />
            <div
              ref={pickerRef}
              className="color-picker-wrapper"
              style={{
                top: pickerPosition.top,
                left: pickerPosition.left,
              }}
            >
              {/* Preset colors */}
              {config.options && config.options.length > 0 && (
                <div className="color-presets">
                  {config.options.map(color => {
                    const name = getColorName(color);
                    return (
                      <div
                        key={color}
                        className={`color-preset ${value === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => handlePresetClick(color)}
                        title={name || color}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
