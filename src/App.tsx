import { Button, PageHeader, TextField, shortAddress } from '@msafe/msafe-ui';
import { MSafeWallet } from '@msafe/sui-wallet';
import { SUI_COIN, buildCoinTransferTxb, isSameAddress } from '@msafe/sui3-utils';
import { CheckCircle } from '@mui/icons-material';
import { Box, Container, Stack } from '@mui/material';
import {
  useConnectWallet,
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
  useSuiClient,
} from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { fromHEX, toHEX } from '@mysten/sui.js/utils';
import TwitterLogin from 'react-twitter-login';

export const TWITTER_STATE = 'twitter-increaser-state';
const TWITTER_CODE_CHALLENGE = 'challenge';
const TWITTER_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TWITTER_SCOPE = ['tweet.read', 'users.read', 'offline.access'].join(' ');

export const getTwitterOAuthUrl = (redirectUri: string) =>
  getURLWithQueryParams(TWITTER_AUTH_URL, {
    response_type: 'code',
    client_id: 'el9nS09YRHZUTzlWYVVudWdHbTQ6MTpjaQ',
    redirect_uri: redirectUri,
    scope: TWITTER_SCOPE,
    state: TWITTER_STATE,

    code_challenge: TWITTER_CODE_CHALLENGE,
    code_challenge_method: 'plain',
  });

export const getURLWithQueryParams = (baseUrl: string, params: Record<string, any>) => {
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${baseUrl}?${query}`;
};

export const queryStringToObject = (queryString: string) => {
  const pairsString = queryString[0] === '?' ? queryString.slice(1) : queryString;

  const pairs = pairsString.split('&').map((str) => str.split('=').map(decodeURIComponent));

  return pairs.reduce<Record<string, any>>((acc, [key, value]) => {
    if (key) {
      acc[key] = value;
    }

    return acc;
  }, {});
};

export default function App() {
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: connect } = useConnectWallet();

  const { enqueueSnackbar } = useSnackbar();

  const suiClient = useSuiClient();
  const wallet = useCurrentWallet();
  const account = useCurrentAccount();

  const [txContent, setTxContent] = useState('');
  const [proposing, setProposing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const connectWallet = () => {
    connect({
      wallet: new MSafeWallet('msafe-plain-tx', suiClient, 'sui:testnet'),
      silent: true,
    });
  };

  useEffect(() => {
    connectWallet();
  }, []);

  const signAndExecuteTransactionBlock = useMemo(() => {
    if (!wallet.currentWallet) {
      return null;
    }
    const feature = wallet.currentWallet.features['sui:signAndExecuteTransactionBlock'];
    if (!feature) {
      return null;
    }
    return feature.signAndExecuteTransactionBlock;
  }, [wallet]);

  return (
    <Container>
      <a href={getTwitterOAuthUrl('https://aptos.m-safe.io')}>Login</a>
      <Stack spacing={3}>
        <PageHeader
          mainTitle="Plain Transaction"
          subtitle="Propose your plain transaction with MSafe multisig protection"
          action={
            wallet.isConnected ? (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => disconnect()}
                startIcon={<CheckCircle color="success" />}
              >
                {account ? shortAddress(account.address) : 'Disconnect'}
              </Button>
            ) : (
              <Button variant="outlined" color="secondary" onClick={connectWallet}>
                Connect
              </Button>
            )
          }
        />
        <TextField
          label="Transaction Block"
          placeholder="Please input your transaction block BASE-64 encoding content."
          rows={7}
          multiline
          value={txContent}
          onChange={(v) => {
            setTxContent(v.target.value);
          }}
        />
        <Stack direction="row" spacing={1}>
          <Box flexGrow={1} />
          <Button
            variant="contained"
            color="secondary"
            disabled={!wallet.isConnected}
            loading={generating}
            onClick={() => {
              if (account && account.address) {
                setGenerating(true);
                buildCoinTransferTxb(
                  suiClient,
                  {
                    amount: '10000000',
                    coinType: SUI_COIN,
                    recipient: '0x6a7da68260ca5bb32ed0dde656b3ad75c82f7b24504f487739aa76221a2d5e0b',
                  },
                  account.address,
                )
                  .then((tb) => {
                    tb.build({ client: suiClient })
                      .then((res) => {
                        setTxContent(toHEX(res));
                      })
                      .finally(() => setGenerating(false));
                  })
                  .catch(() => setGenerating(false));
              }
            }}
          >
            Generate Demo Payload
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!wallet.isConnected}
            loading={proposing}
            onClick={async () => {
              try {
                const transactionBlock = TransactionBlock.from(fromHEX(txContent));

                if (!account || !signAndExecuteTransactionBlock) {
                  throw new Error('No account information');
                }

                if (
                  !transactionBlock.blockData.sender ||
                  !isSameAddress(transactionBlock.blockData.sender, account.address)
                ) {
                  throw new Error('Transaction sender is not same as the multisig address');
                }

                setProposing(true);

                await signAndExecuteTransactionBlock({
                  transactionBlock,
                  account,
                  chain: account.chains[0],
                });
              } catch (e) {
                enqueueSnackbar(`Can't propose transaction: ${String(e)}`, { variant: 'error' });
                throw e;
              } finally {
                setProposing(false);
              }
            }}
          >
            Propose
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
