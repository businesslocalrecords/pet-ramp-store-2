import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useCart } from './cart-context';
import { fetchProductByHandle, fetchProductStock, type ProductVariantEdge } from './shopify';
import { collectAttributionParams, appendAttribution } from './dki';
import { trackAddToCart, trackBeginCheckout, pushBeginCheckoutDataLayer } from './analytics';
import { TIERS, DEFAULT_TIER_ID, PRODUCT_HANDLES, ADDON_PRICES } from './offers';
import { PurchaseContext, type PurchaseContextValue } from './purchase-context';

const BUMP_PRICE = ADDON_PRICES.tractionMat;
const COUPON_CODE = 'RAMP20';

type Variant = ProductVariantEdge['node'];

/**
 * Single source of truth for the purchase flow.
 *
 * Both the desktop buy box and the mobile sticky buy bar call the same `buy()`,
 * and the post-purchase upsell reads from the same context, so there is
 * exactly one place that writes to the cart, fires conversion events, and
 * forwards attribution into the Shopify checkout.
 */
export function PurchaseProvider({ children }: { children: ReactNode }) {
  const { addItem, loading: cartLoading, checkoutUrl } = useCart();

  const [selectedId, setSelectedId] = useState(DEFAULT_TIER_ID);
  const [bumpEnabled, setBumpEnabled] = useState(false);
  const [tetherUpsell, setTetherUpsell] = useState(false);

  const [rampVariants, setRampVariants] = useState<Variant[]>([]);
  const [matVariant, setMatVariant] = useState<Variant | null>(null);
  const [tetherVariant, setTetherVariant] = useState<Variant | null>(null);
  const [stock, setStock] = useState<number | null>(null);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ramp, mat, tether, stockLevel] = await Promise.all([
          fetchProductByHandle(PRODUCT_HANDLES.heroRamp),
          fetchProductByHandle(PRODUCT_HANDLES.tractionMat),
          fetchProductByHandle(PRODUCT_HANDLES.carTether),
          fetchProductStock(PRODUCT_HANDLES.heroRamp),
        ]);
        if (cancelled) return;

        if (ramp) setRampVariants(ramp.variants.edges.map((e) => e.node));
        if (mat) {
          const variants = mat.variants.edges.map((e) => e.node);
          setMatVariant(variants.find((v) => v.availableForSale) ?? variants[0] ?? null);
        }
        if (tether) {
          const variants = tether.variants.edges.map((e) => e.node);
          setTetherVariant(variants.find((v) => v.availableForSale) ?? variants[0] ?? null);
        }
        setStock(stockLevel);
      } catch (err) {
        console.error('PurchaseProvider: failed to load products', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tier = TIERS.find((t) => t.id === selectedId) ?? TIERS[1];

  const rampVariant = rampVariants.find((v) => v.availableForSale) ?? rampVariants[0] ?? null;

  /** Resolve the ramp variant for a tier, preferring a bundle variant. */
  const resolveRampVariant = useCallback(
    (units: number): Variant | null => {
      if (!rampVariants.length) return null;
      if (units === 1) return rampVariant;
      return rampVariants.find((v) => /2|double|twin|bundle/i.test(v.title)) ?? rampVariant;
    },
    [rampVariants, rampVariant]
  );

  /**
   * The mat is included in the price for tiers that bundle it. The order bump
   * therefore only adds it when the tier does not already contain it, so it
   * can never be charged for twice.
   */
  const matAlreadyIncluded = tier.includesMat;
  const bumpActive = bumpEnabled && !matAlreadyIncluded && Boolean(matVariant);

  /** Tether is bundled in the top tier, otherwise offered as an upgrade. */
  const tetherAlreadyIncluded = tier.includesTether === true;
  const tetherActive = tetherUpsell && !tetherAlreadyIncluded && Boolean(tetherVariant);

  const total =
    tier.price +
    (bumpActive ? BUMP_PRICE : 0) +
    (tetherActive ? ADDON_PRICES.carTether : 0);

  const savingsPercent = Math.round((1 - tier.price / tier.compareAt) * 100);

  const buy = useCallback(async () => {
    const units = tier.id === 'three' ? 2 : 1;
    const chosen = resolveRampVariant(units);

    if (!chosen) {
      setError('Checkout is temporarily unavailable. Please try again in a moment.');
      return;
    }

    setBuying(true);
    setError(null);

    // Single ordered list of every line we intend to add, used for both the
    // cart write and the conversion events so analytics matches the order.
    const lines: { variant: Variant; qty: number; name: string; price: number; attribute?: string }[] = [
      { variant: chosen, qty: units, name: 'PawGrip Pro Foldable Dog Car Ramp', price: tier.price },
    ];
    if (bumpActive && matVariant) {
      lines.push({ variant: matVariant, qty: 1, name: 'Heavy-Duty Traction Mat 2-Pack (order bump)', price: BUMP_PRICE });
    }
    if (tetherActive && tetherVariant) {
      lines.push({ variant: tetherVariant, qty: 1, name: 'Crash-Tested Car Safety Tether (upsell)', price: ADDON_PRICES.carTether });
    }

    try {
      // Atomic-ish sequential write: ramp, then the add-ons
      await addItem(chosen.id, units);
      if (bumpActive && matVariant) {
        await addItem(matVariant.id, 1, [{ key: '_order_bump', value: 'traction-mat' }]);
      }
      if (tetherActive && tetherVariant) {
        await addItem(tetherVariant.id, 1, [{ key: '_post_purchase_upsell', value: 'car-safety-tether' }]);
      }

      const items = lines.map((l) => ({
        item_id: l.variant.id,
        item_name: l.name,
        price: l.price,
        quantity: l.qty,
      }));

      trackAddToCart(
        PRODUCT_HANDLES.heroRamp,
        'PawGrip Pro Foldable Dog Car Ramp',
        total,
        units,
        'USD'
      );
      trackBeginCheckout(items, 'USD');
      pushBeginCheckoutDataLayer(items, 'USD', COUPON_CODE);

      if (checkoutUrl) {
        // CRITICAL: forward click IDs + UTMs so attribution survives the
        // cross-domain hop to Shopify checkout
        window.location.assign(appendAttribution(checkoutUrl, collectAttributionParams()));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBuying(false);
    }
  }, [tier, bumpActive, tetherActive, matVariant, tetherVariant, resolveRampVariant, addItem, checkoutUrl, total]);

  const value: PurchaseContextValue = {
    tier,
    selectedId,
    selectTier: setSelectedId,
    bumpEnabled,
    setBumpEnabled,
    bumpPrice: BUMP_PRICE,
    /** True when the mat is already in the selected bundle. */
    bumpIncluded: matAlreadyIncluded,
    /** Whether the bump should render at all. */
    showBump: !matAlreadyIncluded && Boolean(matVariant),
    tetherUpsell,
    setTetherUpsell,
    tetherPrice: ADDON_PRICES.carTether,
    showTetherUpsell: !tetherAlreadyIncluded && Boolean(tetherVariant),
    total,
    savingsPercent,
    loading: loading || cartLoading,
    ready: !loading,
    rampVariants,
    matVariant,
    tetherVariant,
    stock,
    buying,
    error,
    buy,
  };

  return <PurchaseContext.Provider value={value}>{children}</PurchaseContext.Provider>;
}