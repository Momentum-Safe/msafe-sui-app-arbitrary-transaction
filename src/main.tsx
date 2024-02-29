import { MavenProvider } from '@msafe/msafe-ui';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AppToast from './components/AppToast';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Root />);

function Root() {
  return (
    <React.StrictMode>
      <MavenProvider>
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
      </MavenProvider>
    </React.StrictMode>
  );
}
