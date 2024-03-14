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
                    amount: '500000000',
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
