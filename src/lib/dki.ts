/**
 * Dynamic Keyword Insertion (DKI).
 *
 * Reads campaign parameters from the landing page URL so the headline can echo
 * back the exact search term the visitor typed. This raises relevance and
 * conversion because the page visibly matches the ad that was clicked.
 *
 * Supported query params:
 *   kw_vehicle  -> vehicle noun, e.g. "SUV", "Truck", "Minivan", "Car"
 *   loc         -> location, e.g. "Texas", "Denver"
 *   kw_breed    -> optional breed noun, e.g. "Labrador", "Senior Dog"
 *
 * Example:
 *   /?kw_vehicle=SUV&loc=Texas
 *   -> "The SUV Dog Ramp Texans Actually Use"
 */

export interface DkiParams {
  /** Raw vehicle param, or null when absent. */
  rawVehicle: string | null;
  /** Raw location param, or null when absent. */
  rawLocation: string | null;
  /** Raw breed param, or null when absent. */
  rawBreed: string | null;
  /**
   * Headline phrase, grammatically correct with or without the param.
   *   kw_vehicle=SUV -> "SUV Dog Ramp"
   *   (absent)       -> "Dog Car Ramp"
   */
  vehiclePhrase: string;
  /**
   * Second headline line.
   *   loc=Texas -> "Texas Owners Love"
   *   (absent)  -> "Owners Actually Love"
   */
  locationPhrase: string;
  /**
   * Inline phrase for body copy.
   *   loc=Texas -> "in Texas"
   *   (absent)  -> "in any vehicle"
   */
  locationInline: string;
  /**
   * Breed qualifier for body copy.
   *   kw_breed=Labrador -> "built for Labradors"
   *   (absent)          -> "built for dogs of every size"
   */
  breedPhrase: string;
  /** Vehicle noun for mid-sentence use, e.g. "SUV" or "car or SUV". */
  vehicleInline: string;
  /** True when at least one campaign param was present. */
  isPersonalized: boolean;
}

/** Query keys that carry ad-campaign context. */
const TRACKED_KEYS = ['kw_vehicle', 'loc', 'kw_breed', 'gclid', 'fbclid', 'ttclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

/** Strips control chars and caps length so user input cannot break the page. */
function sanitize(value: string | null, maxLength = 48): string | null {
  if (!value) return null;
  const cleaned = value
    .replace(/[<>]/g, '')
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned || cleaned.length > maxLength) return null;
  return cleaned;
}

/**
 * Parse DKI values from the current URL. Safe to call in the browser only.
 *
 * Every returned phrase is designed to read correctly when the param is
 * missing, so organic traffic sees a clean default headline rather than
 * leftover template tokens.
 */
export function readDkiParams(search: string = typeof window !== 'undefined' ? window.location.search : ''): DkiParams {
  const params = new URLSearchParams(search);

  const rawVehicle = sanitize(params.get('kw_vehicle'));
  const rawLocation = sanitize(params.get('loc'));
  const rawBreed = sanitize(params.get('kw_breed'));

  return {
    rawVehicle,
    rawLocation,
    rawBreed,
    vehiclePhrase: rawVehicle ? `${rawVehicle} Dog Ramp` : 'Dog Car Ramp',
    locationPhrase: rawLocation ? `${rawLocation} Owners Love` : 'Owners Actually Love',
    locationInline: rawLocation ? `in ${rawLocation}` : 'in any vehicle',
    breedPhrase: rawBreed ? `built for ${rawBreed}` : 'built for dogs of every size',
    vehicleInline: rawVehicle ? rawVehicle.toLowerCase() : 'car or SUV',
    isPersonalized: Boolean(rawVehicle || rawLocation || rawBreed),
  };
}

/**
 * Collects every query parameter that must survive the hand-off from this page
 * to the Shopify checkout domain, so attribution is not lost at checkout.
 * Returns a URLSearchParams, empty when nothing needs forwarding.
 */
export function collectAttributionParams(
  search: string = typeof window !== 'undefined' ? window.location.search : ''
): URLSearchParams {
  const params = new URLSearchParams(search);
  const forwarded = new URLSearchParams();
  TRACKED_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value !== null && value !== '') forwarded.set(key, value);
  });
  return forwarded;
}

/**
 * Appends attribution parameters to a Shopify checkout URL.
 * Falls back to the original URL if anything goes wrong.
 */
export function appendAttribution(checkoutUrl: string, forwarded: URLSearchParams): string {
  if (!checkoutUrl || [...forwarded.keys()].length === 0) return checkoutUrl;
  try {
    const url = new URL(checkoutUrl);
    forwarded.forEach((value, key) => {
      // Never overwrite a param Shopify itself set on the checkout URL
      if (!url.searchParams.has(key)) url.searchParams.set(key, value);
    });
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}
