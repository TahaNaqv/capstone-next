"use client";

import { useCallback, useEffect, useState } from "react";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import {
  useAppKitConnection,
  type Provider,
} from "@reown/appkit-adapter-solana/react";

import { ConnectButton } from "../components/connect-button";
import { deriveJarPda, useProgram } from "./use-program";

type JarState = {
  creator: PublicKey;
  totalRaised: BN;
  donationCount: BN;
  lastDonor: PublicKey;
  bump: number;
};

export default function TipJarPage() {
  const program = useProgram();
  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { connection } = useAppKitConnection();

  const [recipient, setRecipient] = useState("");
  const [donateAmount, setDonateAmount] = useState("0.1");
  const [withdrawAmount, setWithdrawAmount] = useState("0.05");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    signature?: string;
  } | null>(null);
  const [lookupJar, setLookupJar] = useState<JarState | null>(null);
  const [myJar, setMyJar] = useState<JarState | null>(null);
  const [myJarBalanceSol, setMyJarBalanceSol] = useState<number | null>(null);

  const me = address ? new PublicKey(address) : null;

  const refreshMine = useCallback(async () => {
    if (!program || !me || !connection) return;
    const jarPda = deriveJarPda(me);
    try {
      const state = (await program.account.tipJar.fetch(jarPda)) as JarState;
      setMyJar(state);
      const lamports = await connection.getBalance(jarPda);
      setMyJarBalanceSol(lamports / LAMPORTS_PER_SOL);
    } catch {
      setMyJar(null);
      setMyJarBalanceSol(null);
    }
  }, [program, me?.toBase58(), connection]);

  useEffect(() => {
    refreshMine();
  }, [refreshMine]);

  const lookupRecipient = useCallback(async () => {
    if (!program || !recipient) {
      setLookupJar(null);
      return;
    }
    try {
      const pk = new PublicKey(recipient);
      const pda = deriveJarPda(pk);
      const state = (await program.account.tipJar.fetch(pda)) as JarState;
      setLookupJar(state);
      setStatus(null);
    } catch (err) {
      setLookupJar(null);
      setStatus({
        message:
          "No jar found for that address — they need to create one first.",
      });
    }
  }, [program, recipient]);

  const onInit = async () => {
    if (!program || !me) return;
    setBusy(true);
    setStatus({ message: "Creating your jar…" });
    try {
      const sig = await program.methods
        .initJar()
        .accounts({ creator: me })
        .rpc();
      setStatus({ message: "Jar created.", signature: sig });
      await refreshMine();
    } catch (err) {
      setStatus({ message: `Error: ${(err as Error).message}` });
    } finally {
      setBusy(false);
    }
  };

  const onDonate = async () => {
    if (!program || !me) return;
    setBusy(true);
    setStatus({ message: "Sending donation…" });
    try {
      const target = recipient ? new PublicKey(recipient) : me;
      const lamports = new BN(
        Math.floor(parseFloat(donateAmount) * LAMPORTS_PER_SOL),
      );
      const jarPda = deriveJarPda(target);
      const sig = await program.methods
        .donate(lamports)
        .accountsPartial({ jar: jarPda, donor: me })
        .rpc();
      setStatus({ message: "Donation sent.", signature: sig });
      await refreshMine();
      if (recipient) await lookupRecipient();
    } catch (err) {
      setStatus({ message: `Error: ${(err as Error).message}` });
    } finally {
      setBusy(false);
    }
  };

  const onWithdraw = async () => {
    if (!program || !me) return;
    setBusy(true);
    setStatus({ message: "Withdrawing…" });
    try {
      const lamports = new BN(
        Math.floor(parseFloat(withdrawAmount) * LAMPORTS_PER_SOL),
      );
      const sig = await program.methods
        .withdraw(lamports)
        .accounts({ creator: me })
        .rpc();
      setStatus({ message: "Withdrawn.", signature: sig });
      await refreshMine();
    } catch (err) {
      setStatus({ message: `Error: ${(err as Error).message}` });
    } finally {
      setBusy(false);
    }
  };

  const explorerUrl = (signature: string) =>
    `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-50 dark:bg-black py-16 px-6">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
            Solana Tip Jar
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Anchor + Reown demo on Solana devnet.
          </p>
          <ConnectButton />
        </header>

        {!address && (
          <p className="text-zinc-500">Connect a wallet to continue.</p>
        )}

        {address && (
          <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-xl font-medium text-black dark:text-zinc-50">
              Your jar
            </h2>
            <p className="text-sm text-zinc-500 break-all">
              PDA: {me ? deriveJarPda(me).toBase58() : "—"}
            </p>
            {myJar ? (
              <ul className="text-sm flex flex-col gap-1">
                <li>
                  <strong>Total raised:</strong>{" "}
                  {myJar.totalRaised.toNumber() / LAMPORTS_PER_SOL} SOL
                </li>
                <li>
                  <strong>Donations:</strong> {myJar.donationCount.toString()}
                </li>
                <li className="break-all">
                  <strong>Last donor:</strong>{" "}
                  {myJar.lastDonor.equals(PublicKey.default)
                    ? "—"
                    : myJar.lastDonor.toBase58()}
                </li>
                <li>
                  <strong>Jar balance:</strong>{" "}
                  {myJarBalanceSol?.toFixed(4) ?? "…"} SOL
                </li>
              </ul>
            ) : (
              <button
                onClick={onInit}
                disabled={busy}
                className="self-start rounded bg-black text-white dark:bg-white dark:text-black px-4 py-2 disabled:opacity-50"
              >
                Create my jar
              </button>
            )}
          </section>
        )}

        {address && (
          <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-xl font-medium text-black dark:text-zinc-50">
              Donate
            </h2>
            <label className="text-sm">
              Recipient wallet (leave blank to tip yourself)
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                onBlur={lookupRecipient}
                placeholder="Recipient pubkey"
                className="mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 font-mono text-xs"
              />
            </label>
            {lookupJar && recipient && (
              <p className="text-xs text-zinc-500">
                Found jar — {lookupJar.donationCount.toString()} donation(s),{" "}
                {lookupJar.totalRaised.toNumber() / LAMPORTS_PER_SOL} SOL
                raised.
              </p>
            )}
            <label className="text-sm">
              Amount (SOL)
              <input
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
                className="mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
              />
            </label>
            <button
              onClick={onDonate}
              disabled={busy || !walletProvider?.publicKey}
              className="self-start rounded bg-black text-white dark:bg-white dark:text-black px-4 py-2 disabled:opacity-50"
            >
              Send donation
            </button>
          </section>
        )}

        {address && myJar && (
          <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-xl font-medium text-black dark:text-zinc-50">
              Withdraw
            </h2>
            <label className="text-sm">
              Amount (SOL)
              <input
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
              />
            </label>
            <button
              onClick={onWithdraw}
              disabled={busy}
              className="self-start rounded bg-black text-white dark:bg-white dark:text-black px-4 py-2 disabled:opacity-50"
            >
              Withdraw to my wallet
            </button>
          </section>
        )}

        {status && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 break-all">
            {status.message}
            {status.signature && (
              <>
                {" "}
                <a
                  href={explorerUrl(status.signature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600 dark:text-blue-400"
                >
                  View on Solana Explorer ↗
                </a>
              </>
            )}
          </p>
        )}
      </div>
    </main>
  );
}
