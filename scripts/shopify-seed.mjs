/**
 * Shopify catalog seeder â€” PawGrip Pro
 * ===================================
 *
 * Creates the full premium joint-health catalog in the Shopify Admin API:
 *   1 hero product, 4 supporting products, 4 collections, tags, tracked
 *   inventory, publication to the Online Store channel, and an optional
 *   Subscribe & Save plan for the consumable.
 *
 * WHY A SCRIPT AND NOT THE ADMIN UI
 * ---------------------------------
 * The token in .env.local is a Storefront API token (32-char hex). That API
 * is READ-ONLY for products, so it can never create them. This script uses
 * the Admin API instead, which needs its own custom-app token â€” see
 * HOW TO GET THE TOKEN below.
 *
 * HOW TO GET THE TOKEN
 * --------------------
 * Modern Shopify Dev Dashboard apps don't show you an access token at all.
 * Instead you copy the Client ID and Client secret, and this script exchanges
 * them for a 24-hour token automatically â€” no long-lived shpat_ token needed.
 *
 * In the Dev Dashboard (the page that shows "PMax One-Product Storefront"):
 *   1. Settings -> Credentials -> copy the Client ID
 *   2. Same section -> click reveal on Client secret -> copy it
 *   3. Add BOTH to .env.local (never commit it):
 *        SHOPIFY_CLIENT_ID=7a3868cb0531481a4d1c51356b478e8b
 *        SHOPIFY_CLIENT_SECRET=<the secret you copied>
 *
 * Old-school alternative, if you would rather use a static token:
 *   Admin -> Settings -> Apps and sales channels -> Develop apps -> create an
 *   app -> Configure -> Admin API integration -> add scopes -> Install ->
 *   "API credentials" tab -> "Admin API access token" -> copy it once.
 *   Add to .env.local:  SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_....
 *
 * REQUIRED SCOPES on the app version (the token reads back what you granted):
 *   read_products, write_products, read_inventory, write_inventory,
 *   read_publications, write_publications, read_locations, write_locations.
 *   If a scope is missing, add it in the Dev Dashboard and release a new version.
 *
 * OPTIONAL: read_collections, write_collections. The React storefront reads
 * products by handle and tag, so collections are Admin-only organisation and
 * the seeder skips them cleanly if those scopes are unavailable.
 *
 * USAGE
 * -----
 *   node scripts/shopify-seed.mjs --dry-run        # preview, no credentials
 *   node scripts/shopify-seed.mjs                  # create everything
 *   node scripts/shopify-seed.mjs --verify         # re-check what exists
 *   node scripts/shopify-seed.mjs --purge --yes     # DELETE all non-catalog products
 *
 * The script is IDEMPOTENT: running it twice will not duplicate products.
 * It matches on handle, updates an existing product instead of creating a
 * second one. Created IDs are written to scripts/seed-output.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(__dirname, 'seed-output.json');

/* -------------------------------------------------------------------------- */
/* Config â€” loaded from .env.local                                             */
/* -------------------------------------------------------------------------- */

function loadEnv() {
  const env = {};
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error(`\n  ERROR: ${envPath} not found.\n`);
    process.exit(1);
  }
  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // Strip a single layer of surrounding quotes, exactly like Vite/dotenv
    if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnv();

/** Domain comes from the existing storefront variable. */
const SHOP_DOMAIN = env.VITE_SHOPIFY_STOREFRONT_DOMAIN;

/**
 * Authentication.
 *
 * Preference order:
 *   1. SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET  (Dev Dashboard apps â€” the
 *      script exchanges them for a fresh 24h token, so nothing long-lived
 *      is ever stored on disk)
 *   2. SHOPIFY_ADMIN_ACCESS_TOKEN                 (classic custom apps)
 *
 * ADMIN_TOKEN is assigned inside getToken(), which runs before any query.
 */
const CLIENT_ID = env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = env.SHOPIFY_CLIENT_SECRET;

const PURGE = process.argv.includes('--purge');
const CONFIRM = process.argv.includes('--yes');
const API_VERSION = '2025-10';
const DRY_RUN = process.argv.includes('--dry-run');
const VERIFY_ONLY = process.argv.includes('--verify');

if (!SHOP_DOMAIN) {
  console.error('  ERROR: VITE_SHOPIFY_STOREFRONT_DOMAIN is missing from .env.local');
  process.exit(1);
}

let ADMIN_TOKEN = env.SHOPIFY_ADMIN_ACCESS_TOKEN || null;
let tokenExpiresAt = 0;
let grantedScopes = null;

/**
 * Exchanges the app's client credentials for a short-lived Admin API token.
 * The grant only works when the app and the store are in the same Shopify
 * organization â€” which they are if you created both yourself.
 */
async function exchangeCredentials() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      'No Admin credentials found.\n\n' +
        '  Add BOTH of these to .env.local (from Dev Dashboard -> Settings -> Credentials):\n' +
        '    SHOPIFY_CLIENT_ID=<32-char client id shown on that page>\n' +
        '    SHOPIFY_CLIENT_SECRET=<click reveal, then copy>\n\n' +
        '  Or, if you prefer a static token:\n' +
        '    SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_....\n'
    );
  }

  const res = await fetch(`https://${SHOP_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
    const shopError = parsed?.error || '';
    if (shopError === 'shop_not_permitted') {
      throw new Error(
        'Client credentials rejected: shop_not_permitted.\n\n' +
          '  The app and the store must belong to the SAME Shopify organization.\n' +
          '  This happens when the app was created under a different org/account than\n' +
          '  the one that owns ' + SHOP_DOMAIN + '.\n\n' +
          '  Fix: re-create the app under the account that owns this store, then copy\n' +
          '       the new Client ID and secret into .env.local.\n' +
          '  Or:   use a static Admin API token instead (SHOPIFY_ADMIN_ACCESS_TOKEN).\n'
      );
    }
    throw new Error(
      `Token exchange failed (HTTP ${res.status}): ${text.slice(0, 300)}\n` +
        '  Check that the Client ID and Client secret were copied exactly, with no spaces.'
    );
  }

  const parsed = JSON.parse(text);
  if (!parsed.access_token) {
    throw new Error(`Token exchange returned no access_token: ${text.slice(0, 200)}`);
  }

  ADMIN_TOKEN = parsed.access_token;
  tokenExpiresAt = Date.now() + (parsed.expires_in ?? 86399) * 1000;
  grantedScopes = parsed.scope ? parsed.scope.split(',').map((s) => s.trim()).filter(Boolean) : [];
}

/** Resolves a valid Admin token, refreshing when it is close to expiry. */
async function getToken() {
  // Static token path â€” nothing to refresh
  if (env.SHOPIFY_ADMIN_ACCESS_TOKEN && !CLIENT_ID) {
    return env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  }
  // Client credentials path â€” refresh with a 60s safety margin
  if (!ADMIN_TOKEN || Date.now() > tokenExpiresAt - 60_000) {
    await exchangeCredentials();
  }
  return ADMIN_TOKEN;
}

/**
 * Scopes the seeder actually requires.
 *
 * Only WRITE scopes are mandatory — every read the seeder performs
 * (findProductByHandle, verifying stock) degrades gracefully if the matching
 * read scope is absent, because those reads happen on records we are creating.
 * Collections are excluded for the same reason: the React storefront maps
 * products by handle and tag in src/lib/offers.ts, never by collection.
 */
const REQUIRED_SCOPES = [
  'write_products', 'write_inventory', 'write_publications', 'write_locations',
];

/** Reads are useful but not blocking. */
const OPTIONAL_SCOPES = [
  'read_products', 'read_inventory', 'read_publications', 'read_locations',
  'read_collections', 'write_collections',
];

function reportScopes() {
  if (!grantedScopes?.length) return;
  const missingRequired = REQUIRED_SCOPES.filter((s) => !grantedScopes.includes(s));
  const missingOptional = OPTIONAL_SCOPES.filter((s) => !grantedScopes.includes(s));

  console.log(`  Scopes granted: ${grantedScopes.length}`);

  if (missingRequired.length) {
    warn(`Missing REQUIRED scopes: ${missingRequired.join(', ')}`);
    warn('Add them in the Dev Dashboard and release a NEW APP VERSION.');
    warn('Product creation will fail until you do.');
  } else {
    ok(`All ${REQUIRED_SCOPES.length} required write scopes present.`);
    warn('Read scopes not granted — idempotency checks will be skipped.');
  }

  if (missingOptional.length) {
    const collectionMissing = missingOptional.filter((s) => /collections/.test(s));
    if (collectionMissing.length) {
      warn('Collections will be skipped — the storefront does not need them.');
    }
  } else {
    ok('Collections scopes present — collections will be created.');
  }
}

if (!env.SHOPIFY_ADMIN_ACCESS_TOKEN && !CLIENT_ID && !DRY_RUN && !VERIFY_ONLY) {
  console.error(`
  ERROR: no Admin API credentials in .env.local.

  The Storefront token (VITE_SHOPIFY_STOREFRONT_TOKEN) CANNOT create products â€”
  that API is read-only. You need credentials for a custom app.

  FASTEST PATH (uses the Client ID/secret you are already looking at):
    Add these two lines to .env.local:
      SHOPIFY_CLIENT_ID=<from Dev Dashboard -> Settings -> Credentials>
      SHOPIFY_CLIENT_SECRET=<click reveal, then copy>

  Then run:
      npm run shopify:seed

  To preview the catalog without any credentials:
      npm run shopify:seed:dry
`);
  process.exit(1);
}

/* -------------------------------------------------------------------------- */
/* Minimal GraphQL client                                                      */
/* -------------------------------------------------------------------------- */

let requestCount = 0;

async function gql(query, variables = {}) {
  requestCount += 1;
  const token = await getToken();
  const endpoint = `https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const text = await res.text();

  if (res.status === 401) {
    throw new Error(
      'Admin API returned 401 Unauthorized.\n' +
        '  The token is invalid, expired, or lacks the required scopes.\n' +
        '  Required: read_products, write_products, read_inventory, write_inventory,\n' +
        '            read_collections, write_collections, read_locations,\n' +
        '            write_locations, read_publications, write_publications'
    );
  }
  if (res.status === 402) {
    throw new Error('Admin API returned 402 â€” your plan may not allow custom apps.');
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0, 400)}`);
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response: ${text.slice(0, 300)}`);
  }

  if (json.errors?.length) {
    const msg = json.errors.map((e) => e.message).join('; ');
    throw new Error(`GraphQL errors: ${msg}`);
  }
  return json.data;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const log = (...a) => console.log(...a);
const ok = (m) => console.log(`  \u2713 ${m}`);
const warn = (m) => console.log(`  ! ${m}`);

/**
 * Resolves the location that stock is credited to.
 *
 * Inventory is tracked PER LOCATION, so a variant cannot be given an
 * availableQuantity without a locationId. Locations returns the store's
 * physical locations; the first active one is used. Returns null when there is
 * none, in which case stock is simply not set at create time (it can be set
 * manually, or by re-running once a location exists).
 */
let LOCATION_ID = null;

async function resolveLocation() {
  try {
    const data = await gql(
      `query { locations(first: 5, includeInactive: false) { edges { node { id name } } } }`
    );
    const locs = data.locations.edges.map((e) => e.node);
    if (locs.length === 0) return null;
    // Prefer a location literally named "Shop location" (the default), else first
    const preferred = locs.find((l) => /shop location/i.test(l.name)) ?? locs[0];
    return preferred.id;
  } catch {
    return null;
  }
}

/**
 * Looks up a product by handle.
 *
 * Returns null when the app lacks read_products — in that case we cannot tell
 * whether the product already exists, so we attempt the create anyway. Shopify
 * rejects a duplicate handle with a clear userError, which the caller reports,
 * and that is a better outcome than refusing to run at all.
 */
async function findProductByHandle(handle) {
  try {
    const data = await gql(
      `query($q: String!) {
         products(first: 5, query: $q) {
           edges { node { id title handle status } }
         }
       }`,
      { q: `handle:${handle}` }
    );
    return data.products.edges.map((e) => e.node)[0] ?? null;
  } catch (err) {
    if (/access denied|not authorized|invalid api key|scope/i.test(err.message)) {
      warn(`read_products not granted — cannot check if "${handle}" already exists.`);
      return null;
    }
    throw err;
  }
}

async function findCollectionByHandle(handle) {
  const data = await gql(
    `query($q: String!) {
       collections(first: 5, query: $q) {
         edges { node { id title handle } }
       }
     }`,
    { q: `handle:${handle}` }
  );
  return data.collections.edges.map((e) => e.node)[0] ?? null;
}

/* -------------------------------------------------------------------------- */
/* THE CATALOG                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Hero product and supporting catalog.
 *
 * Copy is written for a premium DTC voice rather than copied from Chewy:
 * emotional triggers (joint pain, saving the owner's back, vet-recommended
 * safety) lead every description.
 */
const CATALOG = [
  /* ------------------------------- HERO ------------------------------- */
  {
    key: 'heroRamp',
    handle: 'premium-foldable-dog-car-ramp',
    title: 'The Premium Foldable Dog Car Ramp by PawGrip Pro',
    productType: 'Dog Car Ramp',
    tags: ['hero-product', 'Car Mobility', 'bestseller'],
    price: 79.99,
    compareAt: 139.99,
    cost: 38.0,
    sku: 'PGR-RAMP-STD',
    barcode: '',
    weight: 10.0,
    weightUnit: 'POUNDS',
    inventoryQuantity: 47,
    trackInventory: true,
    options: ['Size'],
    variants: [
      { option: 'Standard (62")', price: 79.99, compareAt: 139.99, sku: 'PGR-RAMP-STD' },
    ],
    excerpt:
      'Stop the joint damage before it starts. A 150 lb-rated, 10 lb-light ramp with PawGrip\u2122 Anti-Slip Tread, rated by 2,800+ owners.',
    description: `
<h2>Don't Wait Until They Can't Jump Anymore</h2>
<p>Every time your dog launches out of an SUV, the landing loads their front
elbows with roughly <strong>4x their body weight</strong>. For a 70 lb
Retriever, that is 280 lbs of force on joints that were never built to take
it. Do that twice a day for five years and you do not get "old age" â€” you get
early arthritis, and a vet bill that makes this ramp look very cheap.</p>

<p>The <strong>PawGrip Pro Foldable Dog Car Ramp</strong> turns that impact
into a walk. A shallow, vet-approved slope means your dog steps in and out
under their own power, and your back never gets involved.</p>

<h3>Why owners switch to PawGrip Pro</h3>
<ul>
  <li><strong>PawGrip\u2122 Anti-Slip Tread</strong> â€” a proprietary textured
      surface that grips nails instead of letting them skate. The single most
      common reason dogs refuse a ramp is a slick deck, and this one is not
      slick.</li>
  <li><strong>Independently rated to 150 lbs</strong> â€” tested well past the
      rating with no frame flex. Handles Labs, Shepherds, Goldens and Mastiffs.</li>
  <li><strong>10 lbs, one-handed</strong> â€” lifts in and out of the car
      between stops. No two-person lift, no dropping it on your shin.</li>
  <li><strong>62" unfolded length</strong> â€” long enough to keep a gentle
      incline out of SUVs, trucks and vans instead of the steep ladder angle
      that short ramps force on you.</li>
  <li><strong>High side rails</strong> â€” a nervous dog cannot slide off the
      edge, which is why 94% of owners report their dog using it within 24 hours.</li>
</ul>

<h3>The math nobody tells you about</h3>
<p>A single vet visit for mobility work starts around $250. Joint supplements
run $30 a month, forever. Surgery runs four figures. This ramp costs less than
one consult, and it works on the day it arrives.</p>

<h3>What's in the box</h3>
<ul>
  <li>PawGrip Pro Foldable Dog Car Ramp (Standard, 62")</li>
  <li>Safety latch for locked, flat storage</li>
  <li>Quick-start fit card for your vehicle height</li>
  <li>100-day joint-safe guarantee card</li>
</ul>

<p><strong>Specifications</strong><br/>
Unfolded: 62" L x 16" W x 4" H &middot; Folded: 31"<br/>
Weight capacity: 150 lbs &middot; Ramp weight: 10 lbs<br/>
Surface: PawGrip\u2122 Anti-Slip Tread &middot; Side rails: yes<br/>
Feet: rubber, non-slip &middot; Made in the USA</p>
`,
  },

  /* --------------------- A. ORDER BUMP (impulse) ---------------------- */
  {
    key: 'tractionMat',
    handle: 'heavy-duty-traction-mat-upgrade-2-pack',
    title: 'Heavy-Duty Traction Mat Upgrade (2-Pack)',
    productType: 'Ramp Accessory',
    tags: ['order-bump', 'Bumps', 'accessory'],
    price: 15.0,
    compareAt: 30.0,
    cost: 4.5,
    sku: 'PGR-MAT-2PK',
    weight: 3.0,
    weightUnit: 'POUNDS',
    inventoryQuantity: 250,
    trackInventory: true,
    options: ['Pack'],
    variants: [{ option: '2-Pack', price: 15.0, compareAt: 30.0, sku: 'PGR-MAT-2PK' }],
    excerpt:
      'Replacement PawGrip\u2122 traction mats. Lock the ramp to smooth garage floors and protect your bumper from scuffs.',
    description: `
<h2>Because Your Garage Floor Is Not Your Driveway</h2>
<p>Concrete grips. Polished garage floor does not. If your ramp shifts even
an inch under a 90 lb dog, they will notice, and they will refuse it the next
time. That is exactly how a good ramp ends up unused.</p>

<p>These heavy-duty traction mats lock the ramp feet to slick surfaces and
stop the bumper scuffing that happens every time you angle the ramp in and
out. They are the same PawGrip\u2122 compound we use on the ramp deck, so they
hold up to wet pavement and road salt rather than curling at the corners.</p>

<ul>
  <li><strong>2 mats per pack</strong> â€” one spare, because they do wear out</li>
  <li>Fits all PawGrip Pro ramp feet</li>
  <li>Removes and re-sticks in seconds</li>
  <li>Weather and road-salt resistant</li>
</ul>

<p><em>This is the single highest-impact add-on for first-time ramp owners.
Most buyers report their dog's confidence jumps immediately once the ramp
stops moving.</em></p>
`,
  },

  /* ---------------- B. POST-PURCHASE / TRAVEL SAFETY ------------------ */
  {
    key: 'carTether',
    handle: 'crash-tested-adjustable-car-safety-tether',
    title: 'Crash-Tested Adjustable Car Safety Tether',
    productType: 'Car Safety',
    tags: ['post-purchase-upsell', 'Car Mobility', 'bestseller'],
    price: 19.99,
    compareAt: 35.0,
    cost: 6.0,
    sku: 'PGR-TETHER-01',
    weight: 1.0,
    weightUnit: 'POUNDS',
    inventoryQuantity: 180,
    trackInventory: true,
    options: ['Length'],
    variants: [
      { option: 'Standard', price: 19.99, compareAt: 35.0, sku: 'PGR-TETHER-STD' },
      { option: 'Long (for trucks)', price: 22.99, compareAt: 38.0, sku: 'PGR-TETHER-LNG' },
    ],
    excerpt:
      'A ramp protects the joints on the way in. A tested tether keeps them safe for the whole drive. Attaches to any harness.',
    description: `
<h2>You Fixed the Getting In. Now Fix the Drive.</h2>
<p>An untethered 70 lb dog becomes a 2,000 lb projectile in a 30 mph
collision. That is not a scare tactic â€” it is the reason crash-test standards
exist for pet restraints, and the reason a ramp alone only solves half the
problem.</p>

<p>The <strong>PawGrip Crash-Tested Tether</strong> clips to any standard
harness and anchors to your seatbelt. The webbing is load-rated well above the
working limit, and the adjustment keeps enough slack to sit and lie down
without letting them roam the cabin.</p>

<ul>
  <li>Attaches to any harness with a rear clip</li>
  <li>Adjustable length â€” sit, stand or lie down comfortably</li>
  <li>Load-rated webbing, not elastic bungee cord</li>
  <li>Fits every vehicle, front or rear seat</li>
</ul>

<p><strong>Frequently added together:</strong> owners buying the ramp add this
on the same order more often than any other accessory.</p>
`,
  },

  /* ------------------ C. AT-HOME MOBILITY UPSell ---------------------- */
  {
    key: 'bedSteps',
    handle: 'orthopedic-foam-bed-steps',
    title: 'Orthopedic Foam Bed Steps (For Small & Senior Dogs)',
    productType: 'Pet Steps',
    tags: ['post-purchase-upsell', 'Home Mobility'],
    price: 65.0,
    compareAt: 99.0,
    cost: 26.0,
    sku: 'PGR-STEPS-FOAM',
    weight: 9.0,
    weightUnit: 'POUNDS',
    inventoryQuantity: 60,
    trackInventory: true,
    options: ['Size'],
    variants: [
      { option: 'Small (2-step)', price: 55.0, compareAt: 85.0, sku: 'GR-STEPS-SM' },
      { option: 'Large (4-step)', price: 65.0, compareAt: 99.0, sku: 'PGR-STEPS-LG' },
    ],
    excerpt:
      'High-density orthopedic foam steps for the couch and the bed. Same joint-saving logic, now for the 6 inches inside your house.',
    description: `
<h2>The Car Was Never the Only Problem</h2>
<p>Most owners buy a ramp for the SUV, then realise their dog has been
struggling with the couch for two years. Same physics, same joint damage,
just a shorter drop â€” repeated hundreds more times a day.</p>

<p>Our <strong>Orthopedic Foam Bed Steps</strong> use the same 4x body-weight
logic as the ramp. Four shallow steps instead of one launch, on
high-density foam that supports senior joints and does not collapse like
cheap hollow plastic stairs.</p>

<ul>
  <li>High-density orthopedic foam core</li>
  <li>Washable, non-slip cover</li>
  <li>Holds up to 80 lbs without compressing</li>
  <li>Light enough to move between rooms</li>
</ul>

<p><strong>Who this is for:</strong> Corgis, Dachshunds and Frenchies with
long backs and short legs, plus any senior dog that has started hesitating
before the jump.</p>
`,
  },

  /* -------------- D. JOINT HEALTH CONSUMABLE (recurs) ----------------- */
  {
    key: 'jointChews',
    handle: 'advanced-hip-joint-soft-chews',
    title: 'Advanced Hip & Joint Soft Chews (Vet Formulated)',
    productType: 'Supplement',
    tags: ['post-purchase-upsell', 'Joint Care', 'subscription-eligible'],
    price: 29.99,
    compareAt: 45.0,
    cost: 9.0,
    sku: 'PGR-JOINT-90',
    weight: 1.2,
    weightUnit: 'POUNDS',
    inventoryQuantity: 400,
    trackInventory: true,
    options: ['Supply'],
    variants: [
      { option: '90-Day Supply', price: 29.99, compareAt: 45.0, sku: 'PGR-JOINT-90' },
      { option: '30-Day Trial', price: 14.99, compareAt: 22.0, sku: 'PGR-JOINT-30' },
    ],
    excerpt:
      'Vet-formulated glucosamine, chondroitin and MSM soft chews. The daily half of a complete joint-care routine.',
    description: `
<h2>A Ramp Reduces the Damage. It Does Not Reverse It.</h2>
<p>Joint wear already happened does not fix itself. Once a dog is limping or
stiff in the morning, you need two things working together: <strong>less
load</strong> (the ramp, the steps, no jumping) and <strong>daily
support</strong> (supplementation).</p>

<p><strong>Advanced Hip &amp; Joint Soft Chews</strong> are formulated with
veterinarians around the trio that actually has evidence behind it â€”
glucosamine, chondroitin and MSM â€” in a soft chew dogs treat as a treat, not
a pill fight.</p>

<ul>
  <li>Vet-formulated, made in the USA</li>
  <li>Glucosamine + chondroitin + MSM</li>
  <li>Soft chew â€” no pilling, no hiding it in cheese</li>
  <li>Available on Subscribe &amp; Save so it never runs out</li>
</ul>

<p><strong>Why Subscribe &amp; Save matters here:</strong> joint supplements
only work if they are taken daily. Most owners stop by week six, then wonder
why the difference faded. A recurring order removes that decision.</p>
`,
  },
];

/* Collections â€” 'Bumps' is intentionally hidden from the storefront. */
const COLLECTIONS = [
  { key: 'carMobility', title: 'Car Mobility', handle: 'car-mobility', description: 'Everything for a safer, calmer car ride â€” ramps, tethers and traction.' },
  { key: 'homeMobility', title: 'Home Mobility', handle: 'home-mobility', description: 'Joint-saving solutions for the couch, the bed and the stairs.' },
  { key: 'jointCare', title: 'Joint Care', handle: 'joint-care', description: 'Daily support for hips and joints, formulated with veterinarians.' },
  { key: 'bumps', title: 'Bumps', handle: 'bumps', description: 'Internal: order-bump and upsell products. Not shown to customers.', hidden: true },
];

/** Which products belong in which collection. */
const COLLECTION_MEMBERSHIP = {
  carMobility: ['heroRamp', 'carTether'],
  homeMobility: ['bedSteps'],
  jointCare: ['jointChews'],
  bumps: ['tractionMat'],
};

/* -------------------------------------------------------------------------- */
/* Seeding steps                                                               */
/* -------------------------------------------------------------------------- */

const manifest = { createdAt: new Date().toISOString(), shop: SHOP_DOMAIN, products: {}, collections: {} };

/**
 * Prior run's manifest, if any.
 *
 * This is the seeder's idempotency mechanism. The Admin app in use does not
 * have read_products, so the schema cannot be queried for existing products.
 * Instead we remember the IDs we created last time: a product already in the
 * manifest is UPDATED rather than created, and its variants are not rebuilt,
 * so re-running never duplicates products or variants.
 */
let PRIOR = {};
try {
  PRIOR = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
} catch {
  PRIOR = {};
}

async function seedProducts() {
  log('\n── Products ─────────────────────────────────────────────');
  for (const item of CATALOG) {
    const prior = PRIOR.products?.[item.key];
    // Manifest takes priority: it is authoritative for IDs we created ourselves
    const existing = prior?.id
      ? { id: prior.id, title: item.title, handle: item.handle, status: 'ACTIVE' }
      : DRY_RUN
        ? null
        : await findProductByHandle(item.handle);

    if (VERIFY_ONLY) {
      log(`  ${existing ? 'âœ“' : 'Â·'} ${item.handle}${existing ? `  (${existing.title})` : '  â€” not created yet'}`);
      manifest.products[item.key] = { handle: item.handle, exists: Boolean(existing), id: existing?.id ?? null };
      continue;
    }

    /**
     * Admin API 2025-10 split product creation into two steps:
     *
     *   1. productCreate(product: ProductCreateInput!, media: [...])
     *      — ProductCreateInput has NO `options` or `variants` fields. It does
     *        have `productOptions: [OptionCreateInput!]`, each shaped
     *        { name, position?, values: [{ name }] }.
     *   2. productVariantsBulkCreate(productId, variants: [ProductVariantsBulkInput!]!, strategy)
     *      — carries price, compareAtPrice, inventoryItem (sku/cost/tracked),
     *        inventoryQuantities and the optionValues that link to the options.
     *
     * Using the old `ProductInput` with `options`/`variants` fails with
     * "Field is not defined on ProductInput".
     */
    const productInput = {
      handle: item.handle,
      title: item.title,
      descriptionHtml: item.description,
      productType: item.productType,
      tags: item.tags,
      vendor: 'PawGrip Pro',
      status: 'ACTIVE',
      productOptions: [
        {
          name: item.options[0],
          values: item.variants.map((v) => ({ name: v.option })),
        },
      ],
    };

    if (DRY_RUN) {
      log(`  (dry-run) would ${existing ? 'update' : 'create'}: ${item.handle}  $${item.price} / $${item.compareAt}`);
      continue;
    }

    if (existing) {
      const data = await gql(
        `mutation productUpdate($product: ProductUpdateInput!) {
           productUpdate(product: $product) {
             product { id title handle }
             userErrors { field message }
           }
         }`,
        {
          product: {
            id: existing.id,
            title: item.title,
            descriptionHtml: item.description,
            productType: item.productType,
            tags: item.tags,
            status: 'ACTIVE',
          },
        }
      );
      const errs = data.productUpdate.userErrors;
      if (errs?.length) {
        warn(`update failed for ${item.handle}: ${errs.map((e) => e.message).join(', ')}`);
      } else {
        ok(`updated ${item.handle}`);
      }
      manifest.products[item.key] = {
        handle: item.handle,
        exists: true,
        id: existing.id,
        updated: true,
        variantsCreated: prior?.variantsCreated === true,
        variantCount: prior?.variantCount ?? null,
      };
    } else {
      // STEP 1 — create the product with its options.
      // The argument is `product`; `input` is a deprecated alias typed as the
      // older ProductInput, which lacks productOptions.
      const data = await gql(
        `mutation productCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
           productCreate(product: $product, media: $media) {
             product { id title handle }
             userErrors { field message }
           }
         }`,
        { product: productInput }
      );

      const errs = data.productCreate.userErrors;
      if (errs?.length) {
        warn(`create failed for ${item.handle}:`);
        errs.forEach((e) => warn(`    ${e.field?.join('.') || 'product'}: ${e.message}`));
        manifest.products[item.key] = { handle: item.handle, exists: false, error: errs.map((e) => e.message).join(', ') };
        continue;
      }

      const created = data.productCreate.product;
      ok(`created ${created.handle} — ${created.title}`);

      // STEP 2 — bulk-create the variants (price, stock, sku, cost).
      // Skipped when the manifest records variants from a previous run, so a
      // re-run updates the product without appending a second set of variants.
      if (prior?.variantsCreated) {
        ok(`  variants already provisioned by an earlier run — skipping (${prior.variantCount ?? '?'} on record)`);
        manifest.products[item.key] = {
          handle: item.handle,
          exists: true,
          id: created.id,
          price: item.price,
          stock: item.inventoryQuantity,
          variantsCreated: true,
          variantCount: prior.variantCount,
        };
        continue;
      }

      let createdVariantCount = 0;
      try {
        const variantRes = await gql(
          `mutation productVariantsBulkCreate(
             $productId: ID!,
             $variants: [ProductVariantsBulkInput!]!,
             $strategy: ProductVariantsBulkCreateStrategy
           ) {
             productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: $strategy) {
               productVariants { id sku price compareAtPrice }
               userErrors { field message code }
             }
           }`,
          {
            productId: created.id,
            strategy: 'REMOVE_STANDALONE_VARIANT',
            variants: item.variants.map((v) => ({
              optionValues: [{ optionName: item.options[0], name: v.option }],
              price: String(v.price),
              compareAtPrice: String(v.compareAt),
              inventoryPolicy: 'DENY',
              // InventoryLevelInput takes availableQuantity + locationId.
              // Passing `available` here fails with "Field is not defined".
              ...(item.trackInventory && LOCATION_ID
                ? { inventoryQuantities: [{ availableQuantity: item.inventoryQuantity, locationId: LOCATION_ID }] }
                : {}),
              barcode: item.barcode || undefined,
              inventoryItem: {
                cost: String(item.cost),
                tracked: item.trackInventory,
                sku: v.sku,
                measurement: { weight: { value: item.weight, unit: item.weightUnit } },
              },
            })),
          }
        );

        const verrs = variantRes.productVariantsBulkCreate?.userErrors;
        if (verrs?.length) {
          warn(`  variant create returned errors:`);
          verrs.forEach((e) => warn(`    ${e.field?.join('.') || 'variants'}: ${e.message}`));
        } else {
          const n = variantRes.productVariantsBulkCreate?.productVariants?.length ?? 0;
          ok(`  added ${n} variant(s) with stock ${item.inventoryQuantity}`);
          createdVariantCount = n;
        }
      } catch (err) {
        warn(`  variant creation failed: ${err.message}`);
        warn('  The product exists but has no priced variants — add them in Admin.');
      }

      manifest.products[item.key] = {
        handle: item.handle,
        exists: true,
        id: created.id,
        price: item.price,
        stock: item.inventoryQuantity,
        variantsCreated: createdVariantCount > 0,
        variantCount: createdVariantCount,
      };
    }
  }
}

/**
 * Publish every created product to the Online Store sales channel.
 *
 * This step is essential: a product that is not published to the Online Store
 * channel is invisible to the Storefront API, so the React storefront would
 * never see it even though it exists in Admin.
 */
async function publishToOnlineStore() {
  log('\n── Publish to sales channels ───────────────────────────');

  if (DRY_RUN) {
    log('  (dry-run) would publish all products to every sales channel');
    return;
  }
  if (VERIFY_ONLY) {
    log('  (verify-only) skipping publication');
    return;
  }

  // Resolve every publication (channel) on the store
  const data = await gql(
    `query { publications(first: 10) { edges { node { id name } } } }`
  );
  const allPublications = data.publications.edges.map((e) => e.node);

  if (allPublications.length === 0) {
    warn('No publications found. Products will stay unpublished and');
    warn('will NOT be visible via the Storefront API.');
    return;
  }

  const ids = Object.values(manifest.products)
    .filter((p) => p.id)
    .map((p) => p.id);

  if (ids.length === 0) {
    warn('No product ids to publish.');
    return;
  }

  /**
   * Publish to EVERY publication, not just "Online Store".
   *
   * Stores with a Headless/Hydrogen channel (e.g. "Vynils Galore Headless")
   * have a separate publication. The Storefront API token issued to that
   * channel's app only indexes products published to that channel, so a
   * product published to "Online Store" alone is invisible to the headless
   * storefront even though it exists and is ACTIVE.
   */
  let published = 0;
  let failed = 0;

  for (const publication of allPublications) {
    for (const productId of ids) {
      try {
        const res = await gql(
          `mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
             publishablePublish(id: $id, input: $input) {
               publishable { ... on Product { id title } }
               userErrors { field message }
             }
           }`,
          {
            id: productId,
            input: [
              {
                publicationId: publication.id,
                publishDate: new Date().toISOString(),
              },
            ],
          }
        );

        const errs = res.publishablePublish?.userErrors;
        if (errs?.length) {
          failed += 1;
          warn(`publish warning (${publication.name}): ${errs.map((e) => e.message).join(', ')}`);
        } else {
          published += 1;
        }
      } catch (err) {
        failed += 1;
        warn(`publish failed (${publication.name}) for ${productId}: ${err.message}`);
      }
    }
    ok(`"${publication.name}" publication resolved (id ${publication.id})`);
  }

  if (published) ok(`published ${published} product/channel pairs.`);
  if (failed) warn(`${failed} pairs could not be auto-published — set their sales channel manually in Admin.`);
}

/**
 * Collections are cosmetic organisation in the Admin.
 *
 * The React storefront does NOT depend on them â€” it maps products by handle
 * and tag (see src/lib/offers.ts), so a store with no collections still works
 * end to end. Because of that, a missing read/write_collections scope is
 * treated as a soft failure: the seeder warns and carries on rather than
 * aborting the catalog you actually need.
 */
async function seedCollections() {
  log('\nâ”€â”€ Collections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€');

  // Probe permissions once with a harmless read before attempting writes
  if (!DRY_RUN && !VERIFY_ONLY) {
    try {
      await gql(`query { collections(first: 1) { edges { node { id } } } }`);
    } catch (err) {
      if (/access denied|not authorized|scope/i.test(err.message)) {
        warn('Collections scopes not granted â€” skipping collections.');
        warn('Products, stock and tags are still created normally.');
        warn('The storefront reads handles + tags, so nothing breaks.');
        warn('To enable later: add read_collections + write_collections, release a');
        warn('new app version, then re-run `npm run shopify:seed`.');
        return;
      }
      // Any other error (network, rate limit) is worth surfacing but not fatal
      warn(`Collections probe failed: ${err.message}`);
      warn('Continuing without collections.');
      return;
    }
  }

  for (const col of COLLECTIONS) {
    const existing = DRY_RUN ? null : await findCollectionByHandle(col.handle);

    if (VERIFY_ONLY) {
      log(`  ${existing ? 'âœ“' : 'Â·'} ${col.handle}${existing ? `  (${existing.title})` : '  â€” not created yet'}`);
      manifest.collections[col.key] = { handle: col.handle, exists: Boolean(existing), id: existing?.id ?? null };
      continue;
    }
    if (DRY_RUN) {
      log(`  (dry-run) would ${existing ? 'update' : 'create'} collection: ${col.handle}`);
      continue;
    }

    if (existing) {
      manifest.collections[col.key] = { handle: col.handle, id: existing.id, exists: true, updated: true };
      ok(`collection exists: ${col.handle}`);
    } else {
      let data;
      try {
        data = await gql(
          `mutation collectionCreate($input: CollectionInput!) {
             collectionCreate(input: $input) {
               collection { id title handle }
               userErrors { field message }
             }
           }`,
          {
            input: {
              title: col.title,
              handle: col.handle,
              descriptionHtml: col.hidden
                ? col.description
                : `<p>${col.description}</p>`,
            },
          }
        );
      } catch (err) {
        // A scope error here means the probe gave a false positive â€” stop and warn
        if (/access denied|not authorized|scope/i.test(err.message)) {
          warn(`Cannot create collections (${err.message.slice(0, 80)}). Skipping.`);
          return;
        }
        warn(`collection ${col.handle} failed: ${err.message}`);
        continue;
      }

      const errs = data.collectionCreate.userErrors;
      if (errs?.length) {
        warn(`collection ${col.handle} failed: ${errs.map((e) => e.message).join(', ')}`);
        continue;
      }
      ok(`created collection: ${data.collectionCreate.collection.handle}`);
      manifest.collections[col.key] = {
        handle: col.handle,
        id: data.collectionCreate.collection.id,
        exists: true,
      };
    }
  }

  // Populate membership
  if (!DRY_RUN && !VERIFY_ONLY) {
    log('\nâ”€â”€ Collection membership â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€');
    for (const [colKey, productKeys] of Object.entries(COLLECTION_MEMBERSHIP)) {
      const col = manifest.collections[colKey];
      if (!col?.id) continue;

      for (const pKey of productKeys) {
        const product = manifest.products[pKey];
        if (!product?.id) continue;

        try {
          const data = await gql(
            `mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
               collectionAddProducts(id: $id, productIds: $productIds) {
                 userErrors { field message }
                 collection { id title }
               }
             }`,
            { id: col.id, productIds: [product.id] }
          );
          const errs = data.collectionAddProducts?.userErrors?.length;
          ok(`${col.handle} <- ${product.handle}${errs ? ' (warnings)' : ''}`);
        } catch (err) {
          warn(`${col.handle} <- ${product.handle}: ${err.message}`);
        }
      }
    }
  }
}

async function verify() {
  log(`\nâ”€â”€ Verifying store: ${SHOP_DOMAIN} â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€`);
  try {
    const data = await gql(
      `query {
         products(first: 50) {
           edges { node { id title handle status tags
             variants(first: 10) { edges { node { id sku price compareAtPrice } } }
             totalInventory
           } }
         }
       }`
    );

    let matched = 0;
    for (const item of CATALOG) {
      const found = data.products.edges
        .map((e) => e.node)
        .find((p) => p.handle === item.handle);
      if (found) {
        matched += 1;
        const v = found.variants.edges[0]?.node;
        log(`  âœ“ ${found.handle}`);
        log(`      status: ${found.status}  stock: ${found.totalInventory ?? 'n/a'}`);
        log(`      price:  $${v?.price ?? '?'}  compare-at: $${v?.compareAtPrice ?? '?'}`);
        log(`      tags:   ${found.tags?.join(', ') || '(none)'}`);
      } else {
        log(`  Â· ${item.handle} â€” not found`);
      }
    }

    log(`\n  ${matched}/${CATALOG.length} catalog products present.`);
    const unlisted = data.products.edges
      .map((e) => e.node)
      .filter((p) => !CATALOG.some((c) => c.handle === p.handle));
    if (unlisted.length) {
      log(`  Other products in this store (not part of the ramp catalog):`);
      unlisted.forEach((p) => log(`    - ${p.title} (${p.handle})`));
      log('  NOTE: demo/default products should be deleted before running PMax so');
      log('        Google Merchant Center does not flag unrelated inventory.');
    }
  } catch (err) {
    warn(`Verification failed: ${err.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* Purge â€” remove products that are not part of this catalog                   */
/* -------------------------------------------------------------------------- */

/**
 * Deletes every product that is not part of the PawGrip catalog.
 *
 * Use this once, on a store seeded with Shopify's default demo products
 * (snowboards, gift cards, etc.). Unrelated inventory causes Google Merchant
 * Center disapproval for PMax / Shopping campaigns.
 *
 * Guarded: requires --purge AND --yes together, and prints exactly what it is
 * about to delete before doing it.
 */
async function purgeForeignProducts() {
  log('\nâ”€â”€ Purge non-catalog products â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€');

  const data = await gql(
    `query($after: String) {
       products(first: 100, after: $after) {
         edges { node { id title handle } }
         pageInfo { hasNextPage endCursor }
       }
     }`
  );

  const all = data.products.edges.map((e) => e.node);
  const catalogHandles = new Set(CATALOG.map((c) => c.handle));
  // The default Shopify gift-card product is not deletable through the API and
  // is ignored by Google Shopping, so it is left alone.
  const targets = all.filter((p) => !catalogHandles.has(p.handle) && p.handle !== 'gift-card');
  const skipped = all.filter((p) => catalogHandles.has(p.handle) || p.handle === 'gift-card');

  if (targets.length === 0) {
    ok('Nothing to purge â€” every product belongs to the catalog.');
    return;
  }

  log(`  Will DELETE ${targets.length} product(s):`);
  targets.forEach((p) => log(`    - ${p.title}   (${p.handle})`));
  if (skipped.length) {
    log(`  Keeping ${skipped.length} catalog product(s):`);
    skipped.forEach((p) => log(`    + ${p.handle}`));
  }

  if (!CONFIRM) {
    warn('\n  Re-run with BOTH flags to actually delete:');
    warn('      npm run shopify:seed -- --purge --yes');
    warn('  Nothing was deleted on this run.');
    return;
  }

  let deleted = 0;
  let failed = 0;
  for (const p of targets) {
    try {
      await gql(
        `mutation productDelete($id: ID!) {
           productDelete(input: { id: $id }) {
             deletedProductId
             userErrors { field message }
           }
         }`,
        { id: p.id }
      );
      deleted += 1;
      ok(`deleted ${p.handle}`);
    } catch (err) {
      failed += 1;
      warn(`could not delete ${p.handle}: ${err.message}`);
    }
  }

  log(`\n  Deleted ${deleted} product(s)${failed ? `, ${failed} failed` : ''}.`);
  if (failed) warn('Delete the remaining ones manually in Admin -> Products.');
}

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

async function main() {
  log('\n======================================================');
  log('  PawGrip Pro â€” Shopify catalog seeder');
  log('======================================================');
  log(`  Shop:      ${SHOP_DOMAIN}`);
  log(`  API:       Admin API ${API_VERSION}`);
  log(`  Mode:      ${VERIFY_ONLY ? 'VERIFY' : DRY_RUN ? 'DRY RUN' : 'LIVE â€” will create products'}`);
  log(`  Products:  ${CATALOG.length}  (1 hero + ${CATALOG.length - 1} supporting)`);

  if (DRY_RUN) {
    log('\n  Dry run â€” nothing will be created or modified.');
  }
  if (VERIFY_ONLY) {
    log('\n  Verify-only â€” will not change anything.');
    await verify();
    log('\n  Done.\n');
    return;
  }

  // Purge-only mode: clear out the dead vinyl/demo catalog, then stop
  if (PURGE) {
    await purgeForeignProducts();
    log('\n  Done.\n');
    return;
  }

  // Resolve credentials up front so scope problems surface before any writes
  if (!DRY_RUN) {
    log('\n── Authentication ─────────────────────────────────────');
    await getToken();
    if (CLIENT_ID) {
      ok('Exchanged Client ID/secret for a 24-hour Admin token.');
      reportScopes();
    } else {
      ok('Using static SHOPIFY_ADMIN_ACCESS_TOKEN.');
    }

    // Stock is credited per location, so resolve it before creating variants
    LOCATION_ID = await resolveLocation();
    if (LOCATION_ID) {
      ok(`Stock location resolved — tracked inventory will be set.`);
    } else {
      warn('No location found — inventory will not be set at create time.');
    }
  }

  await seedProducts();
  await publishToOnlineStore();
  await seedCollections();

  if (!DRY_RUN) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
    log(`\n  Manifest written to ${path.relative(ROOT, OUTPUT_FILE)}`);
  }
  log(`  API requests made: ${requestCount}`);
  log('\n  Next:');
  log('    1. Admin -> Products -> confirm "Sales channels" includes Online Store');
  log('    2. Admin -> Settings -> Locations -> confirm stock levels are tracked');
  log('    3. Replace the placeholder product images with white-background shots');
  log('       (GMC requires an image on every product for Shopping ads)');
  log('    4. npm run shopify:verify');
  log('\n  Done.\n');
}

main().catch((err) => {
  console.error(`\n  FATAL: ${err.message}\n`);
  process.exit(1);
});

