"use client";

import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solanaDevnet } from "@reown/appkit/networks";

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_REOWN_PROJECT_ID is not set. Get one from https://dashboard.reown.com",
  );
}

const solanaWeb3JsAdapter = new SolanaAdapter();

const metadata = {
  name: "Capstone",
  description: "Capstone Solana dApp",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solanaDevnet],
  defaultNetwork: solanaDevnet,
  metadata,
  projectId,
  features: {
    analytics: true,
  },
});

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
