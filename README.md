# msafe-sui-arbitrary-transaction

Sample dApp for the current MSafe store integration: treat MSafe as a normal Sui wallet and submit a fully assembled `Transaction`.

Live: https://sui-ptx.m-safe.io/

This app does **not** use `@msafe/sui-app-store`, helpers, or `appContext`.

## Integration

Register the wallet once at startup (`src/dapp-kit.ts`):

```ts
new MSafeWallet('msafe-plain-tx', getJsonRpcFullnodeUrl('mainnet'), 'sui:mainnet');
```

Submit a real PTB (`src/App.tsx`):

```ts
await dAppKit.signAndExecuteTransaction({ transaction: tx });
```

Rules:

- `tx.getData().commands.length > 0`
- `tx.setSender` is the connected MSafe **multisig** address
- No `appContext`
- Prefer Mysten V2 `Transaction` / `toJSON()` (this UI also accepts HEX / BASE-64 BCS)
- `signAndExecuteTransaction` **proposes**. It does not return an on-chain digest. Owners vote and execute in MSafe.

## Store card

Already listed as `msafe-plain-tx`. If you fork this as a new app, send MSafe a new card: app name, icon, production URL.
