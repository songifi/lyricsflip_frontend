# Dojo Integration Guide for LyricsFlip

## What is Dojo?
Dojo is a full-stack framework for building on-chain games and applications on Starknet. It provides a comprehensive set of tools for smart contract development, testing, and frontend integration.

## Key Components

### 1. Smart Contract Development
- Uses Cairo programming language
- Provides a component-based architecture
- Includes built-in testing framework
- Supports world state management

### 2. Frontend Integration
The Dojo.js SDK provides tools for interacting with Dojo contracts from the frontend:

```typescript
import { createClient } from "@dojoengine/torii-client";
import { Account, RpcProvider } from "starknet";
```

## Project Setup

### 1. Initialize Project
```bash
# Create a new Vite + React + TypeScript project
npm create vite@latest lyricsflip -- --template react-ts

# Install Dojo dependencies
npm install @dojoengine/torii-client @dojoengine/create-burner starknet
```

### 2. Environment Configuration
Create a `.env` file:
```env
VITE_PUBLIC_TORII=https://api.cartridge.gg/torii
VITE_PUBLIC_MASTER_ADDRESS=0x...
VITE_PUBLIC_MASTER_PRIVATE_KEY=0x...
VITE_PUBLIC_ACCOUNT_CLASS_HASH=0x...
```

### 3. Client Configuration
Create a `dojoConfig.ts`:
```typescript
import { Account, RpcProvider } from "starknet";
import { createClient } from "@dojoengine/torii-client";

export const createDojoConfig = async () => {
  const provider = new RpcProvider({ nodeUrl: import.meta.env.VITE_PUBLIC_RPC_URL });
  
  const account = new Account(
    provider,
    import.meta.env.VITE_PUBLIC_MASTER_ADDRESS,
    import.meta.env.VITE_PUBLIC_MASTER_PRIVATE_KEY
  );

  return {
    client: await createClient({
      rpcUrl: import.meta.env.VITE_PUBLIC_RPC_URL,
      toriiUrl: import.meta.env.VITE_PUBLIC_TORII,
      account,
    }),
    account,
  };
};
```

## Integration Steps

### 1. Setup
1. Install required dependencies:
```bash
npm install @dojoengine/torii-client starknet
```

2. Configure your environment:
```typescript
const provider = new RpcProvider({ nodeUrl: "YOUR_RPC_URL" });
const account = new Account(provider, "YOUR_ACCOUNT_ADDRESS", "YOUR_PRIVATE_KEY");
```

### 2. Client Setup
```typescript
const client = await createClient({
  rpcUrl: "YOUR_RPC_URL",
  toriiUrl: "YOUR_TORII_URL",
  account: account,
});
```

### 3. Interacting with Contracts

#### Reading State
```typescript
// Get component data
const data = await client.getComponentValue("ComponentName", entityId);
```

#### Writing State
```typescript
// Execute a system call
const tx = await client.execute("SystemName", {
  param1: value1,
  param2: value2,
});
```

### 4. Event Handling
```typescript
// Subscribe to events
client.on("ComponentName", (event) => {
  console.log("Component updated:", event);
});
```

## React Integration

### 1. Provider Setup
```typescript
// DojoProvider.tsx
import { createContext, useContext, ReactNode } from 'react';
import { createDojoConfig } from './dojoConfig';

export const DojoContext = createContext<ReturnType<typeof createDojoConfig> | null>(null);

export const DojoProvider = ({ children }: { children: ReactNode }) => {
  const config = await createDojoConfig();
  
  return (
    <DojoContext.Provider value={config}>
      {children}
    </DojoContext.Provider>
  );
};
```

### 2. Custom Hooks
```typescript
// hooks/useDojo.ts
import { useContext } from 'react';
import { DojoContext } from '../DojoProvider';

export const useDojo = () => {
  const context = useContext(DojoContext);
  if (!context) throw new Error('Must be used within a DojoProvider');
  return context;
};
```

### 3. Component Usage
```typescript
// GameComponent.tsx
import { useDojo } from '../hooks/useDojo';

export const GameComponent = () => {
  const { client, account } = useDojo();
  
  const handleAction = async () => {
    try {
      const tx = await client.execute("GameAction", {
        player: account.address,
        action: "play",
      });
      await tx.wait();
    } catch (error) {
      console.error(error);
    }
  };
  
  return <button onClick={handleAction}>Play</button>;
};
```

## Best Practices

1. **Error Handling**
   - Always wrap contract calls in try-catch blocks
   - Implement proper error messages for users
   - Handle transaction failures gracefully

2. **State Management**
   - Use React hooks for state management
   - Implement proper loading states
   - Cache frequently accessed data

3. **Performance**
   - Batch transactions when possible
   - Implement proper caching strategies
   - Use pagination for large data sets

## Common Patterns

### Game State Management
```typescript
const [gameState, setGameState] = useState(null);

useEffect(() => {
  const fetchGameState = async () => {
    const state = await client.getComponentValue("GameState", gameId);
    setGameState(state);
  };
  
  fetchGameState();
}, [gameId]);
```

### Transaction Handling
```typescript
const handleTransaction = async () => {
  try {
    const tx = await client.execute("SystemName", params);
    await tx.wait();
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## Testing

1. **Unit Tests**
   - Test contract interactions
   - Mock responses
   - Test error scenarios

2. **Integration Tests**
   - Test full flow
   - Test with real contracts
   - Test error handling

## Security Considerations

1. **Private Key Management**
   - Never expose private keys
   - Use secure storage
   - Implement proper key rotation

2. **Transaction Security**
   - Validate all inputs
   - Implement proper access controls
   - Use proper error handling

## Resources

- [Dojo Documentation](https://book.dojoengine.org/)
- [Starknet Documentation](https://docs.starknet.io/)
- [Cairo Documentation](https://www.cairo-lang.org/docs/)
- [Dojo.js Example Repository](https://github.com/dojoengine/dojo.js/tree/main/examples/example-vite-react-sdk)

## Troubleshooting

Common issues and solutions:

1. **Connection Issues**
   - Check RPC URL
   - Verify network connectivity
   - Check account configuration

2. **Transaction Failures**
   - Check gas fees
   - Verify account balance
   - Check contract permissions

3. **State Sync Issues**
   - Verify Torii URL
   - Check event subscriptions
   - Verify component names 