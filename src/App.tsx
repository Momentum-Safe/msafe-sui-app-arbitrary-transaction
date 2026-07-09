import { Button, PageHeader, TextField, shortAddress } from '@msafe/msafe-ui';
import { CheckCircle } from '@mui/icons-material';
import { Box, Container, Stack, Typography } from '@mui/material';
import { useCurrentAccount, useDAppKit, useWalletConnection, useWallets } from '@mysten/dapp-kit-react';
import { Transaction } from '@mysten/sui/transactions';
import { fromBase64, fromHex, normalizeSuiAddress, toHex } from '@mysten/sui/utils';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { CopyBlock } from 'react-code-blocks';

const code = `import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { toHex } from '@mysten/sui/utils';

const client = new SuiGrpcClient({
  baseUrl: 'https://fullnode.mainnet.sui.io:443',
  network: 'mainnet',
});

const tx = new Transaction();
// Must match the connected MSafe multisig address
tx.setSender('0xYOUR_MSAFE_ADDRESS');
// Your build logic here

const txBytes = await tx.build({ client });
// Copy the hex below into the input field
const txHex = toHex(txBytes);`;

function isHex(str: string): boolean {
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(str);
}

export default function App() {
  const dAppKit = useDAppKit();
  const wallets = useWallets();
  const connection = useWalletConnection();
  const account = useCurrentAccount();

  const { enqueueSnackbar } = useSnackbar();

  const [txContent, setTxContent] = useState('');
  const [proposing, setProposing] = useState(false);

  const connectWallet = async () => {
    const msafeWallet = wallets.find((wallet) => wallet.name === 'MSafe Wallet');
    if (!msafeWallet) {
      return;
    }

    await dAppKit.connectWallet({ wallet: msafeWallet });
  };

  useEffect(() => {
    if (connection.isDisconnected && wallets.some((wallet) => wallet.name === 'MSafe Wallet')) {
      connectWallet().catch(() => undefined);
    }
  }, [wallets, connection.isDisconnected]);
  return (
    <Container sx={{ mt: 4 }}>
      <Stack spacing={3}>
        <PageHeader
          mainTitle="Plain Transaction"
          subtitle="Propose your plain transaction with MSafe multisig protection"
          action={
            connection.isConnected ? (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  dAppKit.disconnectWallet().catch(() => undefined);
                }}
                startIcon={<CheckCircle color="success" />}
              >
                {account ? shortAddress(account.address) : 'Disconnect'}
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  connectWallet().catch(() => undefined);
                }}
              >
                Connect
              </Button>
            )
          }
        />
        <TextField
          label="Transaction Block"
          placeholder="Please input your transaction block BASE-64 or HEX encoding content."
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
            color="primary"
            disabled={!connection.isConnected}
            loading={proposing}
            onClick={async () => {
              try {
                const transaction = isHex(txContent)
                  ? Transaction.from(fromHex(txContent))
                  : Transaction.from(txContent);

                if (!account) {
                  throw new Error('No account information');
                }

                const sender = transaction.getData().sender;
                if (!sender || normalizeSuiAddress(sender) !== normalizeSuiAddress(account.address)) {
                  throw new Error('Transaction sender is not same as the multisig address');
                }

                setProposing(true);

                // content must be hex-encoded built tx bytes for msafe-plain-tx helper
                const content = isHex(txContent) ? txContent : toHex(fromBase64(txContent));

                await dAppKit.signAndExecuteTransaction({
                  transaction,
                  account,
                  network: 'mainnet',
                  // @ts-expect-error appContext is a MSafe wallet extension
                  appContext: {
                    content,
                  },
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
        <Stack spacing={2}>
          <Typography>Example Code:</Typography>
          <Stack spacing={1} sx={{ borderRadius: 1, border: '1px solid #CCC', p: 2 }}>
            <CopyBlock text={code} language="js" />
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
