export type Account = {
  address: string;
  publicKey: string;
  privateKey: string;
  sign: () => Promise<string>;
};

export type World = {
  config: any;
  components: any;
};