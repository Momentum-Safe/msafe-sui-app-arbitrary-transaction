import { Button, PageHeader, TextField, shortAddress } from '@msafe/msafe-ui';
import { CheckCircle } from '@mui/icons-material';
import { Box, Container, Stack, Typography } from '@mui/material';
import { useCurrentAccount, useDAppKit, useWalletConnection, useWallets } from '@mysten/dapp-kit-react';
import { Transaction } from '@mysten/sui/transactions';
import { fromHex, normalizeSuiAddress } from '@mysten/sui/utils';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { CopyBlock } from 'react-code-blocks';

const code = `import { Transaction } from '@mysten/sui/transactions';

const tx = new Transaction();
// Must match the connected MSafe multisig address
tx.setSender('0xYOUR_MSAFE_ADDRESS');
// Real commands — empty new Transaction() is rejected
tx.transferObjects([tx.gas], '0xRECIPIENT');

// Preferred: Mysten V2 JSON (do not use deprecated serialize())
const txJson = await tx.toJSON();
// Paste txJson into the input field`;

function isHex(str: string): boolean {
  return /^[0-9a-fA-F]+$/.test(str);
}

function parseTransaction(raw: string): Transaction {
  const content = raw.trim();
  if (!content) {
    throw new Error('Transaction is empty');
  }

  if (content.startsWith('{')) {
    return Transaction.from(content);
  }

  if (isHex(content)) {
    return Transaction.from(fromHex(content));
  }

  return Transaction.from(content);
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
          subtitle="Propose a fully assembled Transaction. MSafe simulates, then owners vote and execute."
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
          label="Transaction"
          placeholder="Paste Transaction toJSON() (preferred), HEX, or BASE-64."
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
                if (!account) {
                  throw new Error('No account information');
                }

                const transaction = parseTransaction(txContent);
                const data = transaction.getData();

                if (!data.commands.length) {
                  throw new Error(
                    'Empty transaction. Unregistered apps must pass a fully assembled Transaction (commands.length > 0). Do not send new Transaction().',
                  );
                }

                const sender = data.sender;
                if (!sender || normalizeSuiAddress(sender) !== normalizeSuiAddress(account.address)) {
                  throw new Error('Transaction sender is not same as the multisig address');
                }

                setProposing(true);

                // Propose only — no on-chain digest. Owners vote and execute in MSafe.
                await dAppKit.signAndExecuteTransaction({
                  transaction,
                  account,
                  network: 'mainnet',
                });

                enqueueSnackbar('Transaction proposed. Owners vote and execute in MSafe.', {
                  variant: 'success',
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
