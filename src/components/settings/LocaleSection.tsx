"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { Globe, Clock, Hash } from 'lucide-react';

interface LocaleData {
  language: string;
  timezone: string;
  numberFormat: string;
}

interface LocaleSectionProps {
  data: LocaleData;
  onChange: (data: LocaleData) => void;
}

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'zh', name: 'Chinese', native: '中文' },
];

const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'Mumbai (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
];

const numberFormats = [
  { value: 'en-US', label: 'US English (1,234.56)', example: '1,234.56' },
  { value: 'en-GB', label: 'British English (1,234.56)', example: '1,234.56' },
  { value: 'de-DE', label: 'German (1.234,56)', example: '1.234,56' },
  { value: 'fr-FR', label: 'French (1 234,56)', example: '1 234,56' },
  { value: 'ja-JP', label: 'Japanese (1,234.56)', example: '1,234.56' },
  { value: 'zh-CN', label: 'Chinese (1,234.56)', example: '1,234.56' },
];

export function LocaleSection({ data, onChange }: LocaleSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Language & Region</h2>
      </div>

      {/* Language Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Language</h3>
        <div className="space-y-3">
          <Select value={data.language} onValueChange={(value) => onChange({ ...data, language: value })}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center justify-between w-full">
                    <span>{lang.native}</span>
                    <span className="text-sm text-muted-foreground">{lang.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Choose your preferred language for the interface
          </p>
        </div>
      </div>

      {/* Timezone Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Timezone</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <Select value={data.timezone} onValueChange={(value) => onChange({ ...data, timezone: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Set your local timezone for accurate time displays
          </p>
          
          {/* Current Time Display */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current time in your timezone:</span>
              <span className="font-mono">
                {new Date().toLocaleTimeString('en-US', { 
                  timeZone: data.timezone,
                  hour12: true,
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Number Format */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Number Format</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <Select value={data.numberFormat} onValueChange={(value) => onChange({ ...data, numberFormat: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select number format" />
                </SelectTrigger>
                <SelectContent>
                  {numberFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{format.label}</span>
                        <span className="text-sm text-muted-foreground font-mono">{format.example}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose how numbers are displayed (decimals, thousands separators)
          </p>
        </div>
      </div>

      {/* Date Format Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Format Preview</h3>
        <div className="p-4 border rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Date & Time</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current date:</span>
                  <span>{new Date().toLocaleDateString(data.language, { timeZone: data.timezone })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current time:</span>
                  <span>{new Date().toLocaleTimeString(data.language, { timeZone: data.timezone })}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Numbers</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span>{new Intl.NumberFormat(data.numberFormat, { 
                    style: 'currency', 
                    currency: 'USD' 
                  }).format(1234.56)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Decimal:</span>
                  <span>{new Intl.NumberFormat(data.numberFormat).format(1234.56)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Settings Note */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
              Regional Settings Note
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              These settings affect how dates, times, and numbers are displayed throughout the application. 
              Some changes may require a page refresh to take effect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
