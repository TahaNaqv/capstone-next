"use client";

import { useMemo } from "react";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  Keypair,
} from "@solana/web3.js";
import {
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import {
  useAppKitConnection,
  type Provider,
} from "@reown/appkit-adapter-solana/react";

import idl from "./idl/capstone_anchor.json";
import type { CapstoneAnchor } from "./idl/capstone_anchor";

export const PROGRAM_ID = new PublicKey(idl.address);

function buildWallet(provider: Provider): Wallet {
  return {
    publicKey: provider.publicKey!,
    signTransaction: async <T extends Transaction | VersionedTransaction>(
      tx: T,
    ) => provider.signTransaction(tx),
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(
      txs: T[],
    ) => provider.signAllTransactions(txs),
    payer: Keypair.generate(),
  };
}

export function useProgram() {
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { address } = useAppKitAccount();

  return useMemo(() => {
    if (!connection || !walletProvider?.publicKey || !address) {
      return null;
    }

    const provider = new AnchorProvider(
      connection as unknown as Connection,
      buildWallet(walletProvider),
      { commitment: "confirmed" },
    );

    return new Program<CapstoneAnchor>(idl as CapstoneAnchor, provider);
  }, [connection, walletProvider, address]);
}

export function deriveJarPda(creator: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("jar"), creator.toBuffer()],
    PROGRAM_ID,
  )[0];
}
