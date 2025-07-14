#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const mode = process.argv[2];

if (!mode || !['katana', 'cartridge'].includes(mode)) {
  console.log('Usage: node scripts/switch-wallet-mode.js [katana|cartridge]');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/switch-wallet-mode.js katana     # Switch to Katana mode');
  console.log('  node scripts/switch-wallet-mode.js cartridge  # Switch to Cartridge mode');
  process.exit(1);
}

const useKatana = mode === 'katana';
const envContent = `NEXT_PUBLIC_USE_KATANA=${useKatana}
NEXT_PUBLIC_DEBUG=true
`;

try {
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Switched to ${mode.toUpperCase()} mode`);
  console.log(`📝 Updated .env.local: NEXT_PUBLIC_USE_KATANA=${useKatana}`);
  console.log('');
  console.log('🔄 Please restart your development server:');
  console.log('   npm run dev');
  console.log('');
  if (mode === 'cartridge') {
    console.log('🧪 Test Cartridge Controller at:');
    console.log('   http://localhost:3000/test-cartridge');
  }
} catch (error) {
  console.error('❌ Failed to update .env.local:', error.message);
  process.exit(1);
} 