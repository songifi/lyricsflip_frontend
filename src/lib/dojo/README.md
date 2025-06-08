# Wallet Integration Guide: Katana + Cartridge Controller

This project supports both **Katana prefunded accounts** (for development) and **Cartridge Controller** (for production) through a unified interface.

## Quick Start

### Development Mode (Katana)
```bash
# Default behavior - uses Katana prefunded accounts
npm run dev
```

### Production Mode (Cartridge Controller)
```bash
# Set environment variable to use Cartridge Controller
NEXT_PUBLIC_USE_KATANA=false npm run dev
```

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Wallet Configuration
NEXT_PUBLIC_USE_KATANA=true          # true = Katana, false = Cartridge
NEXT_PUBLIC_RPC_URL=http://localhost:5050
NEXT_PUBLIC_TORII_URL=http://localhost:8080
NEXT_PUBLIC_DEBUG=true
```

### Automatic Mode Detection

The system automatically chooses the wallet mode based on:

1. `NEXT_PUBLIC_USE_KATANA` environment variable
2. `NODE_ENV` (development = Katana by default)

## Usage in Components

```typescript
import { useAccount, useConnect } from "@starknet-react/core";
import { useSystemCalls } from "@/lib/dojo/useSystemCalls";

export function GameComponent() {
  const { account } = useAccount();
  const { createRound } = useSystemCalls();
  
  // Works with both Katana and Cartridge accounts!
  const handleCreateRound = async () => {
    if (!account) return;
    
    try {
      const roundId = await createRound({ 
        variant: { Rock: {} } 
      });
      console.log('Round created:', roundId);
    } catch (error) {
      console.error('Failed to create round:', error);
    }
  };

  return (
    <button onClick={handleCreateRound}>
      Create Round
    </button>
  );
}
```

## Advantages of Each Mode

### Katana Prefunded Accounts ✅

**Perfect for Development:**
- ✅ **Fast iteration**: No wallet setup required
- ✅ **Deterministic**: Same accounts every restart
- ✅ **No gas costs**: Free transactions
- ✅ **Team collaboration**: Shared test accounts
- ✅ **Easy debugging**: Known account states

**Limitations:**
- ❌ **Development only**: Never use in production
- ❌ **Limited to Katana**: Won't work on testnet/mainnet
- ❌ **No real UX**: Doesn't test actual wallet flows

### Cartridge Controller ✅

**Perfect for Production:**
- ✅ **Real user experience**: Actual wallet interactions
- ✅ **Passkey authentication**: Modern, secure login
- ✅ **Session keys**: Seamless gaming experience
- ✅ **Cross-platform**: Works on testnet/mainnet
- ✅ **Gaming optimized**: Built for Web3 games

**Considerations:**
- ⚠️ **Setup required**: Users need to create accounts
- ⚠️ **Gas costs**: Real transactions cost fees
- ⚠️ **Network dependent**: Requires proper network setup

## Implementation Details

### Provider Architecture

```
DojoSdkProvider
  └── StarknetProvider (chooses connectors)
      ├── Katana Connectors (development)
      └── Cartridge Connector (production)
          └── DojoProvider
              └── Your App
```

### Connector Selection Logic

```typescript
// Automatic selection based on environment
const connectors = walletConfig.useKatanaAccounts 
  ? katanaConnectors          // Predeployed accounts
  : [cartridgeConnector];     // Cartridge Controller
```

### Policy Configuration

Cartridge Controller uses policies to define what actions your game can perform:

```typescript
const policies = {
  contracts: {
    [worldAddress]: {
      methods: [
        {
          name: "create_round",
          entrypoint: "create_round",
          description: "Create a new game round",
        },
        // ... more methods
      ],
    },
  },
};
```

## Development Workflow

### 1. Start with Katana (Recommended)

```bash
# Terminal 1: Start Katana
katana --dev

# Terminal 2: Start your app
npm run dev
```

- Develop and test your game logic
- Iterate quickly without wallet friction
- Debug contract interactions easily

### 2. Test with Cartridge Controller

```bash
# Switch to Cartridge mode
NEXT_PUBLIC_USE_KATANA=false npm run dev
```

- Test real wallet flows
- Verify user experience
- Test on testnet/mainnet

### 3. Deploy to Production

```bash
# Production build with Cartridge
NEXT_PUBLIC_USE_KATANA=false npm run build
```

## Troubleshooting

### Common Issues

1. **"No connectors available"**
   - Check `NEXT_PUBLIC_USE_KATANA` environment variable
   - Ensure Katana is running for development mode

2. **"Failed to connect to Cartridge"**
   - Verify network configuration
   - Check if you're on the correct chain (sepolia/mainnet)

3. **"Transaction failed"**
   - For Katana: Check if contracts are deployed
   - For Cartridge: Verify account has sufficient balance

### Debug Mode

Enable debug mode to see connection details:

```env
NEXT_PUBLIC_DEBUG=true
```

This will show:
- Current wallet mode (Katana/Cartridge)
- RPC URL being used
- Connection status

## Best Practices

1. **Always develop with Katana first**
   - Faster iteration cycles
   - No gas costs during development
   - Easier debugging

2. **Test with Cartridge before deployment**
   - Verify real user flows
   - Test on actual networks
   - Validate gas estimations

3. **Use environment-specific configurations**
   - Different RPC URLs for different environments
   - Separate policies for development vs production

4. **Handle both modes gracefully**
   - Your components should work with both wallet types
   - Don't assume specific wallet features
   - Always check account availability

## Migration Path

When you're ready to move from development to production:

1. ✅ Develop and test with Katana
2. ✅ Configure Cartridge policies
3. ✅ Test with Cartridge on testnet
4. ✅ Deploy to mainnet with Cartridge
5. ✅ Keep Katana for ongoing development

This dual-connector approach gives you the best of both worlds: rapid development with Katana and production-ready user experience with Cartridge Controller. 