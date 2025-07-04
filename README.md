# LyricsFlip Frontend

This is a [Next.js](https://nextjs.org) project integrated with [Dojo](https://book.dojoengine.org/) for Starknet blockchain gaming.

## Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Dojo](https://book.dojoengine.org/getting-started/installation.html) (for running Katana, Sozo, and Torii)

## Getting Started

This project requires both a Starknet node (Katana) and an indexer (Torii) to be running alongside the frontend.

### 1. Clone and Set Up the Contract Repository

First, clone the contracts repository and set up the Starknet environment:

```bash
# Clone the contract repo
git clone https://github.com/songifi/lyricsflip-contract.git
cd <CONTRACT_REPO_DIRECTORY>

# Run Katana local Starknet node with development settings
katana --dev --http.api dev,starknet --dev.no-fee --http.cors_origins '*'
```

### 2. Build and Deploy Contracts

In a new terminal, from the contracts directory:

```bash
# Build the contracts with TypeScript bindings
sozo build --typescript

# Deploy the contracts to the local Katana node
sozo migrate
```

After migration, note the `WORLD_ADDRESS` from the output.

### 3. Start the Indexer

Start Torii indexer to sync blockchain data:

```bash
# Replace <WORLD_ADDRESS> with the actual world address from step 2
torii --world <WORLD_ADDRESS> --http.cors_origins "*"
```

### 4. Update Frontend with Generated Files

Copy the generated TypeScript files from the contracts build to the frontend:

```bash
# From the contracts directory, copy generated files to frontend
cp target/dev/manifest_dev.json /path/to/lyricsflip_frontend/
cp target/dev/typescript/contracts.gen.ts /path/to/lyricsflip_frontend/src/lib/dojo/typescript/
cp target/dev/typescript/models.gen.ts /path/to/lyricsflip_frontend/src/lib/dojo/typescript/
```

### 5. Start the Frontend

Finally, start the Next.js development server:

```bash
# In the frontend directory
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Configuration

The project supports both development (Katana) and production (Cartridge Controller) modes:

### Development Mode (Default)
Uses Katana prefunded accounts for easy testing:

```bash
npm run dev
```

### Production Mode  
Uses Cartridge Controller for real wallet interactions:

```bash
npm run wallet:cartridge
npm run dev
```

## Project Structure

- `src/lib/dojo/` - Dojo integration layer
- `src/components/` - React components organized by atomic design
- `src/hooks/` - Custom React hooks
- `src/services/` - API and WebSocket services
- `manifest_dev.json` - Dojo world manifest (auto-generated)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run wallet:katana` - Switch to Katana wallet mode
- `npm run wallet:cartridge` - Switch to Cartridge wallet mode

## Learn More

- [Dojo Documentation](https://book.dojoengine.org/) - Learn about Dojo framework
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Starknet Documentation](https://docs.starknet.io/) - Learn about Starknet blockchain

## Troubleshooting

### Common Issues

1. **Connection Issues**: Ensure Katana is running on `http://localhost:5050`
2. **State Sync Issues**: Verify Torii is running on `http://localhost:8080`  
3. **Contract Not Found**: Make sure you've run `sozo migrate` and updated the world address
4. **Type Errors**: Ensure generated TypeScript files are copied to `src/lib/dojo/typescript/`
