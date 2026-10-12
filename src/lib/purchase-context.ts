import { createContext, useContext } from 'react';
import type { Variant } from './shopify';
import type { OfferTier } from './offers';

export type { Variant };

export interface PurchaseContextValue {
  /** Currently selected tier. */
  tier: OfferTier;
  selectedId: string;
  selectTier: (id: string) => void;
  /** Order bump state (traction mat). */
  bumpEnabled: boolean;
  setBumpEnabled: (next: boolean) => void;
  bumpPrice: number;
  /** True when the mat is already inside the selected bundle. */
  bumpIncluded: boolean;
  /** Whether the bump should render at all (mat exists and is not bundled). */
  showBump: boolean;
  /** Post-purchase tether upsell. */
  tetherUpsell: boolean;
  setTetherUpsell: (next: boolean) => void;
  tetherPrice: number;
  showTetherUpsell: boolean;
  /** Live totals. */
  total: number;
  savingsPercent: number;
  /** Storefront state. */
  loading: boolean;
  ready: boolean;
  rampVariants: Variant[];
  matVariant: Variant | null;
  tetherVariant: Variant | null;
  stock: number | null;
  /** Purchase action — shared by the buy box and the mobile buy bar. */
  buying: boolean;
  error: string | null;
  buy: () => Promise<void>;
}

export const PurchaseContext = createContext<PurchaseContextValue | null>(null);

/**
 * Access the shared purchase flow. Must be used within a PurchaseProvider.
 */
export function usePurchase(): PurchaseContextValue {
  const ctx = useContext(PurchaseContext);
  if (!ctx) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return ctx;
}