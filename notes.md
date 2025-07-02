# Solana Notes: Commitment, Token Minting, Token Accounts vs ATA

## 🔐 Commitment Levels in Solana

In Solana, `commitment` is a setting that defines how finalized or secure you want your data (like a transaction or account state) to be when fetched or confirmed.

### ✅ `"confirmed"` Means:

> "This data is on a block that has been voted on by a supermajority of validators, but not yet finalized."

It's faster than `"finalized"`, but still very reliable.

### 🔹 Other Commitment Levels

| Level     | Meaning                                                                |
| --------- | ---------------------------------------------------------------------- |
| processed | Seen by the node you're connected to, but not confirmed at all         |
| confirmed | Voted on by most validators (safe for most apps)                       |
| finalized | 100% confirmed — it's finalized and won't be rolled back (most secure) |

---

## 🧪 What is `createMint()`?

`createMint()` is a function used to **create a new token mint** on Solana.

> 🏭 "Create my own token!" — like creating a brand new USDC or game token.

### 🔧 Syntax (TypeScript)

```ts
import { createMint } from "@solana/spl-token";

const mint = await createMint(
  connection, // Solana connection object
  payer, // Payer of transaction fees (must be a signer)
  mintAuthority, // PublicKey that can mint new tokens
  freezeAuthority, // (optional) Can freeze token accounts
  decimals // Number of decimal places (0 = NFT, 6–9 = tokens)
);
```

### 📌 Example: Create a Fungible Token

```ts
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
} from "@solana/spl-token";

import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const payer = Keypair.generate(); // Airdrop needed
const mintAuthority = payer.publicKey;

const mint = await createMint(
  connection,
  payer,
  mintAuthority,
  null, // No freeze authority
  9 // 9 decimal places (1 token = 1_000_000_000 base units)
);
console.log("✅ New token mint:", mint.toBase58());
```

### 🧩 Example Use Cases

| Use Case          | `createMint()` Config                      |
| ----------------- | ------------------------------------------ |
| NFT (1/1)         | `decimals = 0`, supply = 1                 |
| Game currency     | `decimals = 6 or 9`, supply = millions     |
| Stablecoin/Reward | You control `mintAuthority` and distribute |

### 🔒 Important Notes

- Airdrop SOL to your payer before calling `createMint()` (especially on devnet).
- If you lose the mint authority, you can’t mint more tokens.
- To send tokens:
  - Create associated token accounts
  - Use `mintTo()` and `transfer()` functions

### 🔁 Summary Table

| Parameter       | What It Does                            |
| --------------- | --------------------------------------- |
| connection      | Connection to Solana (devnet/mainnet)   |
| payer           | Pays for mint creation                  |
| mintAuthority   | Can mint more tokens                    |
| freezeAuthority | (Optional) Can freeze/unfreeze accounts |
| decimals        | 0 = NFTs, 9 = tokens                    |

---

## 🔄 Token Account vs Associated Token Account (ATA)

Understanding the difference between a Token Account and an Associated Token Account (ATA) is fundamental when working with SPL tokens on Solana.

### 🪙 What is a Token Account?

- A Solana account that holds a specific SPL token.
- Used to store tokens like USDC, NFTs, etc.
- Each token mint requires a separate token account per user.

📌 **Example**: Phantom wallet stores SOL in the main account and USDC in a token account.

### 🤝 What is an Associated Token Account (ATA)?

- A standardized, auto-derived token account for a (wallet + mint) pair.
- Created using a known PDA formula:

```ts
ATA = getAssociatedTokenAddress(mint, wallet);
```

- Ensures predictability and compatibility with wallets/dApps.

### ✅ Main Differences

| Feature            | Token Account              | Associated Token Account (ATA)        |
| ------------------ | -------------------------- | ------------------------------------- |
| Custom or Standard | Custom (any address)       | Standard (PDA based on wallet + mint) |
| Creation           | `createAccount()`          | `getOrCreateAssociatedTokenAccount()` |
| Discoverability    | Manual                     | Predictable and standardized          |
| Preferred by       | Low-level programs         | Wallets, dApps, NFT tools             |
| Multiple allowed   | Yes (many per wallet/mint) | No (only one per wallet/mint)         |

### 🔧 Code Comparison

#### 🔹 Token Account (Custom)

```ts
import { createAccount } from "@solana/spl-token";

const tokenAccount = await createAccount(
  connection,
  payer,
  mint,
  wallet.publicKey // Owner
);
```

#### 🔹 Associated Token Account (ATA)

```ts
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

const ata = await getOrCreateAssociatedTokenAccount(
  connection,
  payer,
  mint,
  wallet.publicKey
);
```

### 💡 When to Use What?

| Scenario                     | Use                          |
| ---------------------------- | ---------------------------- |
| Building a wallet or dApp    | ✅ Use ATA                   |
| Want multiple token accounts | 🔄 Use custom token accounts |
| Want maximum compatibility   | ✅ Use ATA                   |
| Writing low-level programs   | 🔧 Use custom token accounts |

### 🧠 Summary

> 🔹 All ATAs are Token Accounts  
> 🔸 But not all Token Accounts are ATAs!

Use **ATA** for standard, wallet-friendly token management. Use **custom accounts** for advanced use cases.
