// Mock @dojoengine/create-burner and related types
jest.mock('@dojoengine/create-burner', () => ({
  createBurner: jest.fn(() => ({
    account: {
      address: '0x123',
      publicKey: '0x456',
      privateKey: '0x789',
      sign: jest.fn()
    },
    create: jest.fn(),
  }))
}));

// Mock dojo setup
jest.mock('@/lib/dojo/setup', () => ({
  setupNetwork: jest.fn(),
  setupWorld: jest.fn(() => ({
    config: {},
    components: {},
  })),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
    pathname: '/',
    asPath: '/',
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock @dojoengine/core
jest.mock('@dojoengine/core', () => ({
  DojoProvider: {
    setup: jest.fn(),
    config: {
      rpcUrl: 'mock-rpc-url',
      toriiUrl: 'mock-torii-url',
      masterAddress: 'mock-master-address',
      masterPrivateKey: 'mock-private-key',
      accountClassHash: 'mock-class-hash',
    }
  },
  setupDojoConfig: jest.fn(() => ({
    rpcUrl: 'mock-rpc-url',
    toriiUrl: 'mock-torii-url',
    masterAddress: 'mock-master-address',
    masterPrivateKey: 'mock-private-key',
    accountClassHash: 'mock-class-hash',
  }))
}));

// Add required JSDOM setup for Next.js
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Add any other global mocks here