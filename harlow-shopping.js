// ============================================================
// HARLOW SHOPPING INTELLIGENCE — v2.0
// Replaces harlow-shopping.js entirely.
// 15 stores. Dynamic scoring. Future-ready live pricing layer.
// Kosher-aware. Feedback memory. No hard-coded winners.
// ============================================================

// ─────────────────────────────────────────────────────────────
// SECTION 1: STORE RULES
// These are priors — educated guesses, not facts.
// Live pricing (future) will override these when available.
// Add new stores here. Scoring engine needs no changes.
// ─────────────────────────────────────────────────────────────
const STORE_RULES = {

  walmart: {
    name: "Walmart",
    searchUrl:   t => `https://www.walmart.com/search?q=${enc(t)}`,
    deliveryUrl: t => `https://www.walmart.com/search?q=${enc(t)}&fulfillmentIntent=delivery`,
    pickupUrl:   t => `https://www.walmart.com/search?q=${enc(t)}&fulfillmentIntent=pickup`,
    // Price priors — ranges reflect real variability
    pricePrior:     { level: "low",    confidence: 0.80 },
    unitPricePrior: { level: "medium", confidence: 0.70 }, // not always cheapest per unit vs Costco
    deliverySpeed:  "same-day",
    deliveryFee:    7.95,
    freeDeliveryThreshold: 35,
    pickupAvailable: true,
    pickupFee: 0,
    membershipRequired: false,
    kosherFriendly: "partial",   // has kosher items, limited selection
    kosherCertified: false,      // store itself not kosher
    qualityLevel: "standard",    // budget / standard / premium / specialty
    freshQuality: "standard",
    organicSelection: "limited",
    inHouston: true,
    onlineOnly: false,
    membershipTiers: {
      "walmart+": { deliveryFee: 0, freeThreshold: 0, scoreBonus: 18 }
    },
    strengths: ["price", "speed", "availability", "household", "pharmacy"],
    weaknesses: ["kosher", "organic", "specialty", "fresh quality"],
    notes: "Widest availability. Often lowest headline price. Walmart+ removes delivery fee."
  },

  heb: {
    name: "H-E-B",
    searchUrl:   t => `https://www.heb.com/search/?q=${enc(t)}`,
    deliveryUrl: t => `https://www.heb.com/search/?q=${enc(t)}`,
    pickupUrl:   t => `https://www.heb.com/search/?q=${enc(t)}`,
    pricePrior:     { level: "low-medium", confidence: 0.85 },
    unitPricePrior: { level: "low-medium", confidence: 0.80 },
    deliverySpeed: "same-day",
    deliveryFee: 5.00,
    freeDeliveryThreshold: 35,
    pickupAvailable: true,
    pickupFee: 0,
    membershipRequired: false,
    kosherFriendly: "good",     // strong kosher section in Houston stores
    kosherCertified: false,
    qualityLevel: "standard-plus",
    freshQuality: "good",
    organicSelection: "moderate",
    inHouston: true,
    onlineOnly: false,
    membershipTiers: {},
    strengths: ["fresh", "price", "Houston-local", "pickup", "kosher-selection", "store-brands"],
    weaknesses: ["Texas-only", "bulk"],
    notes: "Houston's best all-around grocery. Strong kosher section. Excellent curbside pickup."
  },

  costco: {
    name: "Costco",
    searchUrl:   t => `https://www.costco.com/CatalogSearch?dept=All&keyword=${enc(t)}`,
    deliveryUrl: t => `https://www.costco.com/CatalogSearch?dept=All&keyword=${enc(t)}`,
    pickupUrl:   t => `https://www.costco.com/CatalogSearch?dept=All&keyword=${enc(t)}`,
    pricePrior:     { level: "low",  confidence: 0.75 },  // low only if buying in bulk
    unitPricePrior: { level: "very-low", confidence: 0.85 }, // best unit price for bulk
    deliverySpeed: "2-day",
    deliveryFee: 0,
    freeDeliveryThreshold: 0,
    pickupAvailable: true,
    pickupFee: 0,
    membershipRequired: true,
    membershipName: "Costco",
    kosherFriendly: "good",      // solid kosher section
    kosherCertified: false,
    qualityLevel: "standard-plus",
    freshQuality: "good",
    organicSelection: "moderate",
    inHouston: true,
    onlineOnly: false,
    membershipTiers: {
      "costco-gold":      { deliveryFee: 0, scoreBonus: 20 },
      "costco-executive": { deliveryFee: 0, scoreBonus: 28, cashback: "2%" }
    },
    strengths: ["unit-price", "bulk", "large-household", "quality", "kosher-selection", "appliances"],
    weaknesses: ["small-quantities", "delivery-speed", "requires-membership", "not-for-single-items"],
    notes: "Best unit price for large households buying in bulk. Membership required. Not worth it for 1 item."
  },

  amazon: {
    name: "Amazon",
    searchUrl:   t => `https://www.amazon.com/s?k=${enc(t)}`,
    deliveryUrl: t => `https://www.amazon.com/s?k=${enc(t)}`,
    pickupUrl:   t => `https://www.amazon.com/s?k=${enc(t)}`,
    pricePrior:     { level: "medium",  confidence: 0.60 }, // highly variable by item
    unitPricePrior: { level: "medium",  confidence: 0.55 },
    deliverySpeed: "next-day",
    deliveryFee: 0,
    freeDeliveryThreshold: 35,
    pickupAvailable: false,
    pickupFee: 0,
    membershipRequired: false,
    kosherFriendly: "good",     // huge kosher selection online
    kosherCertified: false,
    qualityLevel: "varies",
    freshQuality: "poor",       // not great for fresh groceries
    organicSelection: "good",
    inHouston: true,
    onlineOnly: true,
    membershipTiers: {
      "amazon-prime": { deliveryFee: 0, scoreBonus: 22, deliverySpeed: "next-day" }
    },
    strengths: ["variety", "speed", "kosher-packaged-goods", "hard-to-find", "non-perishables"],
    weaknesses: ["fresh-food", "price-consistency", "no-pickup"],
    notes: "Huge variety. Price varies wildly by item and seller. Best for packaged/non-perishable kosher items."
  },

  target: {
    name: "Target",
    searchUrl:   t => `https://www.target.com/s?searchTerm=${enc(t)}`,
    deliveryUrl: t => `https://www.target.com/s?searchTerm=${enc(t)}`,
    pickupUrl:   t => `https://www.target.com/s?searchTerm=${enc(t)}`,
    pricePrior:     { level: "medium",  confidence: 0.75 },
    unitPricePrior: { level: "medium",  confidence: 0.70 },
    deliverySpeed: "same-day",
    deliveryFee: 9.99,
    freeDeliveryThreshold: 35,
    pickupAvailable: true,
    pickupFee: 0,
    membershipRequired: false,
    kosherFriendly: "limited",
    kosherCertified: false,
    qualityLevel: "standard",
    freshQuality: "standard",
    organicSelection: "moderate",
    inHouston: true,
    onlineOnly: false,
    membershipTiers: {
      "target-redcard": { scoreBonus: 10, discount: "5%" },
      "shipt": { deliveryFee: 0, freeThreshold: 35, scoreBonus: 12 }
    },
    strengths: ["household", "clothing", "beauty", "pickup-speed", "store-brands"],
    weaknesses: ["kosher", "fresh-groceries", "price"],
    notes: "Good for household and clothing. Not a primary grocery destination."
  },

  instacart: {
    name: "Instacart",
    searchUrl:   t => `https://www.instacart.com/store/s?k=${enc(t)}`,
    deliveryUrl: t => `https://www.instacart.com/store/s?k=${enc(t)}`,
    pickupUrl:   t => `https://www.instacart.com/store/s?k=${enc(t)}`,
    pricePrior:     { level: "high",  confidence: 0.90 }, // markup is consistent
    unitPricePrior: { level: "high",  confidence: 0.90 },
    deliverySpeed: "same-day",
    deliveryFee: 3.99,
    freeDeliveryThreshold: 35,
    pickupAvailable: true,
    pickupFee: 0,
    membershipRequired: false,
    kosherFriendly: "varies",   // depends on which store via Instacart
    kosherCertified: false,
    qualityLevel: "varies",
    freshQuality: "varies",
    organicSelection: "varies",
    inHouston: true,
    onlineOnly: true,
    membershipTiers: {
      "instacart+": { deliveryFee: 0, freeThreshold: 35, scoreBonus: 8 }
    },
    strengths: ["speed", "convenience", "1-2-hour-delivery"],
    weaknesses: ["price", "markup", "not-for-budget"],
    notes: "10–15% markup on store prices. Only use when speed is the only priority."
  },

  samsclub: {
    name: "Sam's Club",
    searchUrl:   t => `https://www.samsclub.com/s/${enc(t)}`,
    deliveryUrl: t => `https://www.samsclub.com/s/${enc(t)}`,
    pickupUrl:   t => `https://www.samsclub.com/s/${enc(t)}`,
    pricePrior:     { level: "low",      confidence: 0.78 },
    unitPricePrior: { level: "very-low", confidence: 0.80 },
    deliverySpeed: "same-day",
    deliveryFee: 0,
    freeDeliveryThreshold: 50,
    pickupAvailable: true,
    pickupFee: 0,
    membershipRequired: true,
    membershipName: "Sam's Club",
    kosherFriendly: "limited",
    kosherCertified: false,
    qualityLevel: "standard",
    freshQuality: "standard",
    organicSelection: "limited",
    inHouston: true,
    onlineOnly: false,
    membershipTiers: {
      "samsclub-club": { deliveryFee: 8, scoreBonus: 14 },
      "samsclub-plus": { deliveryFee: 0, scoreBonus: 20 }
    },
    strengths: ["unit-price", "bulk", "large-household", "same-day-delivery"],
    weaknesses: ["kosher", "organic", "requires-membership"],
    notes: "Costco alternative. Plus membership = free same-day delivery. Slightly smaller selection."
  },

  walgreens: {
    name: "Walgreens",
    searchUrl:   t => `https://www.walgreens.com/search/results.jsp?Ntt=${enc(t)}`,
    deliveryUrl: t => `https://www.walgreens.com/search/results.jsp?Ntt=${enc(t)}`,
    pickupUrl:   t => `https://www.walgreens.com/search/results.jsp?Ntt=${enc(t)}`,
    pricePrior:     { level: "high",  confidence: 0.85 },
    unitPricePrior: { level: "high",  confidence: 0.85 },
    deliverySpeed: "same-day",
    deliveryFee: 8.99,
    freeDeliveryThreshold: 35,
    pickupAvailable: true,
    pickupFee: 0,
    membershipRequired: false,
    kosherFriendly: "limited",
    kosherCertified: false,
    qualityLevel: "standard",
    freshQuality: "poor",
    organicSelection: "minimal",
    inHouston: true,
    onlineOnly: false,
    membershipTiers: {
      "mywalgreens": { scoreBonus: 5 }
    },
    strengths: ["pharmacy", "urgent-health", "late-night", "convenience"],
    weaknesses: ["price", "groceries", "fresh", "kosher"],
    notes: "High prices. Only use for pharmacy, urgent health items, or after-hours."
  },

  kroger: {
    name: "Kroger",
    searchUrl:   t => `https://www.kroger.com/search?query=${enc(t)}`,
    deliveryUrl: t => `https://www.kroger.com/search?query=${enc(t)}&fulfillment=SHIP`,
    pickupUrl:   t => `https://www.kroger.com/search?query=${enc(t)}&fulfillment=PICKUP`,
    pricePrior:     { level: "low-medium", confidence: 0.80 },
    unitPricePrior: { level: "low-medium", confidence: 0.75 },
    deliverySpeed: "same-day",
    deliveryFee: 9.95,
    freeDeliveryThreshold: 35,
    pickupAvailable: true,
    pickupFee: 0,
    membershipRequired: false,
    kosherFriendly: "partial",
    kosherCertified: false,
    qualityLevel: "standard",
    freshQuality: "good",
    organicSelection: "moderate",
    inHouston: true,
    onlineOnly: false,
    membershipTiers: {
      "kroger-plus": { scoreBonus: 12, discount: "digital coupons" },
      "kroger-boost": { deliveryFee: 0, scoreBonus: 18 }
    },
    strengths: ["fresh", "store-brands", "digital-coupons", "pickup", "loyalty-discounts"],
    weaknesses: ["kosher", "bulk", "specialty"],
    notes: "Kroger Plus card unlocks significant sale prices. Boost membership = free delivery."
  },

  aldi: {
    name: "Aldi",
    searchUrl:   t => `https://www.aldi.us/en/search/?text=${enc(t)}`,
    deliveryUrl: t => `https://www.instacart.com/aldi/storefront_search?query=${enc(t)}`,
    pickupUrl:   t => `https://www.aldi.us/en/search/?text=${enc(t)}`,
    pricePrior:     { level: "very-low", confidence: 0.88 }, // consistently cheapest for staples
    unitPricePrior: { level: "very-low", confidence: 0.85 },
    deliverySpeed: "same-day",   // via Instacart only
    deliveryFee: 3.99,           // via Instacart
    freeDeliveryThreshold: 35,
    pickupAvailable: false,      // in-store only; no curbside
    pickupFee: 0,
    membershipRequired: false,
    kosherFriendly: "limited",   // some items, not reliable
    kosherCertified: false,
    qualityLevel: "standard",
    freshQuality: "good",        // surprisingly good for price
    organicSelection: "moderate", // "Simply Nature" line
    inHouston: true,
    onlineOnly: false,
    membershipTiers: {},
    strengths: ["price", "unit-price", "staples", "organic-value", "simplicity"],
    weaknesses: ["kosher", "variety", "no-pickup", "delivery-via-instacart-only", "limited-selection"],
    notes: "Lowest prices on staples. Limited selection by design. Delivery only via Instacart (adds markup). No curbside."
  },

  sprouts: {
    name: "Sprouts",
    searchUrl:   t => `https://www.sprouts.com/search/#q=${enc(t)}`,
    deliveryUrl: t => `https://www.sprouts.com/search/#q=${enc(t)}`,
    pickupUrl:   t => `https://www.sprouts.com/search/#q=${enc(t)}`,
    pricePrior:     { level: "medium",   confidence: 0.78 },
    unitPricePrior: { level: "medium",   confidence: 0.75 },
    deliverySpeed: "same-day",
    deliveryFee: 6.99,
    freeDeliveryThreshold: 35,
    pickupAvailable: true,
    pickupFee: 0,
    membershipRequired: false,
    kosherFriendly: "good",      // good natural/organic kosher selection
    kosherCertified: false,
    qualityLevel: "premium-natural",
    freshQuality: "very-good",
    organicSelection: "very-good",
    inHouston: true,
    onlineOnly: false,
    membershipTiers: {},
    strengths: ["organic", "natural", "fresh", "kosher-natural", "bulk-bins", "supplements"],
    weaknesses: ["price", "not-for-staples", "limited-household-items"],
    notes: "Mid-tier pricing on natural/organic. Good kosher natural selection. Not competitive on staples."
  },

  wholefoods: {
    name: "Whole Foods",
    searchUrl:   t => `https://www.wholefoodsmarket.com/search?text=${enc(t)}`,
    deliveryUrl: t => `https://www.amazon.com/s?k=${enc(t)}&i=wholefoods`,
    pickupUrl:   t => `https://www.wholefoodsmarket.com/search?text=${enc(t)}`,
    pricePrior:     { level: "high",     confidence: 0.88 },
    unitPricePrior: { level: "high",     confidence: 0.85 },
    deliverySpeed: "same-day",   // 1-hour with Prime
    deliveryFee: 0,              // free with Prime
    freeDeliveryThreshold: 35,
    pickupAvailable: true,
    pickupFee: 0,
    membershipRequired: false,
    kosherFriendly: "very-good", // strong kosher section
    kosherCertified: false,
    qualityLevel: "premium",
    freshQuality: "excellent",
    organicSelection: "excellent",
    inHouston: true,
    onlineOnly: false,
    membershipTiers: {
      "amazon-prime": { deliveryFee: 0, scoreBonus: 20, deliverySpeed: "same-day", discount: "10% off" }
    },
    strengths: ["kosher", "organic", "quality", "fresh", "specialty-diets", "prime-delivery"],
    weaknesses: ["price", "not-for-budget", "not-for-staples"],
    notes: "Premium prices. Excellent kosher and organic selection. Free 1-hr delivery with Prime."
  },

  traderjoes: {
    name: "Trader Joe's",
    searchUrl:   t => `https://www.traderjoes.com/home/search?q=${enc(t)}`,
    deliveryUrl: t => `https://www.instacart.com/trader-joes/storefront_search?query=${enc(t)}`,
    pickupUrl:   t => `https://www.traderjoes.com/home/search?q=${enc(t)}`,
    pricePrior:     { level: "low-medium", confidence: 0.82 },
    unitPricePrior: { level: "low-medium", confidence: 0.78 },
    deliverySpeed: "same-day",   // via Instacart only
    deliveryFee: 3.99,           // Instacart markup applies
    freeDeliveryThreshold: 35,
    pickupAvailable: false,      // no curbside pickup
    pickupFee: 0,
    membershipRequired: false,
    kosherFriendly: "good",      // many items are kosher certified
    kosherCertified: false,
    qualityLevel: "premium-value", // high quality at moderate price
    freshQuality: "very-good",
    organicSelection: "good",
    inHouston: true,
    onlineOnly: false,
    membershipTiers: {},
    strengths: ["value", "quality", "unique-products", "kosher-variety", "organic-value"],
    weaknesses: ["no-pickup", "delivery-via-instacart-only", "limited-staples", "no-loyalty-program"],
    notes: "Surprisingly many kosher items. Excellent value for quality. Delivery only via Instacart."
  },

  cvs: {
    name: "CVS",
    searchUrl:   t => `https://www.cvs.com/search?searchTerm=${enc(t)}`,
    deliveryUrl: t => `https://www.cvs.com/search?searchTerm=${enc(t)}`,
    pickupUrl:   t => `https://www.cvs.com/search?searchTerm=${enc(t)}`,
    pricePrior:     { level: "high",  confidence: 0.85 },
    unitPricePrior: { level: "high",  confidence: 0.85 },
    deliverySpeed: "same-day",
    deliveryFee: 8.99,
    freeDeliveryThreshold: 35,
    pickupAvailable: true,
    pickupFee: 0,
    membershipRequired: false,
    kosherFriendly: "limited",
    kosherCertified: false,
    qualityLevel: "standard",
    freshQuality: "poor",
    organicSelection: "minimal",
    inHouston: true,
    onlineOnly: false,
    membershipTiers: {
      "cvs-extracare": { scoreBonus: 8, discount: "2% back + coupons" }
    },
    strengths: ["pharmacy", "health", "beauty", "urgent", "convenient-hours"],
    weaknesses: ["price", "groceries", "kosher", "fresh"],
    notes: "Like Walgreens — use for pharmacy and health urgency only. ExtraCare card helps."
  },

  // ── HOUSTON KOSHER SUPPLIERS ─────────────────────────────────
  // These are manually maintained. Update addresses/URLs as needed.
  kosherhouston: {
    name: "Houston Kosher (Local)",
    searchUrl:   t => `https://www.google.com/search?q=kosher+${enc(t)}+Houston+TX`,
    deliveryUrl: t => `https://www.google.com/search?q=kosher+${enc(t)}+Houston+delivery`,
    pickupUrl:   t => `https://www.google.com/search?q=kosher+${enc(t)}+Houston+pickup`,
    pricePrior:     { level: "medium-high", confidence: 0.60 }, // varies by supplier
    unitPricePrior: { level: "medium-high", confidence: 0.55 },
    deliverySpeed: "varies",
    deliveryFee: 0,              // varies — many are pickup only
    freeDeliveryThreshold: 0,
    pickupAvailable: true,
    pickupFee: 0,
    membershipRequired: false,
    kosherFriendly: "certified", // the whole point
    kosherCertified: true,
    qualityLevel: "specialty",
    freshQuality: "good",
    organicSelection: "varies",
    inHouston: true,
    onlineOnly: false,
    membershipTiers: {},
    // Key Houston kosher resources (update as you learn more)
    localSuppliers: [
      { name: "Randalls (kosher section)", url: "https://www.randalls.com" },
      { name: "Houston Kosher", url: "https://www.google.com/search?q=Houston+Kosher+grocery" },
      { name: "Kolache Factory (kosher items)", url: "https://www.google.com/search?q=kosher+Houston+77071" }
    ],
    strengths: ["fully-kosher", "certified", "community", "fresh-kosher-meat", "specialty-items"],
    weaknesses: ["price", "limited-hours", "delivery-rare", "requires-research"],
    notes: "For guaranteed kosher certification. Best for meat, challah, and specialty items. Prices vary. Call ahead."
  }
};

// Convenience encoder
function enc(t) { return encodeURIComponent(t); }

// ─────────────────────────────────────────────────────────────
// SECTION 2: USER PROFILE
// Reads from localStorage. Replace with Supabase fetch if ready.
// ─────────────────────────────────────────────────────────────
function getUserProfile() {
  try {
    const s = localStorage.getItem("harlowProfile");
    if (s) return JSON.parse(s);
  } catch(e) {}
  return {
    householdSize: 5,
    zipCode: "77071",
    memberships: ["costco-executive"],
    deliveryPreference: "delivery",
    priorityPreference: "balanced",
    kosherRequired: false,       // hard filter — never show non-kosher if true
    kosherPreferred: false,      // soft signal — boost kosher-friendly stores
    qualityPreference: "standard", // budget / standard / premium
    organicPreference: false,
    dietaryRestrictions: [],
    favoriteStores: ["heb", "costco", "walmart"],
    rejectedStores: [],          // user said "never show me X again"
    pastPurchases: [],           // [{ storeKey, item, rating }]
    rejectedRecommendations: []  // [{ storeKey, item, reason }]
  };
}

function saveUserProfile(profile) {
  try { localStorage.setItem("harlowProfile", JSON.stringify(profile)); } catch(e) {}
}

// ─────────────────────────────────────────────────────────────
// SECTION 3: FEEDBACK MEMORY
// Harlow remembers when a recommendation was rejected or loved.
// ─────────────────────────────────────────────────────────────
function recordFeedback(storeKey, item, rating, reason = "") {
  const profile = getUserProfile();
  profile.pastPurchases = profile.pastPurchases || [];
  profile.rejectedRecommendations = profile.rejectedRecommendations || [];

  if (rating === "rejected") {
    profile.rejectedRecommendations.push({ storeKey, item, reason, ts: Date.now() });
  } else {
    profile.pastPurchases.push({ storeKey, item, rating, ts: Date.now() });
  }
  saveUserProfile(profile);
}

function getStoreReputation(storeKey, item, profile) {
  // Returns a score modifier based on past experience: -20 to +15
  const purchases = (profile.pastPurchases || []).filter(p => p.storeKey === storeKey);
  const rejections = (profile.rejectedRecommendations || []).filter(r => r.storeKey === storeKey);

  let modifier = 0;
  purchases.forEach(p => {
    if (p.rating === "loved")  modifier += 5;
    if (p.rating === "good")   modifier += 2;
    if (p.rating === "poor")   modifier -= 5;
  });
  rejections.forEach(() => modifier -= 8);

  // Item-specific match: if same item was bad at this store, penalize more
  const itemRejections = rejections.filter(r =>
    r.item && item && r.item.toLowerCase().includes(item.toLowerCase().split(" ")[0])
  );
  modifier -= itemRejections.length * 10;

  return Math.max(-25, Math.min(15, modifier));
}

// ─────────────────────────────────────────────────────────────
// SECTION 4: LIVE PRICING LAYER (future-ready)
// Today: returns null. Later: plug in your real API here.
// The scoring engine already handles null gracefully.
// ─────────────────────────────────────────────────────────────
async function fetchLivePrice(storeKey, searchTerm) {
  // FUTURE: replace this stub with your Kroger API, Walmart API, etc.
  // Return format: { price: 3.99, unitPrice: 0.25, unit: "oz", inStock: true, confidence: 1.0 }
  // For now, always returns null → scoring uses priors only.

  // Example of how you'd wire Kroger API later:
  // if (storeKey === "kroger" && window.KROGER_API_KEY) {
  //   const res = await fetch(`/api/kroger-price?term=${searchTerm}`);
  //   return await res.json();
  // }

  return null;
}

// Price level numeric values for comparison
const PRICE_LEVEL_SCORES = {
  "very-low":     38,
  "low":          30,
  "low-medium":   24,
  "medium":       16,
  "medium-high":  10,
  "high":          4,
  "varies":       14  // neutral — uncertainty penalty applied separately
};

const SPEED_SCORES = {
  "same-day": 28,
  "next-day": 18,
  "2-day":     8,
  "varies":    5
};

// ─────────────────────────────────────────────────────────────
// SECTION 5: CORE SCORING ENGINE
// Does NOT hard-code winners. Every signal is a weight.
// Live price overrides prior when available.
// ─────────────────────────────────────────────────────────────
function scoreStore(storeKey, store, userProfile, shoppingContext, livePrice = null) {
  const {
    needItToday    = false,
    preferDelivery = true,
    prioritize     = "balanced",
    category       = "general",
    quantity       = "normal",
    searchTerm     = ""
  } = shoppingContext;

  let score = 50; // start at neutral, not zero
  const reasons  = [];
  const warnings = [];
  const uncertainties = [];

  // ── HARD FILTERS ────────────────────────────────────────────
  // Rejected stores never appear
  if ((userProfile.rejectedStores || []).includes(storeKey)) return null;

  // Kosher hard filter — if user requires kosher, only show certified
  if (userProfile.kosherRequired && store.kosherFriendly !== "certified") {
    if (!["very-good","certified"].includes(store.kosherFriendly)) return null;
  }

  // Membership required but user doesn't have it
  if (store.membershipRequired) {
    const hasMembership = (userProfile.memberships || []).some(m =>
      m.startsWith(storeKey) || m === (store.membershipName || "").toLowerCase()
    );
    if (!hasMembership) {
      score -= 35;
      warnings.push(`Requires ${store.membershipName} membership ($65–$130/yr)`);
    }
  }

  // ── LIVE PRICE OVERRIDE ──────────────────────────────────────
  let priceScore;
  let priceConfidence;
  if (livePrice && livePrice.price) {
    // We have real data — use it with high confidence
    // (Scoring relative to other stores' live prices would be done in rankStores)
    priceScore = 30; // placeholder; rankStores normalizes across live prices
    priceConfidence = livePrice.confidence || 1.0;
    reasons.push(`Live price: $${livePrice.price.toFixed(2)}`);
  } else {
    // Use prior
    priceScore      = PRICE_LEVEL_SCORES[store.pricePrior.level] || 14;
    priceConfidence = store.pricePrior.confidence;
    if (priceConfidence < 0.70) {
      uncertainties.push(`Price estimate uncertain (confidence: ${Math.round(priceConfidence*100)}%)`);
    }
  }

  // Apply priority weight to price
  const priceWeight = prioritize === "price" ? 1.6 : prioritize === "speed" ? 0.7 : 1.0;
  score += priceScore * priceWeight;

  // ── UNIT PRICE (important for large households) ──────────────
  if (userProfile.householdSize >= 4 || quantity === "bulk") {
    const unitScore = PRICE_LEVEL_SCORES[store.unitPricePrior.level] || 14;
    score += unitScore * 0.5;
    if (store.unitPricePrior.level === "very-low") reasons.push("Best unit price for bulk");
    if (store.unitPricePrior.level === "high") warnings.push("Higher unit price — consider bulk alternatives");
  }

  // ── DELIVERY / PICKUP ────────────────────────────────────────
  if (preferDelivery) {
    const speedScore = SPEED_SCORES[store.deliverySpeed] || 5;
    const speedWeight = (prioritize === "speed" || needItToday) ? 1.8 : 1.0;
    score += speedScore * speedWeight;

    if (needItToday && store.deliverySpeed !== "same-day") {
      score -= 30;
      warnings.push("Not available today — delivery takes longer");
    }
    if (store.deliverySpeed === "same-day") reasons.push("Same-day delivery available");

    // Delivery fee
    const fee = getEffectiveDeliveryFee(storeKey, store, userProfile);
    if (fee === 0) { score += 14; reasons.push("Free delivery for you"); }
    else if (fee <= 5) { score += 4; }
    else if (fee <= 10) { score -= 8; warnings.push(`~$${fee.toFixed(2)} delivery fee`); }
    else { score -= 15; warnings.push(`High delivery fee: $${fee.toFixed(2)}`); }

    // Instacart-only delivery warning
    if (store.deliveryUrl && store.deliveryUrl("x").includes("instacart") && !store.onlineOnly) {
      warnings.push("Delivery via Instacart — prices marked up ~10–15%");
      score -= 10;
    }
  } else {
    // Pickup preference
    if (store.pickupAvailable) {
      score += 22;
      reasons.push("Free pickup available");
    } else {
      score -= 25;
      warnings.push("No pickup — delivery or in-store only");
    }
  }

  // ── MEMBERSHIP BONUSES ───────────────────────────────────────
  (userProfile.memberships || []).forEach(membershipKey => {
    const tier = store.membershipTiers && store.membershipTiers[membershipKey];
    if (tier) {
      score += (tier.scoreBonus || 0);
      if (tier.discount) reasons.push(`${membershipKey}: ${tier.discount}`);
      else if (tier.scoreBonus) reasons.push(`${membershipKey} member benefit`);
    }
  });

  // ── KOSHER SCORING ───────────────────────────────────────────
  if (userProfile.kosherRequired || userProfile.kosherPreferred) {
    const kosherScores = {
      "certified": 30,
      "very-good": 20,
      "good":      12,
      "partial":    4,
      "limited":   -5,
      "varies":     0
    };
    const ks = kosherScores[store.kosherFriendly] || -8;
    score += ks * (userProfile.kosherRequired ? 1.5 : 0.8);
    if (store.kosherCertified) reasons.push("Fully kosher certified");
    else if (store.kosherFriendly === "very-good") reasons.push("Excellent kosher selection");
    else if (store.kosherFriendly === "good") reasons.push("Good kosher section");
    else if (store.kosherFriendly === "limited") warnings.push("Limited kosher options");
  }

  // ── QUALITY PREFERENCE ───────────────────────────────────────
  const qualityMap = { "budget": "low", "standard": "standard", "premium": "premium" };
  const userQuality = qualityMap[userProfile.qualityPreference] || "standard";
  if (userQuality === "premium" && ["premium","premium-natural","premium-value"].some(q => store.qualityLevel?.includes(q))) {
    score += 12; reasons.push("Matches your quality preference");
  }
  if (userQuality === "budget" && store.pricePrior.level === "very-low") {
    score += 10; reasons.push("Budget-friendly option");
  }

  // ── ORGANIC ─────────────────────────────────────────────────
  if (userProfile.organicPreference) {
    const organicMap = { "excellent": 18, "very-good": 12, "good": 8, "moderate": 4, "limited": -4, "minimal": -8 };
    score += organicMap[store.organicSelection] || 0;
    if (store.organicSelection === "excellent") reasons.push("Excellent organic selection");
  }

  // ── HOUSEHOLD SIZE SIGNALS ───────────────────────────────────
  if (userProfile.householdSize >= 4) {
    if (["costco","samsclub"].includes(storeKey)) { score += 10; reasons.push("Great for large households"); }
    if (storeKey === "aldi") { score += 6; reasons.push("Affordable staples for big families"); }
  }
  if (userProfile.householdSize <= 2) {
    if (["costco","samsclub"].includes(storeKey)) {
      score -= 10; warnings.push("Bulk quantities may be too large for small households");
    }
  }

  // ── FAVORITE STORES ──────────────────────────────────────────
  if ((userProfile.favoriteStores || []).includes(storeKey)) {
    score += 7; reasons.push("One of your preferred stores");
  }

  // ── PAST FEEDBACK ────────────────────────────────────────────
  const reputationMod = getStoreReputation(storeKey, searchTerm, userProfile);
  if (reputationMod > 0) { score += reputationMod; reasons.push("You've liked this store before"); }
  if (reputationMod < 0) { score += reputationMod; warnings.push("You've had issues here before"); }

  // ── PRICE UNCERTAINTY DISCLAIMER ─────────────────────────────
  // Always honest about what we don't know
  if (!livePrice) {
    uncertainties.push(`Price estimate (no live data — ${Math.round(priceConfidence * 100)}% confidence)`);
  }

  return {
    storeKey,
    name:  store.name,
    score: Math.max(0, Math.round(score)),
    reasons:       reasons.slice(0, 3),
    warnings:      warnings.slice(0, 2),
    uncertainties: uncertainties.slice(0, 2),
    deliverySpeed: store.deliverySpeed,
    effectiveDeliveryFee: getEffectiveDeliveryFee(storeKey, store, userProfile),
    pickupAvailable: store.pickupAvailable,
    pricePrior:    store.pricePrior,
    unitPricePrior: store.unitPricePrior,
    kosherFriendly: store.kosherFriendly,
    livePrice,
    hasLivePrice:  !!livePrice,
    localSuppliers: store.localSuppliers || null
  };
}

function getEffectiveDeliveryFee(storeKey, store, userProfile) {
  let fee = store.deliveryFee ?? 0;
  (userProfile.memberships || []).forEach(mk => {
    const tier = store.membershipTiers && store.membershipTiers[mk];
    if (tier && tier.deliveryFee !== undefined) fee = tier.deliveryFee;
  });
  return fee;
}

// ─────────────────────────────────────────────────────────────
// SECTION 6: RANKING — WITH OPTIONAL LIVE PRICE NORMALIZATION
// ─────────────────────────────────────────────────────────────
async function rankStores(searchTerm, shoppingContext = {}) {
  const userProfile = getUserProfile();
  const context = { ...shoppingContext, searchTerm };
  const results = [];

  // Fetch live prices in parallel (all return null until you wire APIs)
  const livePricePromises = Object.keys(STORE_RULES).map(key =>
    fetchLivePrice(key, searchTerm).then(lp => ({ key, lp })).catch(() => ({ key, lp: null }))
  );
  const livePrices = await Promise.all(livePricePromises);
  const livePriceMap = Object.fromEntries(livePrices.map(({ key, lp }) => [key, lp]));

  // If multiple live prices exist, normalize them into relative scores
  const liveEntries = livePrices.filter(({ lp }) => lp && lp.price);
  if (liveEntries.length >= 2) {
    const prices = liveEntries.map(({ lp }) => lp.price);
    const minP = Math.min(...prices), maxP = Math.max(...prices);
    liveEntries.forEach(({ key, lp }) => {
      // Normalize: cheapest = 38 pts, most expensive = 4 pts
      livePriceMap[key]._normalizedScore = maxP === minP ? 21
        : Math.round(4 + 34 * (1 - (lp.price - minP) / (maxP - minP)));
    });
  }

  for (const [key, store] of Object.entries(STORE_RULES)) {
    const scored = scoreStore(key, store, userProfile, context, livePriceMap[key]);
    if (scored === null) continue; // filtered out (kosher required, rejected store, etc.)
    scored.searchUrl  = store.searchUrl(searchTerm);
    scored.deliveryUrl = store.deliveryUrl(searchTerm);
    scored.pickupUrl  = store.pickupUrl(searchTerm);
    results.push(scored);
  }

  const ranked = results.sort((a, b) => b.score - a.score);

  // Generate uncertainty narrative for top results
  ranked.forEach((r, i) => {
    if (i < 3 && !r.hasLivePrice) {
      r.uncertaintyNote = buildUncertaintyNote(r, ranked, shoppingContext);
    }
  });

  return ranked.slice(0, 6); // top 6
}

// Generates honest uncertainty language — e.g. "Walmart likely cheaper, but Costco may win on unit price"
function buildUncertaintyNote(store, allRanked, context) {
  const notes = [];
  const profile = getUserProfile();

  // Price comparison uncertainty
  const lowerPriceStore = allRanked.find(s =>
    s.storeKey !== store.storeKey &&
    PRICE_LEVEL_SCORES[s.pricePrior.level] > PRICE_LEVEL_SCORES[store.pricePrior.level] &&
    s.score > store.score - 15
  );

  if (lowerPriceStore) {
    notes.push(
      `Without live pricing, ${store.name} is estimated cheaper overall, ` +
      `but ${lowerPriceStore.name} may win on unit price for larger quantities.`
    );
  }

  // Bulk vs single unit tension
  if (profile.householdSize >= 4 && ["costco","samsclub"].some(k => k === store.storeKey)) {
    notes.push(`Unit price likely excellent, but you'll need to buy in bulk.`);
  }

  // Kosher uncertainty
  if ((profile.kosherRequired || profile.kosherPreferred) && store.kosherFriendly === "partial") {
    notes.push(`Kosher selection varies by location — verify before ordering.`);
  }

  return notes.join(" ") || null;
}

// ─────────────────────────────────────────────────────────────
// SECTION 7: CONTEXT PARSER
// Extracts urgency, delivery pref, kosher need from message
// ─────────────────────────────────────────────────────────────
function parseShoppingContext(userMessage, savedContext = {}) {
  const msg = userMessage.toLowerCase();

  const needItToday = msg.includes("today") || msg.includes("now") ||
    msg.includes("urgent") || msg.includes("asap") || msg.includes("tonight") ||
    savedContext.needItToday === true;

  const preferDelivery = msg.includes("deliver") || msg.includes("ship") ||
    msg.includes("bring") || msg.includes("door") ||
    savedContext.deliveryPreference === "delivery" ||
    (!msg.includes("pickup") && !msg.includes("pick up") && !msg.includes("in store"));

  const prioritize =
    msg.includes("cheap") || msg.includes("budget") || msg.includes("price") || msg.includes("afford") ? "price" :
    msg.includes("fast") || msg.includes("quick") || msg.includes("soon") || needItToday ? "speed" :
    savedContext.priorityPreference || "balanced";

  const kosherSignal = msg.includes("kosher") || savedContext.kosherRequired;

  const organicSignal = msg.includes("organic") || msg.includes("natural") || savedContext.organicPreference;

  const quantity = msg.includes("bulk") || msg.includes("case") || msg.includes("large") ||
    msg.includes("big pack") || msg.includes("family size") ? "bulk" : "normal";

  // Category hints — soft signals only, not final answers
  const categoryHints = [];
  const catMap = {
    groceries: ["grocery","groceries","food","produce","fruit","vegetable","meat","bread","milk","eggs","cheese"],
    pharmacy: ["medicine","pharmacy","prescription","vitamin","supplement","pill","drug","otc"],
    household: ["cleaning","detergent","paper towel","toilet paper","soap","trash","laundry"],
    electronics: ["electronic","tv","computer","phone","charger","cable","headphone"],
    fresh: ["fresh","produce","deli","bakery","challah","fish"],
    kosher: ["kosher","glatt","chalav","pas yisroel","bishul"]
  };
  for (const [cat, kws] of Object.entries(catMap)) {
    if (kws.some(k => msg.includes(k))) categoryHints.push(cat);
  }

  return {
    needItToday, preferDelivery, prioritize, quantity,
    kosherSignal, organicSignal,
    category: categoryHints[0] || "general",
    categoryHints
  };
}

function extractSearchTerm(message) {
  return message
    .replace(/where (can|do) i (buy|get|find|order|purchase)/gi, "")
    .replace(/i (need|want|am looking for|need to buy|need to get)/gi, "")
    .replace(/(cheapest|fastest|best|good|cheap|quick|organic|kosher)/gi, "")
    .replace(/(today|now|asap|urgent|delivery|pickup|deliver|ship)/gi, "")
    .replace(/[?!.]/g, "").trim();
}

// ─────────────────────────────────────────────────────────────
// SECTION 8: CARD RENDERER
// Uncertainty-honest. Shows confidence level. Feedback buttons.
// ─────────────────────────────────────────────────────────────
function renderComparisonCards(rankedStores, searchTerm) {
  return renderProductComparisonTable(rankedStores, { productName: searchTerm }, searchTerm);
}
function scoreProductMatch(store, spec) {
  let productConfidence = 70;
  const productWarnings = [];

  if (spec.size) {
    productConfidence += 8;
  } else {
    productConfidence -= 15;
    productWarnings.push("Verify size");
  }

  if (spec.fatPercentage || spec.lactoseFree || spec.organic || spec.cholovYisroel) {
    productConfidence += 8;
  } else if (spec.category === "milk") {
    productConfidence -= 12;
    productWarnings.push("Milk type not specific");
  }

  if (spec.kosherRequired || spec.kosherPreferred || spec.cholovYisroel) {
    if (store.kosherFriendly === "certified") {
      productConfidence += 15;
    } else if (["very-good", "good"].includes(store.kosherFriendly)) {
      productConfidence += 5;
      productWarnings.push("Verify hechsher");
    } else {
      productConfidence -= 15;
      productWarnings.push("Kosher uncertain");
    }
  }

  const matchScore = Math.max(0, Math.min(100, productConfidence));
  store.productMatchConfidence = matchScore;
  store.productWarnings = productWarnings;
  store.score = Math.round((store.score * 0.75) + (matchScore * 0.25));

  return store;
}

function renderProductComparisonTable(rankedStores, spec, searchTerm) {
  injectProductComparisonStyles();

  const rows = rankedStores.slice(0, 6).map((store, index) => {
    const why = [
      ...(store.reasons || []),
      store.deliverySpeed === "same-day" ? "same-day option" : "",
      store.pickupAvailable ? "pickup available" : ""
    ].filter(Boolean).slice(0, 2).join(", ");

    const warnings = [
      ...(store.warnings || []),
      ...(store.productWarnings || []),
      "No live price",
      "Verify size",
      (spec.kosherRequired || spec.kosherPreferred || spec.cholovYisroel) ? "Verify hechsher" : ""
    ].filter(Boolean).slice(0, 3).join(" · ");

    return `
      <tr>
        <td class="hpc-rank">${index + 1}</td>
        <td>
          <div class="hpc-store">${store.name}</div>
          <div class="hpc-small">${why || "Estimated match"}</div>
        </td>
        <td>
          <div>${priceLabelText(store.pricePrior?.level)}</div>
          <div class="hpc-small">Unit: ${priceLabelText(store.unitPricePrior?.level)}</div>
        </td>
        <td>
          <div>${store.deliverySpeed || "varies"}</div>
          <div class="hpc-small">${store.pickupAvailable ? "Pickup OK" : "No pickup"}</div>
        </td>
        <td>
          <div>${kosherLabelText(store.kosherFriendly)}</div>
          <div class="hpc-small">${store.productMatchConfidence || 0}% match</div>
        </td>
        <td>
          <div class="hpc-warning">${warnings}</div>
          <a class="hpc-link" href="${store.deliveryUrl || store.searchUrl}" target="_blank">Search</a>
        </td>
      </tr>
    `;
  }).join("");

  return `
    <div class="hpc-box">
      <div class="hpc-title">Product comparison: ${searchTerm}</div>
      <div class="hpc-note">
        Estimated only. No live prices. Verify size, current price, availability, and kosher certification on the store page.
      </div>

      <div class="hpc-spec">
        ${renderSpecPill("Product", spec.productName)}
        ${renderSpecPill("Brand", spec.brand)}
        ${renderSpecPill("Size", spec.size)}
        ${renderSpecPill("Type", spec.fatPercentage || (spec.lactoseFree ? "lactose-free" : "") || (spec.organic ? "organic" : ""))}
        ${renderSpecPill("Kosher", spec.cholovYisroel ? "Cholov Yisroel" : spec.kosherRequired ? "required" : spec.kosherPreferred ? "preferred" : "not specified")}
      </div>

      <div class="hpc-table-wrap">
        <table class="hpc-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Store</th>
              <th>Price</th>
              <th>Speed</th>
              <th>Kosher</th>
              <th>Check</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSpecPill(label, value) {
  if (!value) return "";
  return `<span class="hpc-pill">${label}: ${value}</span>`;
}

function priceLabelText(level) {
  const map = {
    "very-low": "Very low",
    "low": "Low",
    "low-medium": "Low-med",
    "medium": "Medium",
    "medium-high": "Med-high",
    "high": "High",
    "varies": "Varies"
  };
  return map[level] || "Estimated";
}

function kosherLabelText(level) {
  const map = {
    "certified": "Certified",
    "very-good": "Very good",
    "good": "Good",
    "partial": "Partial",
    "limited": "Limited",
    "varies": "Varies"
  };
  return map[level] || "Verify";
}
injectHarlowStyles();
  const medals = ["🥇","🥈","🥉","4️⃣","5️⃣","6️⃣"];
  const speedLabels = {
    "same-day": "🟢 Same-day", "next-day": "🟡 Next-day",
    "2-day": "🟠 2-day", "varies": "⚪ Varies"
  };
  const priceLabels = {
    "very-low": "💚💚 Very Low", "low": "💚 Low",
    "low-medium": "💛 Low-Med",  "medium": "🟡 Medium",
    "medium-high": "🟠 Med-High","high": "🔴 Higher", "varies": "❓ Varies"
  };
  const kosherLabels = {
    "certified": "✡️ Certified Kosher", "very-good": "✡️ Excellent kosher",
    "good": "✡️ Good kosher", "partial": "〰️ Some kosher",
    "limited": "⚠️ Limited kosher", "varies": "❓ Kosher varies"
  };

  const cards = rankedStores.map((store, i) => {
    const fee = store.effectiveDeliveryFee === 0
      ? "Free delivery" : `~$${store.effectiveDeliveryFee.toFixed(2)} delivery`;

    const priceLabel = priceLabels[store.pricePrior?.level] || "❓ Unknown";
    const liveBadge = store.hasLivePrice
      ? `<span class="hw-badge hw-badge--live">📡 Live price</span>`
      : `<span class="hw-badge hw-badge--prior">📊 Estimated</span>`;

    const reasonsHtml = store.reasons.map(r =>
      `<span class="hw-tag hw-tag--good">✓ ${r}</span>`).join("");
    const warningsHtml = store.warnings.map(w =>
      `<span class="hw-tag hw-tag--warn">⚠ ${w}</span>`).join("");

    const uncertaintyHtml = store.uncertaintyNote
      ? `<div class="hw-uncertainty">💭 ${store.uncertaintyNote}</div>` : "";

    const kosherHtml = store.kosherFriendly && store.kosherFriendly !== "limited"
      ? `<span class="hw-badge">${kosherLabels[store.kosherFriendly] || ""}</span>` : "";

    const localSuppliersHtml = store.localSuppliers
      ? store.localSuppliers.map(s =>
          `<a href="${s.url}" target="_blank" class="hw-btn hw-btn--local">📍 ${s.name}</a>`
        ).join("") : "";

    const pickupBadge = store.pickupAvailable ? `<span class="hw-badge">🏪 Pickup OK</span>` : "";

    return `
<div class="hw-store-card ${i === 0 ? "hw-store-card--winner" : ""}">
  <div class="hw-store-card__header">
    <span class="hw-store-card__medal">${medals[i]}</span>
    <span class="hw-store-card__name">${store.name}</span>
    ${liveBadge}
    <span class="hw-store-card__score">${store.score} pts</span>
  </div>
  <div class="hw-store-card__meta">
    <span class="hw-badge">${speedLabels[store.deliverySpeed] || store.deliverySpeed}</span>
    <span class="hw-badge">${priceLabel}</span>
    ${pickupBadge}
    <span class="hw-badge">${fee}</span>
    ${kosherHtml}
  </div>
  <div class="hw-store-card__tags">${reasonsHtml}${warningsHtml}</div>
  ${uncertaintyHtml}
  <div class="hw-store-card__links">
    <a href="${store.deliveryUrl}" target="_blank" class="hw-btn hw-btn--primary">🛒 Shop ${store.name}</a>
    ${store.pickupAvailable ? `<a href="${store.pickupUrl}" target="_blank" class="hw-btn hw-btn--secondary">🏪 Pickup</a>` : ""}
    ${localSuppliersHtml}
  </div>
  <div class="hw-feedback" data-store="${store.storeKey}" data-item="${searchTerm}">
    <span class="hw-feedback__label">Was this helpful?</span>
    <button class="hw-feedback__btn" data-rating="loved">👍 Great</button>
    <button class="hw-feedback__btn" data-rating="poor">👎 Bad rec</button>
    <button class="hw-feedback__btn" data-rating="rejected">🚫 Never show</button>
  </div>
</div>`;
  }).join("");

  return `
<div class="hw-comparison">
  <div class="hw-comparison__header">
    Comparing stores for <strong>"${searchTerm}"</strong>
    <span class="hw-comparison__note">📊 Prices estimated — no live data yet</span>
  </div>
  <div class="hw-comparison__cards">${cards}</div>
</div>`;
}

// Wire feedback buttons after injection
function attachFeedbackHandlers(container) {
  container.querySelectorAll(".hw-feedback__btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = btn.closest(".hw-feedback");
      const storeKey = panel.dataset.store;
      const item     = panel.dataset.item;
      const rating   = btn.dataset.rating;
      recordFeedback(storeKey, item, rating);
      panel.innerHTML = `<span style="color:#6b7280;font-size:0.8rem">Thanks — Harlow will remember that.</span>`;
    });
  });
}

// ─────────────────────────────────────────────────────────────
// SECTION 9: QUICK QUESTIONS UI (3 questions, tappable)
// ─────────────────────────────────────────────────────────────
function renderShoppingQuestions(onComplete) {
  injectHarlowStyles();
  const container = document.createElement("div");
  container.className = "hw-quick-questions";
  container.innerHTML = `
    <div class="hw-quick-questions__title">🛒 A few quick questions:</div>
    <div class="hw-q-group">
      <div class="hw-q-label">Do you need it today?</div>
      <button class="hw-quick-btn" data-group="urgency" data-value="true">Yes, today</button>
      <button class="hw-quick-btn" data-group="urgency" data-value="false">No rush</button>
    </div>
    <div class="hw-q-group">
      <div class="hw-q-label">Delivery or pickup?</div>
      <button class="hw-quick-btn" data-group="delivery" data-value="true">Deliver to me</button>
      <button class="hw-quick-btn" data-group="delivery" data-value="false">I'll pick it up</button>
    </div>
    <div class="hw-q-group">
      <div class="hw-q-label">What matters most?</div>
      <button class="hw-quick-btn" data-group="priority" data-value="price">Cheapest price</button>
      <button class="hw-quick-btn" data-group="priority" data-value="speed">Fastest delivery</button>
      <button class="hw-quick-btn" data-group="priority" data-value="balanced">Best overall</button>
    </div>
  `;

  const answers = { urgency: null, delivery: null, priority: null };
  container.querySelectorAll(".hw-quick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(`[data-group="${btn.dataset.group}"]`).forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      answers[btn.dataset.group] = btn.dataset.value;
      if (Object.values(answers).every(v => v !== null)) {
        setTimeout(() => {
          onComplete({
            needItToday:    answers.urgency === "true",
            preferDelivery: answers.delivery === "true",
            prioritize:     answers.priority
          });
          container.remove();
        }, 280);
      }
    });
  });
  return container;
}

// ─────────────────────────────────────────────────────────────
// SECTION 10: MAIN INTEGRATION FUNCTION
// Call this from your existing send-message handler
// ─────────────────────────────────────────────────────────────
function parseProductSpec(message, savedContext = {}) {
  const msg = message.toLowerCase();

  const spec = {
    originalMessage: message,
    productName: extractProductName(message),
    brand: extractBrand(message),
    size: extractSize(message),
    quantity: extractQuantity(message),
    variant: "",
    fatPercentage: "",
    kosherRequired: false,
    kosherPreferred: false,
    cholovYisroel: false,
    organic: false,
    lactoseFree: false,
    needItToday: false,
    preferDelivery: true,
    prioritize: "balanced",
    category: "general"
  };

  if (msg.includes("whole milk")) spec.fatPercentage = "whole";
  if (msg.includes("2%") || msg.includes("2 percent")) spec.fatPercentage = "2%";
  if (msg.includes("1%") || msg.includes("1 percent")) spec.fatPercentage = "1%";
  if (msg.includes("skim")) spec.fatPercentage = "skim";

  if (msg.includes("organic")) spec.organic = true;
  if (msg.includes("lactose")) spec.lactoseFree = true;

  if (msg.includes("cholov") || msg.includes("chalav")) {
    spec.cholovYisroel = true;
    spec.kosherRequired = true;
  }

  if (msg.includes("kosher")) {
    spec.kosherPreferred = true;
  }

  if (savedContext && savedContext.kosherRequired) {
    spec.kosherRequired = true;
  }

  spec.needItToday =
    msg.includes("today") ||
    msg.includes("now") ||
    msg.includes("asap") ||
    msg.includes("urgent") ||
    msg.includes("tonight");

  spec.preferDelivery =
    msg.includes("delivery") ||
    msg.includes("deliver") ||
    msg.includes("ship") ||
    savedContext.deliveryPreference === "delivery";

  if (msg.includes("pickup") || msg.includes("pick up")) {
    spec.preferDelivery = false;
  }

  spec.prioritize =
    msg.includes("cheap") || msg.includes("cheapest") || msg.includes("price") || msg.includes("budget")
      ? "price"
      : msg.includes("fast") || msg.includes("quick") || spec.needItToday
        ? "speed"
        : savedContext.priorityPreference || "balanced";

  if (spec.productName.includes("milk")) {
    spec.category = "milk";
  } else if (
    spec.productName.includes("diaper") ||
    spec.productName.includes("wipe")
  ) {
    spec.category = "baby";
  } else if (
    spec.productName.includes("paper towel") ||
    spec.productName.includes("toilet paper") ||
    spec.productName.includes("detergent")
  ) {
    spec.category = "household";
  } else if (
    spec.productName.includes("chicken") ||
    spec.productName.includes("meat") ||
    spec.productName.includes("beef")
  ) {
    spec.category = "kosher-meat";
    spec.kosherRequired = true;
  }

  return spec;
}

function extractProductName(message) {
  let cleaned = message.toLowerCase();

  cleaned = cleaned
    .replace(/compare prices for/g, "")
    .replace(/compare price for/g, "")
    .replace(/compare/g, "")
    .replace(/where can i buy/g, "")
    .replace(/where do i get/g, "")
    .replace(/where can i get/g, "")
    .replace(/i need to buy/g, "")
    .replace(/i need to get/g, "")
    .replace(/i need/g, "")
    .replace(/buy/g, "")
    .replace(/order/g, "")
    .replace(/delivery today/g, "")
    .replace(/deliver today/g, "")
    .replace(/delivery/g, "")
    .replace(/pickup/g, "")
    .replace(/today/g, "")
    .replace(/cheapest/g, "")
    .replace(/cheap/g, "")
    .replace(/fastest/g, "")
    .replace(/kosher/g, "")
    .replace(/organic/g, "")
    .replace(/cholov yisroel/g, "")
    .replace(/chalav yisrael/g, "")
    .replace(/whole/g, "")
    .replace(/2%/g, "")
    .replace(/1%/g, "")
    .replace(/skim/g, "")
    .replace(/gallon/g, "")
    .replace(/half gallon/g, "")
    .replace(/half-gallon/g, "")
    .replace(/[?!.]/g, "")
    .trim();

  return cleaned || "milk";
}

function extractSize(message) {
  const msg = message.toLowerCase();

  if (msg.includes("half gallon") || msg.includes("half-gallon")) return "half gallon";
  if (msg.includes("gallon")) return "gallon";
  if (msg.includes("quart")) return "quart";
  if (msg.includes("case")) return "case";
  if (msg.includes("2-pack") || msg.includes("two pack")) return "2-pack";
  if (msg.includes("bulk") || msg.includes("family size")) return "bulk/family size";

  const oz = msg.match(/(\d+)\s?oz/);
  if (oz) return `${oz[1]} oz`;

  return "";
}

function extractQuantity(message) {
  const msg = message.toLowerCase();

  const pack = msg.match(/(\d+)[-\s]?pack/);
  if (pack) return `${pack[1]} pack`;

  const count = msg.match(/(\d+)\s?(bottles|gallons|boxes|bags|cases)/);
  if (count) return `${count[1]} ${count[2]}`;

  if (msg.includes("bulk")) return "bulk";

  return "";
}

function extractBrand(message) {
  const knownBrands = [
    "fairlife", "horizon", "lactaid", "great value", "heb",
    "kirkland", "organic valley", "trader joe", "365",
    "stremicks", "liebers", "mehadrin", "golden flow"
  ];

  const msg = message.toLowerCase();
  return knownBrands.find(b => msg.includes(b)) || "";
}

function getMissingProductDetails(spec) {
  const missing = [];

  if (!spec.productName) {
    missing.push("product");
  }

  if (spec.category === "milk") {
    if (!spec.fatPercentage && !spec.lactoseFree && !spec.cholovYisroel) {
      missing.push("milk-type");
    }

    if (!spec.size) {
      missing.push("size");
    }

    if (!spec.kosherRequired && !spec.kosherPreferred && !spec.cholovYisroel) {
      missing.push("kosher-level");
    }
  }

  return missing;
}

function buildProductSearchTerm(spec) {
  const parts = [];

  if (spec.cholovYisroel) {
    parts.push("Cholov Yisroel");
  } else if (spec.kosherRequired || spec.kosherPreferred) {
    parts.push("kosher");
  }

  if (spec.organic) parts.push("organic");
  if (spec.lactoseFree) parts.push("lactose free");
  if (spec.brand) parts.push(spec.brand);
  if (spec.fatPercentage) parts.push(spec.fatPercentage);

  parts.push(spec.productName);

  if (spec.size) parts.push(spec.size);
  if (spec.quantity) parts.push(spec.quantity);

  return parts
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
function renderProductClarifier(spec, missing, originalMessage) {
  const groups = [];

  if (missing.includes("milk-type")) {
    groups.push(`
      <div class="hpc-q">
        <div class="hpc-q-title">What kind of milk should I compare?</div>
        <button onclick="send('${escapeForSend(originalMessage)} whole milk')">Whole</button>
        <button onclick="send('${escapeForSend(originalMessage)} 2% milk')">2%</button>
        <button onclick="send('${escapeForSend(originalMessage)} 1% milk')">1%</button>
        <button onclick="send('${escapeForSend(originalMessage)} skim milk')">Skim</button>
        <button onclick="send('${escapeForSend(originalMessage)} lactose free milk')">Lactose-free</button>
        <button onclick="send('${escapeForSend(originalMessage)} Cholov Yisroel milk')">Cholov Yisroel</button>
      </div>
    `);
  }

  if (missing.includes("size")) {
    groups.push(`
      <div class="hpc-q">
        <div class="hpc-q-title">What size?</div>
        <button onclick="send('${escapeForSend(originalMessage)} gallon')">Gallon</button>
        <button onclick="send('${escapeForSend(originalMessage)} half gallon')">Half gallon</button>
        <button onclick="send('${escapeForSend(originalMessage)} 2-pack')">2-pack</button>
        <button onclick="send('${escapeForSend(originalMessage)} bulk family size')">Bulk/family size</button>
      </div>
    `);
  }

  if (missing.includes("kosher-level")) {
    groups.push(`
      <div class="hpc-q">
        <div class="hpc-q-title">Kosher status?</div>
        <button onclick="send('${escapeForSend(originalMessage)} kosher preferred')">Kosher preferred</button>
        <button onclick="send('${escapeForSend(originalMessage)} kosher required')">Kosher required</button>
        <button onclick="send('${escapeForSend(originalMessage)} Cholov Yisroel')">Cholov Yisroel</button>
        <button onclick="send('${escapeForSend(originalMessage)} no kosher requirement')">Not needed</button>
      </div>
    `);
  }

  return `
    <div class="hpc-box">
      <div class="hpc-title">I need a little more detail before comparing.</div>
      <div class="hpc-note">
        I don’t want to compare random products. I need the same size/type across stores.
      </div>
      ${groups.join("")}
    </div>
  `;
}

function escapeForSend(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, " ");
}
async function handleShoppingRequest(userMessage, chatContext = {}) {
  injectHarlowStyles();
  injectProductComparisonStyles();

  const triggers = [
    "buy", "order", "purchase", "find", "where can i get",
    "price of", "compare", "cheapest", "deliver", "ship",
    "pickup", "need to get", "looking for", "shop for",
    "price check", "kosher", "where do i get"
  ];

  const msg = userMessage.toLowerCase();
  if (!triggers.some(t => msg.includes(t))) return null;

  const spec = parseProductSpec(userMessage, chatContext);
  const missing = getMissingProductDetails(spec);

  if (missing.length > 0) {
    const html = renderProductClarifier(spec, missing, userMessage);
    return {
      html,
      storeLinks: "",
      ranked: [],
      searchTerm: spec.productName || "",
      context: spec,
      needsClarification: true
    };
  }

  const searchTerm = buildProductSearchTerm(spec);
  const context = {
    needItToday: spec.needItToday,
    preferDelivery: spec.preferDelivery,
    prioritize: spec.prioritize,
    quantity: spec.quantity || "normal",
    category: spec.category || "general",
    searchTerm,
    productSpec: spec
  };

  const ranked = await rankStores(searchTerm, context);
  const productRanked = ranked.map(store => scoreProductMatch(store, spec));
  const html = renderProductComparisonTable(productRanked, spec, searchTerm);
  const storeLinks = productRanked.map(s => `[STORE:${s.name}:${searchTerm}]`).join("\n");

  return {
    html,
    storeLinks,
    ranked: productRanked,
    searchTerm,
    context
  };
}

// ─────────────────────────────────────────────────────────────
// SECTION 11: CSS INJECTION
// ─────────────────────────────────────────────────────────────
function injectHarlowStyles() {
  if (document.getElementById("harlow-shopping-styles-v2")) return;
  const style = document.createElement("style");
  style.id = "harlow-shopping-styles-v2";
  style.textContent = `
    .hw-comparison { margin:12px 0; font-family:inherit; max-width:600px; }
    .hw-comparison__header { font-weight:600; margin-bottom:10px; color:#374151; font-size:0.88rem; display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
    .hw-comparison__note { font-weight:400; font-size:0.75rem; color:#9ca3af; }
    .hw-comparison__cards { display:flex; flex-direction:column; gap:10px; }
    .hw-store-card { border:1px solid #e5e7eb; border-radius:12px; padding:14px; background:#fff; }
    .hw-store-card--winner { border-color:#10b981; background:#f0fdf4; }
    .hw-store-card__header { display:flex; align-items:center; gap:8px; margin-bottom:8px; flex-wrap:wrap; }
    .hw-store-card__medal { font-size:1.1rem; }
    .hw-store-card__name { font-weight:700; font-size:0.98rem; flex:1; }
    .hw-store-card__score { font-size:0.72rem; color:#6b7280; background:#f3f4f6; padding:2px 7px; border-radius:99px; }
    .hw-store-card__meta { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px; }
    .hw-store-card__tags { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px; }
    .hw-badge { font-size:0.70rem; padding:3px 8px; border-radius:99px; background:#f3f4f6; color:#374151; white-space:nowrap; }
    .hw-badge--live { background:#d1fae5; color:#065f46; }
    .hw-badge--prior { background:#fef3c7; color:#92400e; }
    .hw-tag { font-size:0.70rem; padding:3px 8px; border-radius:6px; white-space:nowrap; }
    .hw-tag--good { background:#d1fae5; color:#065f46; }
    .hw-tag--warn { background:#fef3c7; color:#92400e; }
    .hw-uncertainty { font-size:0.75rem; color:#6b7280; font-style:italic; margin-bottom:8px; padding:6px 10px; background:#f9fafb; border-radius:8px; border-left:3px solid #d1d5db; }
    .hw-store-card__links { display:flex; gap:7px; flex-wrap:wrap; margin-bottom:8px; }
    .hw-btn { padding:6px 13px; border-radius:8px; font-size:0.80rem; font-weight:600; text-decoration:none; display:inline-block; cursor:pointer; border:none; }
    .hw-btn--primary { background:#2563eb; color:#fff; }
    .hw-btn--primary:hover { background:#1d4ed8; }
    .hw-btn--secondary { background:#f3f4f6; color:#374151; border:1px solid #d1d5db; }
    .hw-btn--local { background:#7c3aed; color:#fff; font-size:0.75rem; }
    .hw-feedback { display:flex; align-items:center; gap:7px; flex-wrap:wrap; border-top:1px solid #f3f4f6; padding-top:8px; }
    .hw-feedback__label { font-size:0.72rem; color:#9ca3af; }
    .hw-feedback__btn { background:none; border:1px solid #e5e7eb; border-radius:99px; padding:2px 10px; font-size:0.72rem; cursor:pointer; }
    .hw-feedback__btn:hover { background:#f3f4f6; }
    .hw-quick-questions { background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:14px; margin:10px 0; max-width:480px; }
    .hw-quick-questions__title { font-weight:600; font-size:0.9rem; color:#1e40af; margin-bottom:12px; }
    .hw-q-group { margin-bottom:10px; }
    .hw-q-label { font-size:0.80rem; color:#374151; font-weight:500; margin-bottom:5px; }
    .hw-quick-btn { display:inline-block; margin:3px; padding:6px 13px; background:#fff; border:1px solid #93c5fd; border-radius:99px; font-size:0.80rem; color:#1d4ed8; cursor:pointer; font-weight:500; transition:all 0.15s; }
    .hw-quick-btn:hover, .hw-quick-btn.selected { background:#2563eb; color:#fff; border-color:#2563eb; }
  `;
  document.head.appendChild(style);
}

// ─────────────────────────────────────────────────────────────
// SECTION 12: UPDATED SYSTEM PROMPT ADDITION FOR HARLOW
// Paste this into your existing Harlow system prompt string.
// ─────────────────────────────────────────────────────────────
const HARLOW_SHOPPING_SYSTEM_PROMPT_V2 = `
SHOPPING INTELLIGENCE INSTRUCTIONS (v2):

When a user asks to buy, find, compare, or get a product, do the following:

1. Ask these three questions if not already clear from context:
   - "Do you need it today, or is timing flexible?"
   - "Would you prefer delivery to your door, or can you pick it up?"
   - "What matters more — the cheapest price or getting it fastest?"

2. NEVER hard-code a winner. Always compare multiple stores and explain uncertainty:
   - "Without live pricing, Walmart is likely cheaper today, but Costco may win on unit price for a large household."
   - "H-E-B is probably your best bet here, though I can't confirm today's price."
   - "Aldi is consistently cheapest for staples, but delivery goes through Instacart which adds markup."

3. For kosher items: ALWAYS include H-E-B kosher section, Whole Foods, Amazon, Trader Joe's, and Houston Kosher local suppliers.

4. For bulk/family items (household size 4+): ALWAYS compare Costco unit price to per-unit cost at Walmart/H-E-B.

5. For urgent items: rank same-day stores first. Remind user that Instacart adds markup.

6. For organic/natural items: include Sprouts, Whole Foods, Trader Joe's, and H-E-B organic section.

7. Output store links using this EXACT format:
   [STORE:StoreName:SearchTerm]
   Example: [STORE:HEB:kosher chicken]

8. Always acknowledge what you don't know:
   - "I don't have live prices — this ranking is based on typical pricing patterns."
   - "Prices vary by location and date — verify before ordering."

9. Remember user feedback. If the user says "that was a bad recommendation," record it and don't repeat it.

10. User memberships: {{USER_MEMBERSHIPS}}
    Household size: {{HOUSEHOLD_SIZE}}
    Kosher required: {{KOSHER_REQUIRED}}
`;

// ─────────────────────────────────────────────────────────────
// HOW TO WIRE INTO YOUR EXISTING HARLOW CODE:
//
// In your send-message handler:
//
//   const result = await handleShoppingRequest(userMessage, savedContext);
//   if (result) {
//     const div = document.createElement("div");
//     div.innerHTML = result.html;
//     chatContainer.appendChild(div);
//     attachFeedbackHandlers(div);           // wire thumbs up/down
//     userMessage += "\n\nStore options:\n" + result.storeLinks;
//   }
//   // then continue with your normal Anthropic API call
//
// To show quick questions first:
//   const questionsEl = renderShoppingQuestions((answers) => {
//     handleShoppingRequest(userMessage, answers).then(result => { ... });
//   });
//   chatContainer.appendChild(questionsEl);
// ─────────────────────────────────────────────────────────────
function injectProductComparisonStyles() {
  if (document.getElementById("harlow-product-comparison-styles")) return;

  const style = document.createElement("style");
  style.id = "harlow-product-comparison-styles";
  style.textContent = `
    .hpc-box {
      background:#fff;
      color:#111827;
      border-radius:14px;
      padding:12px;
      margin:10px 0;
      font-family:inherit;
      max-width:100%;
      overflow:hidden;
    }

    .hpc-title {
      font-weight:800;
      font-size:0.95rem;
      margin-bottom:5px;
      color:#111827;
    }

    .hpc-note {
      font-size:0.75rem;
      color:#6b7280;
      line-height:1.35;
      margin-bottom:10px;
    }

    .hpc-spec {
      display:flex;
      flex-wrap:wrap;
      gap:5px;
      margin-bottom:10px;
    }

    .hpc-pill {
      font-size:0.70rem;
      background:#f3f4f6;
      color:#374151;
      border-radius:999px;
      padding:4px 8px;
    }

    .hpc-table-wrap {
      width:100%;
      overflow-x:auto;
    }

    .hpc-table {
      width:100%;
      border-collapse:collapse;
      font-size:0.72rem;
      min-width:560px;
    }

    .hpc-table th {
      text-align:left;
      color:#6b7280;
      font-weight:700;
      border-bottom:1px solid #e5e7eb;
      padding:6px 5px;
      white-space:nowrap;
    }

    .hpc-table td {
      border-bottom:1px solid #f3f4f6;
      padding:7px 5px;
      vertical-align:top;
    }

    .hpc-rank {
      font-weight:800;
      color:#065f46;
    }

    .hpc-store {
      font-weight:800;
      color:#111827;
      white-space:nowrap;
    }

    .hpc-small {
      font-size:0.66rem;
      color:#6b7280;
      line-height:1.25;
    }

    .hpc-warning {
      font-size:0.66rem;
      color:#92400e;
      line-height:1.25;
      margin-bottom:5px;
    }

    .hpc-link {
      display:inline-block;
      text-decoration:none;
      background:#2563eb;
      color:#fff;
      padding:4px 8px;
      border-radius:7px;
      font-size:0.70rem;
      font-weight:700;
    }

    .hpc-q {
      border-top:1px solid #e5e7eb;
      padding-top:10px;
      margin-top:10px;
    }

    .hpc-q-title {
      font-size:0.82rem;
      font-weight:700;
      margin-bottom:7px;
      color:#111827;
    }

    .hpc-q button {
      border:1px solid #d1d5db;
      background:#f9fafb;
      color:#111827;
      border-radius:999px;
      padding:6px 10px;
      margin:3px;
      font-size:0.75rem;
      cursor:pointer;
    }

    .hpc-q button:hover {
      background:#2563eb;
      color:#fff;
      border-color:#2563eb;
    }
  `;

  document.head.appendChild(style);
}
if (typeof module !== "undefined") {
  module.exports = {
    STORE_RULES, rankStores, scoreStore, renderComparisonCards,
    renderShoppingQuestions, handleShoppingRequest, parseShoppingContext,
    getUserProfile, saveUserProfile, recordFeedback, injectHarlowStyles,
    HARLOW_SHOPPING_SYSTEM_PROMPT_V2, fetchLivePrice
  };
}
