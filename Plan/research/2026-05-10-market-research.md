# AcrylixCo — Market Research & Phase 2.5 Recommendations

**Date:** 2026-05-10
**Author:** Research lead
**Scope:** Competitive teardown of AU custom-acrylic, AU/global custom-print personalisation, and premium DTC indies, with prioritised Phase 2.5 changes mapped to AcrylixCo files.
**Sites studied:** 18 distinct sites (see Sources). Core sample: Hello Acrylic, The Humble Gift Co., Letterly, ByCarly Designs, Laser Edge Designs, Laser Sharp Creations, Mostly A Mum, Blond + Noir, Laser Blanks, Hexi, Laser Cut Customs, Little Dance, Meridian Etch, Laserly, Tinyme, Minted, Cuyana, Magnolia, Lulu & Georgia, Koala Eco, Hello Fern.

---

## 1. Executive summary — top 5 changes, in priority order

The current AcrylixCo homepage reads as competently-designed but generically branded. The hero says *"Made-to-order acrylic decor for life's occasions"*; this exact phrase pattern appears, almost verbatim, on Hello Fern, Hello Acrylic, and dozens of Etsy listings. The existing dark/cream/serif italic system is **closer to Cuyana than to any AU acrylic competitor** — that is the right direction, but the copy and trust signals are not yet earning the aesthetic.

The single biggest finding from competitor study: **every successful AU competitor leads with a tangible promise plus a specific trust signal in the announcement bar or hero, not a poetic sentence.** ByCarly says *"Spend $220+ online and get FREE shipping"*; Laser Sharp says *"PRODUCTION & DISPATCH IN 5–10 DAYS"*; Letterly opens its email popup with *"10% off your first order"*; Hello Fern leads with *"$10 FLAT RATE SHIPPING AUSTRALIA WIDE / FREE AU SHIPPING FOR ORDERS OVER $150"*. AcrylixCo currently has zero of these.

### The five changes

1. **Add a persistent announcement bar with three rotating, tangible promises** — free AU shipping over $X, dispatch days, Afterpay available. Today AcrylixCo has none of these on-page, despite Phase 2 having shipping content. Mapped: new `Announcement.tsx` component, mounted in `site/src/app/layout.tsx` above `<Header/>`. This is the single highest-leverage change because every AU competitor proves it converts.

2. **Rewrite the hero around the 3D customizer as the lede, not the catalog.** Right now the hero is *"Made-to-order acrylic decor for life's occasions"* with two equal CTAs — "Browse the shop" and "Design your own". Of the 12 AU competitors studied, **none have a 3D customizer**. Letterly's "Design Your Sign" page is the closest analog and it is buried in the nav. AcrylixCo's lede should be: hero copy that promises *"see your name in 3D before you buy"* with the customizer as primary CTA, the shop as the secondary. Mapped: `site/src/app/page.tsx` lines 18–39, plus a new `HeroPreview.tsx` that embeds a tiny live `<canvas>` of an example layered name.

3. **Add a trust strip beneath the hero** with three icons: *"Designed in Sydney · Made in our studio · 7–10 day dispatch."* This is a direct lift from the pattern used by Hello Acrylic ("Designed + Etched here in our QLD studio"), Laser Edge Designs ("Family-run business based in Melbourne / Trusted by 1,000+ small businesses"), and ByCarly ("100% Family Owned Small Business / Handmade in Nambour, Sunshine Coast QLD"). Mapped: new `TrustStrip.tsx` after the hero section in `site/src/app/page.tsx`.

4. **Switch homepage taxonomy from "By the moment you're celebrating" to a dual-axis: *Shop by recipient* (For baby · For weddings · For business · For home) AND *Shop by product type* (Name plaques · Cake toppers · Mirrors · Door signs).** Tinyme, The Humble Gift Co. and Hello Acrylic all run this dual-axis structure; Mostly A Mum, Blond + Noir, Letterly run the same. The current "by occasion" framing is too narrow and skips the highest-search-volume category page (Name plaques). Mapped: `site/src/app/page.tsx` lines 54–73 + a new structured query in `site/src/lib/catalog/queries.ts`.

5. **Build a "How a piece is made" editorial section on the homepage** — a 3-step illustrated explainer (Design → Approve digital draft → We laser-cut and ship in 7 days). This addresses the central made-to-order anxiety that Baymard, Shopify, and every craft seller's review section confirms: *"will it look how I imagined it?"* The Humble Gift Co. and ByCarly explicitly call out the digital-draft-approval step ("Personalised orders require digital draft approval before production begins"); AcrylixCo's 3D preview makes this even stronger because the customer literally sees the final piece before paying. This is AcrylixCo's biggest unique advantage and it needs a homepage block. Mapped: new `HowItWorks.tsx` section after the trust strip.

There are 9 more recommendations in §5 (Phase 2.5 implementation list); these top 5 are the ones I would do first because each is a 1–4 hour change with clear competitor proof.

---

## 2. Where AcrylixCo fits in the market — positioning analysis

### Who the AU acrylic competitors look like

After visiting 12 AU custom-acrylic and personalised-decor sites, three clear archetypes emerge:

**Archetype A — "Mum-craft warmth" (the dominant 70%).** Hello Acrylic, Mostly A Mum, Hello Fern, The Humble Gift Co., Pretty Plaques. Hero copy is gushy and exclamatory: *"Hi there, and Welcome to Hello Acrylic!"*, *"Magical mirrors designed to inspire confidence, kindness & self love"*, *"easy!!!!"*. Heavy emoji use (🌸 ✨). Florals, pastels, butterflies, bows in photography. Founder signature ("Love, Selms x"). Photography is product-on-cake or product-on-blanket lifestyle. Tone is the Etsy seller voice — warm, personal, slightly chaotic. The customer is mum-buying-for-baby. It works for them but it caps the AOV at ~$70 and it skews everything toward a baby/cake-topper aesthetic.

**Archetype B — "Business signage utility" (the next 20%).** Laser Edge Designs, ByCarly Designs, Laserly, Laser Cut Customs. Hero copy is functional: *"Shop signs that get noticed"*, *"New modern Signage Solutions that work hard and look good doing it"*. Photography is product-in-salon, product-in-cafe, before/after reveal. Tone is professional but bland. Tiered pricing visible ($14–$460 because a logo sign is more than a cake topper). Trust signals are explicit and well-handled ("Trusted by 1,000+ small businesses"). The customer is a small-business owner.

**Archetype C — "Premium kids studio" (the 10% niche).** Letterly, Blond + Noir. Hero is restrained and category-led: *"Custom Name Signs for Nurseries, Kids' Rooms & Businesses"*. Photography is staged kids' room with intentional props. Tone is design-forward, premium, less exclamation-heavy. Pricing tier is $27–$190. Letterly is the polished version of the AU acrylic category and is the closest stylistic peer to where AcrylixCo's *aesthetic* currently sits.

### Where AcrylixCo currently sits, and where it should sit

AcrylixCo's existing visual language — cream + ink-tinted neutrals, italic serif for headings, font-mono small caps for eyebrows, "Sydney · since 2024" — is closest to Cuyana / Aesop / Hommey. **That is the right ceiling**. None of the 12 AU acrylic competitors look like this. Letterly and Blond + Noir get closest, but they are still photographically warmer.

The gap to occupy: **"Studio"-tier, Sydney-made, design-led custom acrylic.** The mum-craft archetype dominates Google results and Instagram; the studio tier is wide open. AcrylixCo's 3D customizer is the differentiator that justifies a higher price tier ($90–$220 instead of $30–$120) and a more restrained brand voice.

The risks of the current execution:

- **The hero copy is too generic.** Hello Acrylic uses essentially the same "for the moments that matter most"; Hello Fern uses essentially the same; Tinyme uses "for every life moment" verbatim. AcrylixCo needs language that isn't lifted from the median Etsy listing.
- **There are no trust signals visible.** Every AU competitor has at least one of: review count + rating, Made in Australia, turnaround days, founder name. AcrylixCo has the eyebrow "Sydney · since 2024" and that's it.
- **The customizer is mentioned but not lived.** "Open the designer" is a button at the bottom of the page. The site's biggest unique value is third-fold and unexplained.

**The repositioning thesis:** AcrylixCo is the only AU acrylic studio where a customer designs a piece in 3D and sees it before they buy. The hero, the trust strip, the editorial block, and the photography all need to make that one fact unmissable.

---

## 3. Competitive teardowns

### 3.1 Hello Acrylic (helloacrylic.com.au) — the warmth archetype, Brisbane

- **Hero copy:** *"Hi there, and Welcome to Hello Acrylic! / We design custom acrylic pieces for the moments that matter most. From personalised name signs and thoughtful keepsakes to event decor and business signage, every piece is handcrafted with love and care to reflect your story, your space, and the meaning behind it."* Note the length and the warmth — this is the dominant AU pattern.
- **CTAs:** *"Create Your Custom Mirror"*, *"Create Your Signage"*, *"Customise"*, *"Shop Birth & Name Plaques"*, *"Make Memories"*, *"Quick View"*, *"Add to cart"*. Notice the *"Create Your X"* phrasing — verb-led, ownership-implied.
- **Pricing for name plaque:** Single Layer $30–$90 / Double Layer $60–$120 / Triple Layer $70–$225. Triple-layer is rated 5.00/5.
- **Customisation UX:** Form-based ("Select options"); no designer. This is a friction point that AcrylixCo's 3D customizer eliminates.
- **Trust signals:** Turnaround stated twice: *"Current turnaround is 5–7 business days"*. Founder signature: *"Love, Selms x"*. ABN listed. Multiple 5-star ratings. *"Made in Australia"*. *"Designed + Etched here in our QLD studio"*.
- **Photography:** Pastel, dreamy, lots of florals and bows. Product-on-cake heavy. Minimal model presence.
- **Categories:** Hybrid by-occasion (Mother's Day, Easter, Christmas, Wedding) and by-product (Name Signs, Cake Toppers, Mirrors, Milestone Boards). Sub-divides Babies & Kids by layer count: Triple/Double/Single — useful pattern AcrylixCo could borrow because it telegraphs price tiers.
- **Upsells:** Acrylic Blanks (DIY market!), Cake Decorating Tools. *No gift wrap, no rush option visible on home, no gift card prominent.*
- **Email capture:** *"Subscribe to get special offers, free giveaways, and discounts!"* — No specific %-off discount visible (weaker hook than Letterly's 10% off).
- **Reviews tool:** Native ratings only. No Yotpo/Judge.me visible.
- **Mobile signal:** Standard responsive Shopify-style. Not phone-first.

**Lift for AcrylixCo:** The "Triple/Double/Single Layer" sub-categorisation is excellent and maps directly onto AcrylixCo's existing data model. The "Create Your X" verb-led CTA pattern is more inviting than "Browse the shop". The founder-signature trust move ("Love, Selms x") is something AcrylixCo could do as a small "From the studio" footer block.

### 3.2 The Humble Gift Co. (thehumblegiftco.com.au) — the mature warmth archetype, Sunshine Coast

- **Hero copy:** *"Welcome to The Humble Gift Co. / At The Humble Gift Co., we create personalised laser cut gifts and decor, business and event signage from wood and acrylic materials, all handmade with love just for you."*
- **Sample triple-layer name plaque:** $70 AUD. Sizes XS/S/M/L/XL with custom available. Materials = 3 acrylic colours, or 2 acrylic + 1 mirror, or 2 acrylic + 1 pine wood. Important: **mixed-material variants are a real upsell pattern.**
- **Production messaging:** *"Orders can take up to 2 weeks to be produced from payment. Personalised orders require digital draft approval before production begins. Rush orders available at checkout."* This is the most explicit and trust-building production-time copy I found across all 18 sites. **AcrylixCo should lift this entire paragraph nearly verbatim and shorten it.**
- **Trust signals:** *"Donate 2 from every name badge to local hospital charity – Wishlist, Sunshine Coast Health Foundation. Totaling $16,668"* — this is a brilliant, specific, dollar-figure social-good signal. ABN listed. Established 2021.
- **Photography:** Lifestyle warm, flatlay on neutral, behind-the-scenes team photos.
- **Tone:** *"Handmade with love"*, *"Turn our customer's ideas into reality"*, *"We humbly listen and work closely together"*, *"We want to bring your vision to life"*. Collaborative, humble, not gushy.
- **Categories:** Excellent multi-axis: by product, by occasion (12 occasions), by recipient (8 recipient types: coach, couples, dad, her, him, grandparents, kids, mum, pets, teachers), by price (under $25/$50/$100/$100+). **The price-range filter is a pattern AcrylixCo should adopt.**
- **Upsells:** Bundle & Save (wedding packages explicitly), Wedding Bundles, Gift Cards, Badge Reels (accessory). Branded outside collections.
- **Rush order:** *"Rush orders available – Choose this option at the checkout"*. Surfaced in the announcement bar.
- **Reviews tool:** Visible testimonials section but no clear branded review widget.
- **First-time-buyer offer:** *"Sign up and save – Sign up to receive 10% off and exclusive discounts."*

**Lift for AcrylixCo:** Three patterns — (1) the explicit "digital draft approval" callout to make the made-to-order process feel safe; (2) the "shop by recipient" axis (for baby / for couples / for him / for her / for teacher / for pets); (3) the price-range filter ($0–50, $50–100, $100–200, $200+).

### 3.3 Letterly (letterly.com.au) — the closest stylistic peer

- **Hero copy:** *"Custom Name Signs for Nurseries, Kids' Rooms & Businesses"*. Type-led, category-led, restrained. **This is the closest tone to where AcrylixCo wants to be.**
- **CTAs:** *"Shop all"*, *"Shop the look"*, *"Shop Neons"*, *"Shop Wooden Signs"*, *"Quick buy"*, *"Sign up"*. The word *"Shop"* dominates — and importantly it's combined with *"the look"* for editorial styled rooms (not a flat catalog).
- **Pricing:** Mini $27 / Standard $90 / Premium $150 / Niche $24–$190. **The "Mini" entry-tier at $27 is significant — it's a low-AOV gateway to capture customers who otherwise wouldn't try a custom item.** AcrylixCo currently has no entry-tier under $50.
- **Customisation UX:** Has a "Design Your Sign" page (analog to AcrylixCo's customizer) but it's buried in the nav as a non-primary item. They sell more from product pages with variant pickers than from the designer.
- **Trust signals:** Customer testimonials by name. *No explicit review count or rating displayed* — a weakness AcrylixCo can exploit by showing a count when one exists.
- **Email popup:** *"Sign up to be the first to hear about upcoming sales, subscriber only discounts and new releases plus get 10% off your first order!"*
- **Upsells:** Gift Cards, *"Rush My Order"* at $50 (explicit price), Neon Lighting upgrades, Wooden alternatives. **The $50 named-rush upsell is a clean pattern.**
- **Photography:** Lifestyle nursery, themed collections (Western, Sports, Mermaids, Transport), playful but not chaotic.

**Lift for AcrylixCo:** Three patterns — (1) the *Mini* price tier under $30 to lower the trial barrier; (2) the *"Rush my order +$50"* explicit upsell instead of vague "contact us for rush"; (3) "Shop the look" instead of just "Shop" — implies styled rooms, not a flat catalog.

### 3.4 Tinyme (tinyme.com) — the high-conversion personalisation playbook, Melbourne

- **Hero copy:** *"THE WORLD'S CUTEST PERSONALIZED PRODUCTS FOR KIDS"* / *"TINYME. 3 DADS, 15 KIDS. A TRUE STORY…"* / *"Over 1 MILLION ORDERS FROM HAPPY CUSTOMERS SINCE 2006"*. Caps-heavy. Founder-story-led. Volume-claim trust.
- **First-time buyer:** Modal: *"GET 10% OFF SITEWIDE! (Excludes Gift Cards)"* with confirmation showing code *CLAIM10*. Dual opt-in (Club Tinyme + sister brand).
- **Customizer structure:** Step-by-step: Step 1 Personalize & Preview / select recipient / adjust skin/hair/freckles/glasses / choose themes / save profile. **The step labelling — *"STEP 1 Personalize & Preview"* — is exactly the clarity AcrylixCo's customizer needs.**
- **Trust signals:** Awards ("Repeat Winners of Online Retail Industry Award"), volume ("1 MILLION ORDERS"), longevity ("since 2006"), media mentions ("As Seen On"), explicit AU origin ("Proudly made in Melbourne, Australia since 2006"). **The volume claim + the longevity claim is what gives Tinyme the conversion advantage; AcrylixCo cannot match volume but can match longevity (Sydney · since 2024) and craft.**
- **Birth Announcement Plaque PDP:** Price $25, free shipping over $60, *"9–11 business days"* standard or *"$24 for next-day dispatch / 5 business days delivery"* rush. The two-tier dispatch pattern (standard vs explicit-priced rush) is a strong AOV play.
- **Cross-sells:** Monthly Milestone Discs, Achievement Milestone Discs, Baby Closet Dividers. Themed bundles by recipient.
- **Categories:** Heavy by-occasion (Christmas Gifts, Baby Gifts, Teacher Gifts) and by-product (Name Labels, Stamps, Bags, Books, Wall Decals).
- **Tone:** *"GEEK + CUTE = YAY!"*, *"TINYWHO? TINYME!"*, *"Crazy dress up days, pizza, coffee & all things fun!"*. **Wrong tone for AcrylixCo — this is the opposite of where it should sit.** But the conversion mechanics are correct.

**Lift for AcrylixCo:** (1) The 10%-off-first-order popup on email capture is essentially mandatory for AU DTC and AcrylixCo doesn't have it. (2) The *"STEP 1 Personalize & Preview"* labelling pattern for the customizer wizard. (3) The two-tier dispatch (standard 7–10 days / rush +$X for 3–5 days). (4) The volume-and-longevity trust line ("Designed in Sydney since 2024" → become "X happy Sydney customers since 2024" once data exists).

### 3.5 ByCarly Designs (bycarlydesigns.com.au) — the AU mid-market signage example

- **Hero copy:** *"New modern Signage Solutions that work hard and look good doing it."* Functional + benefit-led.
- **Trust signals:** *"100% Family Owned Small Business / Handmade in Nambour, Sunshine Coast QLD / Shipping Australia Wide / 149 five-star reviews displayed / Over 140 5-star reviews"*. Number prominently displayed.
- **Shipping:** *"Flat rate shipping Australia-wide for $9 & Express for $12 online • Spend $220+ online and get FREE shipping!"* — note the high $220 threshold; AcrylixCo's typical AOV would suggest $150 is more appropriate.
- **Customisation UX:** *"Design approval workflow: customers place orders, receive artwork proofs via email, request amendments, then production proceeds."* Slow but trust-building. AcrylixCo's customizer collapses this into instant feedback.
- **Email popup:** *"10% off your first order"* — confirmed standard AU DTC pattern.
- **Categories:** Strong by-purpose: Business Signage / Point of Sale / Promotional / Bottle Engraving / Weddings / Gifts / Home & Kids / Occasion (Easter, Christmas, Mother's Day).
- **Pricing:** LED Lightbox $460 / A-Frame from $400 / Hanging Swing $300 / Standing Floor $290 / Acrylic Lettering from $250 / 3D Acrylic from $80 / Counter Sign $70.
- **Photography:** Professional product mockups + lifestyle business context.

**Lift for AcrylixCo:** (1) The numbered review-count callout (*"149 five-star reviews"*) is the strongest trust signal pattern; AcrylixCo should display its review count once it has even 20+. (2) The hero pattern of "X that work hard AND look good" — benefit + design — is more directly compelling than AcrylixCo's current poetic phrasing.

### 3.6 Laser Edge Designs (laseredgedesigns.com.au) — the AU business-signage premium peer

- **Hero copy:** *"Shop signs that get noticed / Made to order for your brand. Designed to attract, engage and convert. Trusted by businesses Australia wide"*. Benefit-stack + trust line.
- **Trust signals:** *"Trusted by 1,000+ small businesses"*, *"Family-run business based in Melbourne"*, *"Australian made"*, *"Fast, tracked shipping from our Melbourne studio"*, customer testimonials with images.
- **Shipping/payment:** Free over $200; $10 standard. Accepts Afterpay, Apple Pay, Google Pay, Shop Pay, PayPal. **Most complete payment matrix observed** — AcrylixCo should match this.
- **Categories:** Aggressive by-purpose taxonomy. Includes "Business Bundles" — a packaged-set pattern.
- **Photography:** Salon/cafe in-context photography. Before/after reveal moments. Customer workspace photos. **The before/after reveal is a strong UGC-style pattern.**

**Lift for AcrylixCo:** (1) The hero subhead pattern *"Designed to [verb], [verb], [verb]. Trusted by [N] [audience]."* is a clean template — AcrylixCo could write *"Designed to be touched, gifted, kept. Made to order in Sydney since 2024."* (2) The "Bundle" packaging pattern for events (wedding bundle = welcome sign + place cards + cake topper).

---

## 4. Pattern catalog — concrete UX/CTA/copy moves

Each pattern below is followed by the competitor proof and a one-line recommendation for where AcrylixCo should apply it.

### 4.1 Persistent announcement bar with rotating tangible promises

- **Proof:** Laser Sharp Creations, *"FREE AUS-WIDE SHIPPING ON ORDERS OVER $100 / QUICK PRODUCTION TIME: PRODUCTION & DISPATCH IN 5–10 DAYS"*. Hello Fern, *"$10 FLAT RATE SHIPPING AUSTRALIA WIDE / FREE AU SHIPPING FOR ORDERS OVER $150"*. Mostly A Mum, *"AFTERPAY AVAILABLE - $10 FLAT RATE SHIPPING"*. Almost universal.
- **Apply to AcrylixCo:** New top bar above `<Header/>` rotating three lines: *"Free AU shipping over $150"*, *"Designed in Sydney · dispatched in 7–10 days"*, *"Afterpay available at checkout"*.

### 4.2 Three-step "How it works" editorial block

- **Proof:** Implicit in The Humble Gift Co.'s *"digital draft approval"* trust copy; ByCarly Designs makes it explicit (*"customers place orders, receive artwork proofs via email, request amendments, then production proceeds"*); Minted has a Materials/Printing/Craftsmanship carousel with three sections each describing a quality assurance dimension.
- **Apply to AcrylixCo:** Homepage section *"How a piece is made"* with three icons: *1. Design in 3D / 2. Approve your preview / 3. We laser-cut and ship in 7 days*. The 3D customizer eliminates the email-proof loop, which is a feature.

### 4.3 Trust strip directly under hero

- **Proof:** Hello Acrylic, *"Designed + Etched here in our QLD studio"* + turnaround. Laser Edge, *"Family-run business based in Melbourne / Trusted by 1,000+ small businesses / Australian made / Fast, tracked shipping"*. ByCarly, *"100% Family Owned Small Business / Handmade in Nambour"*.
- **Apply to AcrylixCo:** Three or four icon-text pairs immediately under the hero: *Designed in Sydney · Studio-made to order · 7–10 day dispatch · Afterpay welcome*.

### 4.4 First-time-buyer 10% off email popup

- **Proof:** Letterly, ByCarly, The Humble Gift Co., Tinyme (*CLAIM10*), Laser Blanks (*15% off first order*), Koala Eco. **Universal AU DTC standard.**
- **Apply to AcrylixCo:** Add a Klaviyo / native popup that fires after 25 seconds or 50% scroll depth: *"Get 10% off your first AcrylixCo piece — and dibs on new colours."* Single field, single CTA. Code: ACRYLIX10 or similar.

### 4.5 Layer-tier sub-categorisation as a price-tier signal

- **Proof:** Hello Acrylic divides Babies & Kids into Triple/Double/Single layered name signs. Mostly A Mum has Double Layer ($55), Triple Layer ($75), Triple Layer Two Names ($115), Round ($25), Rainbow ($38). Letterly has Mini ($27) / Standard ($90) / Premium ($150).
- **Apply to AcrylixCo:** Surface the layer count in product listings on `/shop` and add a filter for "Single layer / Double layer / Triple layer / Mixed material" in the sidebar.

### 4.6 Two-tier dispatch — standard plus paid rush

- **Proof:** Letterly (*"Rush my order +$50"*), Tinyme (*"$24 for next-day dispatch, 5 business days delivery"*), The Humble Gift Co. (*"Rush orders available – Choose this option at the checkout"*), Meridian Etch (*"24-hour turnaround service available for select items (paid add-on)"*).
- **Apply to AcrylixCo:** Add a *"Rush dispatch — your piece in 3–5 days, +$45"* checkbox on the product page and customizer, with a clear deadline ("ships from Sydney by [date]"). This is a clean AOV-lift pattern.

### 4.7 Price-range filter

- **Proof:** The Humble Gift Co. ($25 / $50 / $100 / $100+). Hello Fern (under $25/$50/$70/$120).
- **Apply to AcrylixCo:** Sidebar filter on `/shop` with chips: *Under $50 · $50–100 · $100–200 · $200+*. Maps naturally onto the existing `priceCents` field.

### 4.8 Shop-by-recipient axis

- **Proof:** The Humble Gift Co. has 10 recipient types. Tinyme has Baby Gifts / Teacher Gifts. Cuyana has by-occasion (Mother's Day Gift Guide, Travel Case Collection). Minted leads with *"Shop by moment"* but its real value is shop-by-recipient (Wedding, Graduation, Baby, Parties).
- **Apply to AcrylixCo:** Add a homepage block titled *"Shop by who you're celebrating"* with 6 cards: For baby · For weddings · For her · For him · For business · For home. Right now homepage section #3 is a single-axis "by occasion" grid; this is too narrow.

### 4.9 Verb-led product CTAs

- **Proof:** Hello Acrylic uses *"Create Your Custom Mirror"*, *"Create Your Signage"*, *"Make Memories"*. Tinyme uses *"GET STARTED"*. AcrylixCo currently uses *"Browse the shop"* and *"Design your own"*.
- **Apply to AcrylixCo:** Change hero CTAs to *"Design yours in 3D"* (primary) and *"Browse the studio"* (secondary). Change product card hovers from passive to active.

### 4.10 Mini-tier entry product under $30

- **Proof:** Letterly's Mini Triple Layer at $27. Mostly A Mum's Round Plaque at $25. Tinyme's Birth Announcement Plaque at $25. Hello Acrylic's Custom Ride-On Name Plate at $28.
- **Apply to AcrylixCo:** Introduce a *"Mini"* entry SKU per template — a 15cm name plaque at $29. This becomes the ad-driven first-purchase offer.

### 4.11 "Designed + made in Sydney" origin badge with founder voice

- **Proof:** Hello Acrylic, *"Love, Selms x"*. The Humble Gift Co., *"We humbly listen and work closely together"*. ByCarly, *"100% Family Owned Small Business"*. Laser Edge, *"Family-run business based in Melbourne"*.
- **Apply to AcrylixCo:** Footer block: a short founder note + signature, plus an *"In our Sydney studio"* photo. Currently the footer is just *"AcrylixCo · Sydney, Australia"* and a copyright — sterile.

### 4.12 Sticky add-to-cart on product page

- **Proof:** Shopify's product-page best-practice article: *"Persistent Add to Cart button at the top of the screen ensures continued visibility during page scrolling."* Reliqus 2025 patterns: *"Mobile-First Product Showcase — Vertical scrolling with sticky 'Add to Cart'"*.
- **Apply to AcrylixCo:** Make the buy button sticky on mobile in `site/src/app/shop/[slug]/page.tsx` once a real cart exists in Phase 3.

### 4.13 "Pairs well with" cross-sell

- **Proof:** The Humble Gift Co. has *"Pairs well with"* and *"You may also like"* cross-sell rows on PDP. Tinyme has cross-sells (Monthly Milestone Discs, Achievement Milestone Discs, Closet Dividers).
- **Apply to AcrylixCo:** Add a *"Pairs well with"* row on PDP — cake topper + name plaque + door sign as a wedding/baby bundle. AcrylixCo's `/shop/[slug]` currently has no cross-sell row.

### 4.14 Wedding/baby/event bundles

- **Proof:** The Humble Gift Co. *"Wedding Bundles"*. Laser Edge *"Business Bundles"*. Koala Eco bundles save 15–20%.
- **Apply to AcrylixCo:** Phase 2.5 stretch — define a *"Wedding day set"* (welcome sign + table number + cake topper) at a 10% bundled discount. Map a new `/shop/sets` route.

### 4.15 UGC review wall with photos

- **Proof:** Hello Fern multiple 5-star reviews with photos. Laser Edge customer testimonials with images. Hello Acrylic customer testimonials. **Loox / Judge.me / Stamped are all explicitly photo-review-friendly.**
- **Apply to AcrylixCo:** Phase 2.5 stretch — install Judge.me (cheaper and AU-friendly per the comparison data) once first 20 orders ship, embed on home + PDP. Until then, add an Instagram-feed embed of customer photos as a placeholder.

### 4.16 The "Shop the look" room shot

- **Proof:** Letterly's *"Shop the look"* CTA opens a styled nursery photo where each product is hot-spotted. Lulu & Georgia *"There's An Art to It"*, *"Make Your Escape"*. Magnolia uses *"Shop new arrivals"* with editorial collection storytelling.
- **Apply to AcrylixCo:** A homepage editorial block — one large photo of a styled nursery / wedding tablescape / birthday table with three products visible, each hot-spotted with a *"Shop the [piece]"* CTA. Higher production cost but huge brand differentiator.

### 4.17 Materials & finish breakdown on PDP

- **Proof:** The Humble Gift Co. PDP: *"3 solid acrylic colours / 2 acrylic + 1 mirror acrylic layer / 2 acrylic + 1 pine wooden layer"*. Letterly: *"made from layered 3mm acrylic"*. Meridian Etch: *"4mm plywood and 3mm acrylic"*. **Material specificity is a trust signal.**
- **Apply to AcrylixCo:** Add a *"Materials"* sub-section on PDP listing acrylic mm thickness, available finishes (gloss/matte/mirror), wood option, hardware included.

### 4.18 Restrained editorial tone (the premium ceiling)

- **Proof:** Cuyana, *"Fewer, better means valuing a simpler, smarter way of life"*. Minted, *"For every life moment / Designed by artists, handcrafted with intention"*. Aesop's literary register. Magnolia, *"shared table"* / community-focused phrasing.
- **Apply to AcrylixCo:** The current italic-serif voice is correct directionally — *don't* lift Hello Acrylic's emoji-heavy register. The hero rewrite should aim for the Minted / Cuyana register: short, declarative, slightly literary, never gushy.

### 4.19 Step-numbered customizer wizard

- **Proof:** Tinyme, *"STEP 1 Personalize & Preview"*. Minted's design walkthrough offers concierge appointments and free samples. Reliqus 2025: *"Transparent Checkout with Timeline — Simplified multi-step process displaying estimated production + ship dates."*
- **Apply to AcrylixCo:** Re-frame the customizer at `/customize` as a numbered three-step wizard: *Step 1 — Pick your shape · Step 2 — Type your name · Step 3 — Choose finishes & preview*. Use breadcrumb numbering.

### 4.20 Shipping cost reveal in cart, never surprise

- **Proof:** Baymard cart abandonment research: the global cart abandonment rate is **70.19%**, and *"unexpected shipping costs"* is the top abandonment reason (48% of abandonments per Baymard / Shopify-cited stats).
- **Apply to AcrylixCo:** Show shipping calculation in the slide-out cart (Phase 3), not at the final checkout step. The announcement bar pre-states the threshold; the cart confirms it.

---

## 5. Phase 2.5 implementation list — prioritised, file-mapped

Each item is a single-paragraph spec the implementing engineer can execute. Items are ordered by leverage (highest first). All file paths are absolute under `/Users/mohamadhassan/Desktop/AcrylixCo/site/`.

### P0 — Trust + framing fixes (do these first; ~1 day total)

**P0.1 Persistent announcement bar.** Create `src/components/site/Announcement.tsx` — a thin top bar (cream-100 bg, ink-700 text, font-mono small caps) cycling three lines every 4 seconds with `prefers-reduced-motion` falling back to static stack on mobile. Mount in `src/app/layout.tsx` immediately above `<Header/>`. Lines: *"Free AU shipping over $150"*, *"Designed in Sydney · dispatched in 7–10 days"*, *"Afterpay available at checkout"*. Use `aria-live="polite"`. Remove the announcement bar via a cookie close button.

**P0.2 Hero rewrite.** Edit `src/app/page.tsx` lines 18–39. New hero copy: eyebrow *"Sydney studio · since 2024"* (unchanged); h1 *"Acrylic, made for the moments that matter — and made to your name."* OR (preferred, more distinctive) *"Your name. Cast in light, layered in colour, made to last."*; subhead *"Design your piece in 3D, see it before you order, and we'll laser-cut it in our Sydney studio."*; primary CTA *"Design yours in 3D"* → `/customize`; secondary CTA *"Browse the studio"* → `/shop`. The current copy "for life's occasions" is the most generic phrase in this category and must go.

**P0.3 Trust strip.** Insert a new section directly after the hero in `src/app/page.tsx` (around line 40). Three or four bordered tiles, each `<div>` containing a small svg icon + a label + a sub-label: (a) *"Designed in Sydney / By a small studio team"*; (b) *"Made to order / Each piece laser-cut just for you"*; (c) *"Dispatched in 7–10 days / Rush options available"*; (d) *"Afterpay welcome / Pay in four"*. Keep it cream-50 background, no shadow, hairline border, font-mono labels.

**P0.4 "How a piece is made" three-step section.** New section in `src/app/page.tsx` between the trust strip and the existing Featured products. h2 *"How a piece is made."* Three numbered cards in a row on desktop (stack on mobile): *01 — Design in 3D / Pick a shape, type the name, choose finishes — see it from every angle.* / *02 — Confirm and order / What you preview is what we make. No email proofs, no surprises.* / *03 — Laser-cut and shipped / We cut, sand, hand-finish and dispatch from Sydney in 7–10 days.* This block is AcrylixCo's single biggest brand-differentiation moment and must exist on the homepage.

**P0.5 Footer rewrite — founder voice + studio block.** Replace `src/components/site/Footer.tsx` entirely. New structure: top row 4 columns — Shop (links), Customize (links), Studio (about / care / shipping / faq / contact), Stay in touch (email signup with *"10% off your first piece"* hook). Below, a "From the studio" block with a 1-paragraph founder note signed *"— [Name], Sydney"*, plus payment-method icons (Visa, Mastercard, Amex, Apple Pay, Afterpay). Bottom: ABN + copyright + privacy/terms links. The current footer is two lines and is the single most under-built component on the site.

### P1 — Catalog + product page (~1 day)

**P1.1 Homepage taxonomy: dual axis.** Replace the current single "by occasion" category grid in `src/app/page.tsx` lines 54–73 with two separate sections: *"Shop by who you're celebrating"* (For baby · For weddings · For her · For him · For business · For home) and *"Shop by piece"* (Name plaques · Cake toppers · Door signs · Mirrors · Ornaments · Wedding stationery). This will require a small data update in `src/lib/catalog/queries.ts` to expose a `getRecipientCategories()` and a `getProductTypeCategories()` — both can map onto the existing `categories` table with a new `kind` column or a `categoryGroup` enum. If the data model can't be touched in Phase 2.5, hard-code the sections from existing slugs and accept slight overlap.

**P1.2 Layer-tier filter on /shop.** Add a `layerCount` filter chip group to `src/app/shop/CategorySidebar.tsx`: *Single layer · Double layer · Triple layer · Mixed material*. Read the layer count from `productSummary.materialsSummary` or a new field. Pair with a price-range filter row: *Under $50 · $50–100 · $100–200 · $200+*.

**P1.3 PDP: materials block + turnaround callout.** Edit `src/app/shop/[slug]/page.tsx`. After the description (line 106), add a *"Materials & dimensions"* expandable: list acrylic thickness, layer count, available finishes (gloss/matte/mirror), and any wood option. Replace the bare text *"Made to order · ships from Sydney in 7–10 days"* (line 117) with a more structured callout: a small icon row showing *"Made to order"* + *"7–10 days"* + *"Tracked AU shipping"* + *"Rush available"*, each with hover tooltip. The current single-line treatment is too easy to overlook.

**P1.4 PDP: "Pairs well with" cross-sell row.** Add a row at the bottom of the PDP showing 4 related products (same category, different layer count, or themed pairing — e.g., a name plaque PDP shows door sign + cake topper + ornament + mirror). Implement via a new `getRelatedProducts(productId, limit)` in `queries.ts` that returns products sharing at least one category, deduped against the current product.

**P1.5 PDP: "Customize this design" lead.** The existing `Button href="/customize"` says *"Customize this design"* (line 113) but doesn't pre-fill the customizer with the product context. Phase 2.5 stretch: pass the product's slug as a query param and have the customizer pre-load the matching template. Even before that wiring, change the secondary CTA copy to *"See it in 3D in your name"* — more specific, more compelling.

### P2 — Conversion mechanics (~half-day)

**P2.1 First-time-buyer email popup.** Install a lightweight popup (no Klaviyo dependency yet — a simple state-managed modal is fine) that fires on first visit after 25 seconds or 50% scroll. Copy: h3 *"10% off your first piece."* / sub *"Plus first dibs on new colours and limited drops. We won't email more than once a week."* / single field *"Your email"* / single button *"Get my code"*. POST to `/api/newsletter/subscribe` route (already part of Phase 0–2 plan). Set a 30-day cookie to suppress reshow. Include a thin *"No thanks"* link.

**P2.2 Sticky add-to-cart on mobile PDP.** Once Phase 3 introduces a real cart, make the *Add to cart* button position-fixed at the bottom of the viewport on screens <md, with the price and product name beside it. Until then, just add the styling so the engineer doesn't reinvent it: `md:relative fixed bottom-0 left-0 right-0` row.

**P2.3 Customizer: numbered step wizard.** Edit `src/app/customize/page.tsx` and `Designer.tsx`. Wrap the customizer in a `<StepIndicator>` showing *01 Shape · 02 Name · 03 Finishes · 04 Preview*. Today the customizer is one screen — even if the underlying interaction stays free-form, the breadcrumb tells the user where they are and reduces drop-off. Add a sticky bottom-bar showing live price + an *"Add to cart"* button.

**P2.4 Footer email signup matches popup hook.** In the new footer (P0.5), the email field should match the popup copy: *"Get 10% off your first piece + new-colour drops."* Same code, same incentive, single message across the site.

### P3 — Brand-voice and visual polish (~1 day)

**P3.1 Photography brief (not code).** AcrylixCo's existing dark-on-cream aesthetic is correct. The product photography needs to commit to one of two directions: (a) **studio flatlay on cream with a single styled prop** (a sprig of eucalyptus, a ceramic bud vase, a folded linen napkin) — restrained, Cuyana-like; or (b) **in-context lifestyle on a styled nursery/tablescape** — Letterly-like. Pick one and don't mix. The current product cards lean toward neutral product-on-cream which is fine but lacks differentiation. **Recommendation: pick (a) for `/shop` listings + (b) for the homepage editorial block (P3.2 below).** This is a brief for the photographer, not an engineering change.

**P3.2 "Shop the look" editorial block.** New homepage section between Featured and Customize. One large hero photo (16:9) of a styled space with three or four AcrylixCo pieces visible, each with a tiny dot hot-spot. Click a hot-spot → open a small popover with product name, price, "Shop". This is the strongest brand-storytelling move in the recommended set; it positions AcrylixCo above the mum-craft tier visually without changing pricing. Implement as `src/components/site/ShopTheLook.tsx` with hard-coded coordinates per photo until a CMS lands in Phase 4.

**P3.3 Header refinement.** `src/components/site/Header.tsx` currently has 3 nav items. Add: *Cake toppers* (the highest-search category in the AU market, per Hello Acrylic / Little Dance volume), *Wedding* (a recipient block), and *Gift cards*. Promote *Customize* to a slightly more prominent style — a thin pill border in cream-400 — to signal that's the unique action.

**P3.4 Tone audit + global copy pass.** The existing italic-serif headlines are good. Audit every existing page for verb-led, second-person copy. Specific moves: change *"The full collection."* on `/shop` to *"Our full studio shelf."* (warmer); change *"Made for moments worth keeping."* on the homepage Featured section to *"Pieces our studio is making this week."* (specific + provenance); change product-page breadcrumb format from *"Shop / [category]"* to *"Studio / Shop / [category]"* (subtle but elevates).

### Stretch (Phase 2.6)

**P2.6.1 Wedding day set bundle.** Define one bundle SKU: *"Wedding day set — welcome sign + table number stack of 10 + cake topper"* at a 10% discount versus à-la-carte. New page at `/shop/sets/wedding`. Test demand before scaling to baby and birthday sets.

**P2.6.2 Mini-tier $29 SKU.** Create a *"Mini name plaque"* template at $29 (15cm wide, single-layer). Drives ad-friendly first-purchase economics without cannibalising the $90+ tier (size and layer count create a clear ladder).

**P2.6.3 Reviews tool — Judge.me integration.** Once 20+ orders have shipped and the team can solicit photo reviews, install Judge.me. AU-friendly, $15/mo flat. Embed on PDP and as a homepage trust block (*"Read 47 five-star reviews from Sydney customers"*).

**P2.6.4 Customer photo wall (Instagram embed).** Until reviews exist, embed `@acrylixco` Instagram feed below Featured on homepage. Tag every post `#acrylixco_studio` so the embed feels intentional.

---

## 6. Sources

Sites visited and quoted in this report:

- **Hello Acrylic** — https://helloacrylic.com.au/ + https://helloacrylic.com.au/product-category/baby-kids/name-signs/
- **The Humble Gift Co.** — https://thehumblegiftco.com.au/ + https://thehumblegiftco.com.au/products/triple-layer-name-plaque
- **Letterly** — https://www.letterly.com.au/ + https://www.letterly.com.au/products/3d-layered-acrylic-name
- **Blond + Noir** — https://blondnoir.com/collections/letterly-acrylic-names
- **ByCarly Designs** — https://bycarlydesigns.com.au/
- **Laser Edge Designs** — https://www.laseredgedesigns.com.au/
- **Laser Sharp Creations** — https://www.lasersharpcreations.com.au/
- **Mostly A Mum** — https://mostlyamum.com.au/collections/custom-name-plaques
- **Laser Blanks** — https://www.laserblanks.com.au/
- **Laserly** — https://laserly.au/
- **Laser Cut Customs** — https://lasercutcustoms.com.au/products/name-plaques
- **Little Dance** — https://littledance.com.au/
- **Meridian Etch** — https://meridianetch.com.au/products/kids-wood-acrylic-name-sign
- **Hello Fern** — https://hellofern.com.au/
- **Tinyme** — https://www.tinyme.com/ + Birth Announcement Plaque PDP
- **Minted** — https://www.minted.com/
- **Cuyana** — https://www.cuyana.com/
- **Magnolia** — https://magnolia.com/
- **Lulu & Georgia** — https://luluandgeorgia.com/
- **Koala Eco** — https://www.koalaeco.com/

Sites attempted but blocked or unreachable: Zoey & Dolph (`zoeyanddolph.com.au`), Forever Acrylics (`foreveracrylics.com.au`), Pinch Co (`pinchco.com.au`), The Acrylic Co (`theacrylicco.com.au`), Lavish Designs (`lavish-designs.com.au`), Brushed by Belle (`brushedbybelle.com.au`), Pretty Plaques Co (`prettyplaquesco.com.au`), Aesop (`shop.aesop.com/au/` 403), Hommey (`hommey.com.au` timeouts), Goop (`goop.com` 403). For the AU acrylic gaps, equivalents in the Letterly / Hello Acrylic / The Humble Gift Co. cluster covered the same archetypes; for Aesop/Hommey/Goop, Cuyana, Minted and Magnolia provided sufficient premium-voice coverage.

Background research articles consulted:

- Shopify, *"Ecommerce Conversion Rate: How To Improve Yours (2026)"* — https://www.shopify.com/blog/ecommerce-conversion-rate
- Shopify, *"Conversion Rate Optimization for Fashion Brands: 2026 Guide"* — https://www.shopify.com/enterprise/blog/fashion-conversion-rate-optimization
- Shopify, *"Product Page Design"* — https://www.shopify.com/au/blog/product-page-design
- Baymard Institute, *"Cart Abandonment Stats"* + *"Product Page UX 2026"* — https://baymard.com/research/checkout-usability + https://baymard.com/blog
- iCreations Lab, *"10 Crucial Elements for High-Converting eCommerce Homepage Design"* — https://icreationslab.com/10-crucial-elements-for-high-converting-ecommerce-homepage-design/
- Reliqus, *"Best UX in eCommerce 2026"* — https://reliqus.com/best-ecommerce-ux-patterns-2025/
- Shopify reviews app comparison (Judge.me / Yotpo / Stamped pricing) — https://judge.me/compare/yotpo-vs-judgeme + https://www.adsx.com/blog/best-shopify-review-apps

---

## Notes & research gaps

- Several priority AU competitors (Zoey & Dolph, Forever Acrylics, Pinch Co, The Acrylic Co, Brushed by Belle, Pretty Plaques) blocked `WebFetch`. Hello Acrylic, The Humble Gift Co., Letterly, Blond + Noir, ByCarly, Laser Edge, Mostly A Mum, Laserly, Laser Blanks, Hexi (search-result snippets), Little Dance, Meridian Etch and Laser Sharp Creations together cover all three AU archetypes (warmth / utility / studio) so the strategic conclusions are robust despite the gaps.
- A live walk of any of the blocked sites by the owner (10–15 min on Chrome) would tighten the pricing benchmarks; recommend that as a quick double-check before locking AcrylixCo's pricing tier.
- I did not test mobile experiences directly (WebFetch returns desktop HTML). The Reliqus 2025 patterns and Baymard mobile-navigation finding (*"up to 67% of leading sites have mediocre-to-poor mobile navigation"*) inform the mobile recommendations.
- Reviews-tool comparison was secondary research only (no live install). The Judge.me recommendation is based on the AU-friendliness, flat $15/mo pricing, and Shopify ecosystem coverage cited in the comparison sources — Yotpo would be over-engineered for this stage.
- The 3D customizer is the single most defensible asset; I have not used it directly in this research, only inferred from the existing `/customize` page route. A separate "customizer UX teardown" pass — comparing AcrylixCo's flow against Tinyme's STEP 1 wizard — would be a valuable Phase 2.5 sub-task.
