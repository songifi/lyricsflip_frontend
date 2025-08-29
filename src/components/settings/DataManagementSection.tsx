"use client";

import React, { useState } from 'react';
import { Button } from '@/components/atoms/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/atoms/dialog';
import { Database, Download, Trash2, AlertTriangle, HardDrive, FileText, UserX } from 'lucide-react';

interface DataManagementSectionProps {
  onExportData?: () => void;
  onClearCache?: () => void;
  onDeleteAccount?: () => void;
}

export function DataManagementSection({ onExportData, onClearCache, onDeleteAccount }: DataManagementSectionProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      onExportData?.();
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      // Simulate cache clearing
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClearCache?.();
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Data & Storage</h2>
      </div>

      {/* Data Export */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Data Export</h3>
        <div className="p-4 border rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <h4 className="font-medium">Export Your Data</h4>
              <p className="text-sm text-muted-foreground">
                Download a copy of your account data, game history, and preferences
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <select className="w-full px-3 py-2 border rounded-md bg-background">
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF Report</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Range</label>
              <select className="w-full px-3 py-2 border rounded-md bg-background">
                <option value="all">All Time</option>
                <option value="last30">Last 30 Days</option>
                <option value="last90">Last 90 Days</option>
                <option value="lastYear">Last Year</option>
              </select>
            </div>
          </div>
          
          <Button 
            onClick={handleExportData} 
            disabled={isExporting}
            className="w-full md:w-auto"
          >
            {isExporting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </div>

      {/* Cache Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Cache & Storage</h3>
        <div className="p-4 border rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <HardDrive className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <h4 className="font-medium">Storage Information</h4>
              <p className="text-sm text-muted-foreground">
                Manage your local storage and cache
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">2.4 GB</div>
              <div className="text-sm text-muted-foreground">Total Used</div>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">1.8 GB</div>
              <div className="text-sm text-muted-foreground">Cache</div>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">600 MB</div>
              <div className="text-sm text-muted-foreground">User Data</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h5 className="font-medium text-yellow-800 dark:text-yellow-200">Cache Warning</h5>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Large cache may slow down the application
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearCache}
              disabled={isClearing}
            >
              {isClearing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              {isClearing ? 'Clearing...' : 'Clear Cache'}
            </Button>
          </div>
        </div>
      </div>

      {/* Account Deletion */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Account Management</h3>
        <div className="p-4 border rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <UserX className="h-5 w-5 text-red-500" />
            <div className="flex-1">
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-200 mb-1">
                  ⚠️ This action cannot be undone
                </p>
                <p className="text-red-700 dark:text-red-300">
                  Deleting your account will permanently remove all your data, game progress, 
                  achievements, and account information. This action cannot be reversed.
                </p>
              </div>
            </div>
          </div>
          
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full md:w-auto">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-600">Delete Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Are you absolutely sure you want to delete your account? This action cannot be undone.
                </p>
                
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">What will be deleted:</h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• All game progress and achievements</li>
                    <li>• Profile information and settings</li>
                    <li>• Game history and statistics</li>
                    <li>• Connected wallet information</li>
                    <li>• All personal data</li>
                  </ul>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      onDeleteAccount?.();
                      setShowDeleteDialog(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Permanently Delete Account
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
