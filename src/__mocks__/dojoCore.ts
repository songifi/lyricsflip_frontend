export const DojoProvider = {
  setup: jest.fn(),
  config: {
    rpcUrl: 'mock-rpc-url',
    toriiUrl: 'mock-torii-url',
    masterAddress: 'mock-master-address',
    masterPrivateKey: 'mock-private-key',
    accountClassHash: 'mock-class-hash',
  }
};

export const setupDojoConfig = jest.fn(() => ({
  rpcUrl: 'mock-rpc-url',
  toriiUrl: 'mock-torii-url',
  masterAddress: 'mock-master-address',
  masterPrivateKey: 'mock-private-key',
  accountClassHash: 'mock-class-hash',
}));