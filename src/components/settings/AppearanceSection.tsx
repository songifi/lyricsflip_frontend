"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { Palette, Sun, Moon, Monitor, Type, Layout } from 'lucide-react';

interface AppearanceData {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

interface AppearanceSectionProps {
  data: AppearanceData;
  onChange: (data: AppearanceData) => void;
}

const accentColors = [
  { name: 'Purple', value: '#9747ff' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Teal', value: '#14b8a6' },
];

export function AppearanceSection({ data, onChange }: AppearanceSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Palette className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Appearance</h2>
      </div>

      {/* Theme Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              data.theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onChange({ ...data, theme: 'light' })}
          >
            <div className="flex items-center gap-3 mb-3">
              <Sun className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Light</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Clean, bright interface for daytime use
            </p>
          </div>

          <div
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              data.theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onChange({ ...data, theme: 'dark' })}
          >
            <div className="flex items-center gap-3 mb-3">
              <Moon className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Dark</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Easy on the eyes for low-light environments
            </p>
          </div>

          <div
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              data.theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onChange({ ...data, theme: 'system' })}
          >
            <div className="flex items-center gap-3 mb-3">
              <Monitor className="h-5 w-5 text-gray-500" />
              <span className="font-medium">System</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically match your system preference
            </p>
          </div>
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Accent Color</h3>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Choose your preferred accent color for buttons, links, and highlights
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {accentColors.map((color) => (
              <div
                key={color.value}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  data.accentColor === color.value ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onChange({ ...data, accentColor: color.value })}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="font-medium">{color.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Font Size</h3>
        <div className="space-y-3">
          <Select value={data.fontSize} onValueChange={(value: 'small' | 'medium' | 'large') => onChange({ ...data, fontSize: value })}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Select font size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">
                <div className="flex items-center gap-3">
                  <Type className="h-4 w-4" />
                  <span>Small</span>
                  <span className="text-sm text-muted-foreground">(12px)</span>
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-3">
                  <Type className="h-4 w-4" />
                  <span>Medium</span>
                  <span className="text-sm text-muted-foreground">(14px)</span>
                </div>
              </SelectItem>
              <SelectItem value="large">
                <div className="flex items-center gap-3">
                  <Type className="h-4 w-4" />
                  <span>Large</span>
                  <span className="text-sm text-muted-foreground">(16px)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Adjust the text size throughout the application
          </p>
        </div>
      </div>

      {/* Layout Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Layout Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Layout className="h-5 w-5 text-purple-500" />
              <div>
                <h4 className="font-medium">Compact Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Reduce spacing and padding for a more condensed layout
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.compactMode}
                onChange={(e) => onChange({ ...data, compactMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Preview</h3>
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: data.accentColor }}
            />
            <span className="font-medium">Sample Text</span>
          </div>
          <p className={`text-muted-foreground ${
            data.fontSize === 'small' ? 'text-xs' : 
            data.fontSize === 'large' ? 'text-base' : 'text-sm'
          }`}>
            This is how your text will appear with the current settings.
          </p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded text-white text-sm font-medium transition-colors"
              style={{ backgroundColor: data.accentColor }}
            >
              Sample Button
            </button>
            <button className="px-3 py-1.5 rounded border border-border text-sm font-medium hover:bg-accent transition-colors">
              Secondary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
