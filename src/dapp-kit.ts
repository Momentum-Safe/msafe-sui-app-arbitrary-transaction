import { MSafeWallet } from '@msafe/sui-wallet';
import { createDAppKit } from '@mysten/dapp-kit-react';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';
import { getWallets } from '@mysten/wallet-standard';

const GRPC_URLS = {
  mainnet: 'https://fullnode.mainnet.sui.io:443',
} as const;

export const dAppKit = createDAppKit({
  networks: ['mainnet'],
  defaultNetwork: 'mainnet',
  createClient(network) {
    return new SuiGrpcClient({ network, baseUrl: GRPC_URLS[network] });
  },
  walletInitializers: [
    {
      id: 'MSafe Wallet',
      initialize() {
        const wallets = [
          new MSafeWallet('msafe-plain-tx', getJsonRpcFullnodeUrl('mainnet'), 'sui:mainnet'),
        ];
        const walletsApi = getWallets();
        return { unregister: walletsApi.register(...wallets) };
      },
    },
  ],
});

declare module '@mysten/dapp-kit-react' {
  interface Register {
    dAppKit: typeof dAppKit;
  }
}
