"use client";

import React from 'react';
import { Eye, Move, Subtitles, Volume2, Contrast, Accessibility } from 'lucide-react';

interface AccessibilityData {
  reducedMotion: boolean;
  highContrast: boolean;
  captions: boolean;
}

interface AccessibilitySectionProps {
  data: AccessibilityData;
  onChange: (data: AccessibilityData) => void;
}

export function AccessibilitySection({ data, onChange }: AccessibilitySectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Accessibility className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Accessibility</h2>
      </div>

      {/* Motion & Animation */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Motion & Animation</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Move className="h-5 w-5 text-blue-500" />
              <div>
                <h4 className="font-medium">Reduced Motion</h4>
                <p className="text-sm text-muted-foreground">
                  Minimize animations and transitions for users sensitive to motion
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.reducedMotion}
                onChange={(e) => onChange({ ...data, reducedMotion: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Visual Accessibility */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Visual Accessibility</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Contrast className="h-5 w-5 text-purple-500" />
              <div>
                <h4 className="font-medium">High Contrast Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Increase contrast for better readability and visibility
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.highContrast}
                onChange={(e) => onChange({ ...data, highContrast: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Audio Accessibility */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Audio Accessibility</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Subtitles className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="font-medium">Captions & Subtitles</h4>
                <p className="text-sm text-muted-foreground">
                  Enable captions for audio content and game sounds
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.captions}
                onChange={(e) => onChange({ ...data, captions: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Keyboard Navigation */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Keyboard Navigation</h3>
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <Accessibility className="h-5 w-5 text-orange-500" />
            <div>
              <h4 className="font-medium">Keyboard Shortcuts</h4>
              <p className="text-sm text-muted-foreground">
                Navigate the interface using keyboard shortcuts
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Navigation</h5>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Tab:</span>
                  <span>Navigate between elements</span>
                </div>
                <div className="flex justify-between">
                  <span>Enter/Space:</span>
                  <span>Activate buttons/links</span>
                </div>
                <div className="flex justify-between">
                  <span>Arrow keys:</span>
                  <span>Navigate menus</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Game Controls</h5>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>WASD:</span>
                  <span>Move/select</span>
                </div>
                <div className="flex justify-between">
                  <span>Space:</span>
                  <span>Confirm action</span>
                </div>
                <div className="flex justify-between">
                  <span>Escape:</span>
                  <span>Cancel/back</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Reader Support */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Screen Reader Support</h3>
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-indigo-500" />
            <div>
              <h4 className="font-medium">Screen Reader Optimized</h4>
              <p className="text-sm text-muted-foreground">
                This application is designed to work with screen readers and assistive technologies
              </p>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2">Features</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Semantic HTML structure</li>
                  <li>• ARIA labels and descriptions</li>
                  <li>• Keyboard navigation support</li>
                  <li>• High contrast mode</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Tips</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Use Tab to navigate</li>
                  <li>• Listen for announcements</li>
                  <li>• Enable high contrast if needed</li>
                  <li>• Use keyboard shortcuts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Help */}
      <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Accessibility className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-green-800 dark:text-green-200 mb-1">
              Need Help with Accessibility?
            </p>
            <p className="text-green-700 dark:text-green-300">
              If you need assistance with accessibility features or have suggestions for improvements, 
              please contact our support team. We're committed to making our application accessible to everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
