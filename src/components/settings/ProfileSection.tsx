"use client";

import React, { useState } from 'react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/atoms/dialog';
import { User, Camera, Lock, Shield, Upload, X } from 'lucide-react';

interface ProfileData {
  avatar: string;
  displayName: string;
  username: string;
  email: string;
}

interface ProfileSectionProps {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
}

export function ProfileSection({ data, onChange }: ProfileSectionProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // In a real app, you'd upload this to your server
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange({ ...data, avatar: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    onChange({ ...data, avatar: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Profile & Account</h2>
      </div>

      {/* Avatar Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Profile Picture</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
              {data.avatar ? (
                <img 
                  src={data.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            {data.avatar && (
              <button
                onClick={removeAvatar}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </span>
                </Button>
              </label>
              <Button variant="outline" onClick={() => setShowTwoFactorDialog(true)}>
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input
              value={data.displayName}
              onChange={(e) => onChange({ ...data, displayName: e.target.value })}
              placeholder="Enter your display name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              value={data.username}
              onChange={(e) => onChange({ ...data, username: e.target.value })}
              placeholder="Enter your username"
            />
            <p className="text-xs text-muted-foreground">
              This is your unique identifier and cannot be changed later.
            </p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => onChange({ ...data, email: e.target.value })}
              placeholder="Enter your email address"
            />
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input type="password" placeholder="Enter current password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input type="password" placeholder="Confirm new password" />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                    Cancel
                  </Button>
                  <Button>Update Password</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Two-Factor Authentication
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Two-Factor Authentication</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowTwoFactorDialog(false)}>
                    Cancel
                  </Button>
                  <Button>Setup 2FA</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
