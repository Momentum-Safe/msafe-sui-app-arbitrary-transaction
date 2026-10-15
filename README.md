# msafe-sui-arbitrary-transaction

## 项目介绍

这是 MSafe Sui 商店里的「Plain Transaction」前端，线上地址是 https://sui-ptx.m-safe.io/ 。用户粘贴一笔已经组好的 Sui `Transaction`（JSON、HEX 或 BASE-64），应用把它交给 MSafe 多签去模拟、投票和执行。商店卡片 id 是 `plaintx`，钱包注册名是 `msafe-plain-tx`。

它给要按普通 Sui 钱包接入 MSafe 的 dApp 当参考实现，包括 Momentum 生态里需要提交自定义 PTB 的页面。本应用直接使用 `@msafe/sui-wallet`，交易在 dApp 里组完再提交。

技术栈是 TypeScript、Vite、React 18、MUI，以及 `@mysten/dapp-kit-react`。入口是 `src/main.tsx`，钱包注册在 `src/dapp-kit.ts`，粘贴和校验在 `src/App.tsx`。`package.json` 的包名是 `msafe-sui-app-arbitrary-transaction`（私有包，不发布）。

This app submits a fully assembled `Transaction` through `@msafe/sui-wallet`.

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

The host store card id is `plaintx` (`msafe-sui-web-v3`). The wallet application name registered here is `msafe-plain-tx`. Those two strings are different: the card id selects the iframe URL, and the wallet name is what MSafe records on the proposal.

Host iframe integration only needs the Wallet Standard wallet. `@mysten/dapp-kit-react` in this repo is the dApp-side toolkit. It is not a requirement for the MSafe host page.

If you fork this as a new app, send MSafe a new card: app name, icon, production URL.
