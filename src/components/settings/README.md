# Settings Components

This directory contains all the components for the comprehensive Settings page of the LyricsFlip application.

## Components Overview

### Main Settings Page
- **`page.tsx`** - Main settings page with tab navigation and state management

### Section Components
- **`ProfileSection.tsx`** - Profile & Account management (avatar, display name, username, email, password, 2FA)
- **`NotificationsSection.tsx`** - Notification preferences (channels, categories, quiet hours)
- **`PrivacySection.tsx`** - Privacy & Security settings (visibility, blocked users, session management)
- **`GameSection.tsx`** - Game preferences (mode, difficulty, audio, haptics, wager defaults)
- **`WalletSection.tsx`** - Wallet & Payments (connection status, address, security)
- **`AppearanceSection.tsx`** - Appearance customization (theme, accent color, font size, compact mode)
- **`LocaleSection.tsx`** - Language & Region settings (language, timezone, number format)
- **`AccessibilitySection.tsx`** - Accessibility features (reduced motion, high contrast, captions)
- **`DataManagementSection.tsx`** - Data & Storage management (export, cache, account deletion)
- **`AboutSection.tsx`** - About & Support information (version, docs, support, legal)

### Utility Components
- **`toast.tsx`** - Toast notification system for user feedback

## Features

### ✅ Implemented
- **Responsive Design** - Mobile-first approach with responsive breakpoints
- **Tab Navigation** - Left sidebar navigation for easy section switching
- **Form Controls** - Consistent input fields, selects, toggles, and buttons
- **State Management** - Centralized settings state with change detection
- **Validation** - Form validation and error handling
- **Toast Notifications** - Success/error feedback for user actions
- **Dark/Light Theme Support** - Built-in theme switching capability
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support
- **Mobile Optimization** - Touch-friendly controls and responsive layouts

### 🔧 Key Features
- **Change Detection** - Automatically detects unsaved changes
- **Sticky Footer** - Save/Cancel actions always visible when changes exist
- **Reset Options** - Reset to last saved or default values
- **Copy to Clipboard** - Easy copying of wallet addresses and other data
- **File Upload** - Avatar image upload with preview
- **Real-time Preview** - See appearance changes immediately
- **Session Management** - View and manage active sessions
- **Data Export** - Export user data in multiple formats
- **Cache Management** - Monitor and clear application cache

## Usage

### Basic Implementation
```tsx
import { SettingsPage } from '@/app/settings/page';

export default function App() {
  return <SettingsPage />;
}
```

### Custom Settings Data
```tsx
// The settings page uses a comprehensive interface
interface SettingsData {
  profile: ProfileData;
  notifications: NotificationsData;
  privacy: PrivacyData;
  game: GameData;
  wallet: WalletData;
  appearance: AppearanceData;
  locale: LocaleData;
  accessibility: AccessibilityData;
}
```

### Adding New Sections
1. Create a new section component following the existing pattern
2. Add it to the `index.ts` export file
3. Import it in the main settings page
4. Add it to the tabs array
5. Add the section content in the main content area

## Styling

The components use:
- **Tailwind CSS** for responsive design
- **CSS Variables** for theme customization
- **Consistent Spacing** using the design system
- **Icon Integration** with Lucide React icons
- **Color Schemes** that adapt to light/dark themes

## Accessibility

- **Keyboard Navigation** - Full keyboard support
- **Screen Reader** - ARIA labels and semantic HTML
- **High Contrast** - Built-in high contrast mode
- **Reduced Motion** - Respects user motion preferences
- **Focus Management** - Proper focus indicators and management

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## Performance

- **Lazy Loading** - Components load only when needed
- **Optimized Renders** - Efficient state updates
- **Debounced Inputs** - Prevents excessive API calls
- **Memory Management** - Proper cleanup of event listeners

## Future Enhancements

- **Real-time Sync** - Sync settings across devices
- **Import/Export** - Settings backup and restore
- **Advanced Validation** - Server-side validation
- **Analytics** - Track settings usage patterns
- **A/B Testing** - Test different default settings
