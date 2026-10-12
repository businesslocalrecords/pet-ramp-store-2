/**
 * Analytics tracking utilities for CPC campaigns.
 * Supports Google Ads (gtag), Meta Pixel (fbq), and GA4.
 */

interface AnalyticsEventParams {
  event_name: string;
  currency?: string;
  value?: number;
  items?: Array<{
    item_id: string;
    item_name?: string;
    quantity: number;
    price: number;
    item_category?: string;
  }>;
  content_ids?: string[];
  content_type?: 'product' | 'product_group';
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    fbq: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

/**
 * Initialize analytics with Google Ads conversion ID and Meta Pixel ID.
 * Call this once in your app root (e.g., main.tsx).
 */
export function initAnalytics(config: {
  gaMeasurementId?: string;      // G-XXXXXXXXXX
  googleAdsConversionId?: string; // AW-XXXXXXXXX
  metaPixelId?: string;           // 123456789012345
}) {
  if (typeof window === 'undefined') return;

  const { gaMeasurementId, googleAdsConversionId, metaPixelId } = config;

  // Google Analytics 4 + Google Ads (via gtag)
  if (gaMeasurementId || googleAdsConversionId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());

    if (gaMeasurementId) {
      window.gtag('config', gaMeasurementId);
    }
    if (googleAdsConversionId) {
      window.gtag('config', googleAdsConversionId);
    }

    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId || googleAdsConversionId}`;
    document.head.appendChild(script);
  }

  // Meta Pixel
  if (metaPixelId) {
    const fbq = function (...args: unknown[]) {
      const fn = fbq as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] };
      if (fn.callMethod) {
        fn.callMethod(...args);
      } else {
        fn.queue.push(args);
      }
    };
    (fbq as unknown as { queue: unknown[] }).queue = [];
    (window as { fbq: unknown }).fbq = fbq;
    fbq('init', metaPixelId);
    fbq('track', 'PageView');

    // Load Meta Pixel script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }
}

/**
 * Track a custom event across all configured platforms.
 */
export function trackEvent(params: AnalyticsEventParams) {
  if (typeof window === 'undefined') return;

  const { event_name, currency = 'USD', value, items, content_ids, content_type } = params;

  // GA4 / Google Ads via gtag
  if (window.gtag) {
    window.gtag('event', event_name, {
      currency,
      value,
      items,
      content_ids,
      content_type,
    });
  }

  // Meta Pixel
  if (window.fbq) {
    const fbqEventMap: Record<string, string> = {
      view_item: 'ViewContent',
      add_to_cart: 'AddToCart',
      begin_checkout: 'InitiateCheckout',
      purchase: 'Purchase',
      view_cart: 'ViewCart',
    };
    const fbqEvent = fbqEventMap[event_name] || event_name;
    window.fbq('track', fbqEvent, {
      currency,
      value,
      content_ids,
      content_type,
      contents: items?.map(item => ({
        id: item.item_id,
        quantity: item.quantity,
        item_price: item.price,
      })),
    });
  }

  // Console log for debugging
  console.debug('[Analytics]', event_name, params);
}

/**
 * Track product view (landing page load)
 */
export function trackViewItem(itemId: string, itemName: string, price: number, currency = 'USD') {
  trackEvent({
    event_name: 'view_item',
    currency,
    value: price,
    items: [{ item_id: itemId, item_name: itemName, quantity: 1, price }],
    content_ids: [itemId],
    content_type: 'product',
  });
}

/**
 * Track add to cart
 */
export function trackAddToCart(itemId: string, itemName: string, price: number, quantity: number, currency = 'USD') {
  trackEvent({
    event_name: 'add_to_cart',
    currency,
    value: price * quantity,
    items: [{ item_id: itemId, item_name: itemName, quantity, price }],
    content_ids: [itemId],
    content_type: 'product',
  });
}

/**
 * Track begin checkout
 */
export function trackBeginCheckout(items: Array<{ item_id: string; item_name: string; price: number; quantity: number }>, currency = 'USD') {
  const value = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  trackEvent({
    event_name: 'begin_checkout',
    currency,
    value,
    items,
    content_ids: items.map(i => i.item_id),
    content_type: 'product',
  });
}

/**
 * Track purchase (call on checkout completion / thank you page)
 */
export function trackPurchase(
  transactionId: string,
  items: Array<{ item_id: string; item_name: string; price: number; quantity: number }>,
  currency = 'USD',
  shipping = 0,
  tax = 0
) {
  const value = items.reduce((sum, i) => sum + i.price * i.quantity, 0) + shipping + tax;
  trackEvent({
    event_name: 'purchase',
    currency,
    value,
    items,
    content_ids: items.map(i => i.item_id),
    content_type: 'product',
  });

  // Google Ads needs transaction_id for purchase
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      currency,
      value,
      items,
      shipping,
      tax,
    });
  }
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      currency,
      value,
      content_ids: items.map(i => i.item_id),
      content_type: 'product',
      contents: items.map(item => ({
        id: item.item_id,
        quantity: item.quantity,
        item_price: item.price,
      })),
    });
  }
}

/* ==========================================================================
   Enhanced Conversions
   ========================================================================== */

export interface DataLayerItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}

/**
 * GA4 / Google Ads compliant dataLayer.push for begin_checkout.
 *
 * `currency` + `value` + `items` make the event measurable in GA4 reports and
 * usable as a Google Ads conversion action for target-ROAS bidding.
 *
 * `user_data` follows the Enhanced Conversions schema and is only attached at
 * the purchase step, where the shopper has actually supplied their details.
 * Never push personal data you do not have consent to process.
 */
export function pushBeginCheckoutDataLayer(
  items: DataLayerItem[],
  currency = 'USD',
  coupon?: string
): void {
  if (typeof window === 'undefined') return;

  const value = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  window.dataLayer.push({
    event: 'begin_checkout',
    ecommerce: {
      currency,
      value: Number(value.toFixed(2)),
      coupon,
      items: items.map((item) => ({
        item_id: item.item_id,
        item_name: item.item_name,
        price: item.price,
        quantity: item.quantity,
        item_category: 'Pet Ramp',
      })),
    },
  });

  console.debug('[Analytics] dataLayer begin_checkout pushed', { value, itemCount: items.length });
}

/**
 * Enhanced Conversions payload for the purchase/thank-you step, including the
 * `user_data` object Google matches against signed-in accounts. Call this from
 * your order-confirmation page with the customer attributes you collected.
 */
export function pushPurchaseCompleteDataLayer(params: {
  transactionId: string;
  items: DataLayerItem[];
  currency?: string;
  shipping?: number;
  tax?: number;
  userData?: {
    email?: string;
    phoneNumber?: string;
    address?: {
      firstName?: string;
      lastName?: string;
      street?: string;
      city?: string;
      region?: string;
      postalCode?: string;
      country?: string;
    };
  };
}): void {
  if (typeof window === 'undefined') return;

  const {
    transactionId,
    items,
    currency = 'USD',
    shipping = 0,
    tax = 0,
    userData,
  } = params;

  const value = items.reduce((sum, i) => sum + i.price * i.quantity, 0) + shipping + tax;

  window.dataLayer.push({
    event: 'purchase',
    ecommerce: {
      transaction_id: transactionId,
      currency,
      value: Number(value.toFixed(2)),
      shipping,
      tax,
      items: items.map((item) => ({
        item_id: item.item_id,
        item_name: item.item_name,
        price: item.price,
        quantity: item.quantity,
        item_category: 'Pet Ramp',
      })),
    },
    // Enhanced Conversions — matched by Google against signed-in accounts
    ...(userData ? { user_data: userData } : {}),
  });
}