"use client";

import React from 'react';
import { Button } from '@/components/atoms/button';
import { Info, FileText, HelpCircle, MessageSquare, ExternalLink, Github, Globe } from 'lucide-react';

interface AboutSectionProps {
  appVersion?: string;
  onContactSupport?: () => void;
}

export function AboutSection({ appVersion = "1.0.0", onContactSupport }: AboutSectionProps) {
  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Info className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">About & Support</h2>
      </div>

      {/* App Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Application Information</h3>
        <div className="p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">App Version</label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg">{appVersion}</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-xs rounded-full">
                  Latest
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Build Date</label>
              <div className="font-mono text-lg">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => openExternalLink('/changelog')}
              className="w-full md:w-auto"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Changelog
            </Button>
          </div>
        </div>
      </div>

      {/* Documentation & Resources */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Documentation & Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium">User Guide</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Learn how to play the game and use all features
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openExternalLink('/docs/user-guide')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Read Guide
            </Button>
          </div>
          
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-green-500" />
              <h4 className="font-medium">FAQ</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Find answers to frequently asked questions
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openExternalLink('/faq')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Browse FAQ
            </Button>
          </div>
          
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-gray-500" />
              <h4 className="font-medium">API Documentation</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Technical documentation for developers
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openExternalLink('/docs/api')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View API Docs
            </Button>
          </div>
          
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-purple-500" />
              <h4 className="font-medium">Community</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Join our community forums and discussions
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openExternalLink('/community')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Join Community
            </Button>
          </div>
        </div>
      </div>

      {/* Support Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Get Help & Support</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium">Contact Support</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Get help from our support team
            </p>
            <Button 
              onClick={onContactSupport}
              className="w-full"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
          
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-green-500" />
              <h4 className="font-medium">Report Bug</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Report issues or bugs you encounter
            </p>
            <Button 
              variant="outline"
              onClick={() => openExternalLink('/report-bug')}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Report Bug
            </Button>
          </div>
        </div>
      </div>

      {/* Legal & Privacy */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Legal & Privacy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="ghost" 
            onClick={() => openExternalLink('/privacy')}
            className="justify-start h-auto p-3"
          >
            <div className="text-left">
              <div className="font-medium">Privacy Policy</div>
              <div className="text-sm text-muted-foreground">How we handle your data</div>
            </div>
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => openExternalLink('/terms')}
            className="justify-start h-auto p-3"
          >
            <div className="text-left">
              <div className="font-medium">Terms of Service</div>
              <div className="text-sm text-muted-foreground">Usage terms and conditions</div>
            </div>
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => openExternalLink('/cookies')}
            className="justify-start h-auto p-3"
          >
            <div className="text-left">
              <div className="font-medium">Cookie Policy</div>
              <div className="text-sm text-muted-foreground">How we use cookies</div>
            </div>
          </Button>
        </div>
      </div>

      {/* System Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">System Information</h3>
        <div className="p-4 border rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Browser:</span>
                <span>{navigator.userAgent.split(' ').pop()?.split('/')[0] || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform:</span>
                <span>{navigator.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language:</span>
                <span>{navigator.language}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Screen Resolution:</span>
                <span>{screen.width} × {screen.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Color Depth:</span>
                <span>{screen.colorDepth} bit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Online Status:</span>
                <span className={navigator.onLine ? 'text-green-600' : 'text-red-600'}>
                  {navigator.onLine ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
