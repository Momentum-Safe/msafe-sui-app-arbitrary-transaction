import { MavenProvider } from '@msafe/msafe-ui';
import { CssBaseline } from '@mui/material';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import '@mysten/dapp-kit/dist/index.css';
import { SuiClient } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AppToast from './components/AppToast';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Root />);

function Root() {
  return (
    <React.StrictMode>
      <MavenProvider>
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider
            createClient={(name) => {
              console.log('🚀 ~ Root ~ name:', name);
              if (name === 'mainnet') {
                return new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });
              } else {
                return new SuiClient({ url: 'https://fullnode.testnet.sui.io' });
              }
            }}
          >
            <WalletProvider preferredWallets={['msafe']}>
              <BrowserRouter>
                <SnackbarProvider
                  maxSnack={4}
                  autoHideDuration={3500}
                  Components={{
                    default: AppToast,
                    error: AppToast,
                    success: AppToast,
                    warning: AppToast,
                    info: AppToast,
                  }}
                >
                  <CssBaseline />
                  <App />
                </SnackbarProvider>
              </BrowserRouter>
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </MavenProvider>
    </React.StrictMode>
  );
}
