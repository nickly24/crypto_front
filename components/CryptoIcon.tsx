"use client";

import { useState } from "react";

/** Extracts base symbol: "BTC-USDT-SWAP" -> "btc", "USDT" -> "usdt" */
function symbolToKey(symbol: string): string {
  const s = String(symbol || "").trim().toUpperCase();
  if (!s) return "";
  const base = s.replace(/-USDT-SWAP$/i, "").replace(/-USDT$/i, "").split("-")[0] || s;
  return base.toLowerCase();
}

/** CoinGecko image paths (small 64px) - stable CDN */
const COIN_ICONS: Record<string, string> = {
  btc: "1/small/bitcoin.png",
  eth: "279/small/ethereum.png",
  usdt: "325/small/Tether.png",
  usdc: "6319/small/usdc.png",
  bnb: "825/small/bnb-icon2_2x.png",
  xrp: "44/small/xrp-symbol-white-128.png",
  ada: "975/small/cardano.png",
  sol: "4128/small/solana.png",
  doge: "5/small/dogecoin.png",
  shib: "11939/small/shiba.png",
  xlm: "100/small/stellarcoin.png",
  avax: "12559/small/Avalanche_Circle_RedWhite_Trans.png",
  link: "877/small/chainlink-new-logo.png",
  dot: "12171/small/polkadot.png",
  matic: "4713/small/matic-token-icon.png",
  ltc: "2/small/litecoin.png",
  uni: "12504/small/uniswap-v3.png",
  atom: "1481/small/cosmos_hub.png",
  etc: "1027/small/ethereum-classic-logo.png",
  xmr: "69/small/monero_logo.png",
  fil: "22813/small/fil.png",
  apt: "26455/small/aptos_round.png",
  arb: "16547/small/photo_2023-03-29_21.47.00.jpeg",
  op: "25244/small/Optimism.png",
  near: "10365/small/near.jpg",
  inj: "12882/small/Secondary_Symbol.png",
  sui: "26375/small/sui.png",
  sei: "28205/small/Sei_Logo-based.png",
  pepe: "29850/small/pepe-token.jpeg",
  wld: "31019/small/worldcoin.jpeg",
  floki: "16746/small/Floki.svg",
  bonk: "28600/small/bonk.jpg",
};

const CDN = "https://assets.coingecko.com/coins/images";
const PLACEHOLDER_URL = "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg";

type CryptoIconProps = {
  symbol: string;
  size?: number;
  className?: string;
};

function PlaceholderIcon({ size, className }: { size: number; className?: string }) {
  return (
    <div
      className={`shrink-0 rounded-full bg-cover bg-center ${className}`}
      style={{ width: size, height: size, backgroundImage: `url(${PLACEHOLDER_URL})` }}
      aria-hidden
    />
  );
}

export function CryptoIcon({ symbol, size = 20, className = "" }: CryptoIconProps) {
  const [error, setError] = useState(false);
  const key = symbolToKey(symbol);
  if (!key) return <PlaceholderIcon size={size} className={className} />;

  const path = COIN_ICONS[key];
  if (!path || error) return <PlaceholderIcon size={size} className={className} />;

  return (
    <img
      src={`${CDN}/${path}`}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-full ${className}`}
      style={{ width: size, height: size }}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}
