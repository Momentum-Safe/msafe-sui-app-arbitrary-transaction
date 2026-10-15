import { MavenProvider } from '@msafe/msafe-ui';
import { CssBaseline } from '@mui/material';
import { DAppKitProvider } from '@mysten/dapp-kit-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './App';
import AppToast from './components/AppToast';
import { dAppKit } from './dapp-kit';

const queryClient = new QueryClient();

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root is missing');
}

ReactDOM.createRoot(root).render(<Root />);

function Root() {
  return (
    <React.StrictMode>
      <MavenProvider>
        <QueryClientProvider client={queryClient}>
          <DAppKitProvider dAppKit={dAppKit}>
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
          </DAppKitProvider>
        </QueryClientProvider>
      </MavenProvider>
    </React.StrictMode>
  );
}
