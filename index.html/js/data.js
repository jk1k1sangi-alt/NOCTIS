/* ==========================================================================
   NOCTIS — Catalogue & Maison Data
   Single source of truth for product, boutique, heritage and editorial content.
   ========================================================================== */

const NOCTIS = (() => {
  'use strict';

  /* ---------------------------------------------------------------- BRAND */
  const brand = {
    name: 'NOC TIS'.replace(' ', ''),
    legal: 'Noctis Manufacture Horlogère SA',
    founded: 1874,
    city: 'Genève',
    tagline: 'Measured in darkness.',
    address: '14 Rue du Rhône, 1204 Genève, Suisse',
    phone: '+41 22 000 18 74',
    email: 'concierge@noctis.ch',
    calibrePrefix: 'NCT'
  };

  /* --------------------------------------------------- SHARED CONFIG SETS */
  const CASE_METALS = {
    ti:  { id: 'ti',  label: 'Grade-5 Titanium',  short: 'Titanium',   swatch: 'linear-gradient(140deg,#B9BEC4,#6E737B 55%,#8E939A)' },
    st:  { id: 'st',  label: '904L Stainless Steel', short: 'Steel',   swatch: 'linear-gradient(140deg,#D6DAE0,#8B9098 55%,#AEB3BA)' },
    rg:  { id: 'rg',  label: '5N Rose Gold',      short: 'Rose Gold',  swatch: 'linear-gradient(140deg,#F0CFA4,#C08A55 58%,#D8A874)' },
    dlc: { id: 'dlc', label: 'Black DLC Titanium', short: 'Black DLC', swatch: 'linear-gradient(140deg,#4A4E55,#191B1F 60%,#2C2F34)' },
    pt:  { id: 'pt',  label: '950 Platinum',      short: 'Platinum',   swatch: 'linear-gradient(140deg,#E4E7EA,#9DA3AA 58%,#C3C8CD)' }
  };

  const DIALS = {
    midnight: { id: 'midnight', label: 'Midnight Blue', swatch: 'radial-gradient(circle at 35% 28%,#2E5C93,#0B1B31 72%)' },
    obsidian: { id: 'obsidian', label: 'Obsidian',      swatch: 'radial-gradient(circle at 35% 28%,#2A2D33,#07080A 72%)' },
    opaline:  { id: 'opaline',  label: 'Opaline',       swatch: 'radial-gradient(circle at 35% 28%,#FBF8F2,#D8D2C6 74%)' },
    slate:    { id: 'slate',    label: 'Slate Grey',    swatch: 'radial-gradient(circle at 35% 28%,#6C737C,#33383F 74%)' },
    abyss:    { id: 'abyss',    label: 'Abyss Black',   swatch: 'radial-gradient(circle at 35% 28%,#242A2E,#050607 74%)' },
    jade:     { id: 'jade',     label: 'Submerged Green',swatch: 'radial-gradient(circle at 35% 28%,#3E6B54,#101F18 74%)' },
    ruten:    { id: 'ruten',    label: 'Ruthenium',     swatch: 'radial-gradient(circle at 35% 28%,#575C63,#1B1E22 74%)' },
    ivory:    { id: 'ivory',    label: 'Aged Ivory',    swatch: 'radial-gradient(circle at 35% 28%,#F3EBDC,#C9BCA4 76%)' }
  };

  const STRAPS = {
    alligator: { id: 'alligator', label: 'Alligator, hand-stitched', short: 'Alligator',
      swatch: 'repeating-linear-gradient(115deg,#232427 0 7px,#141518 7px 14px)',
      note: 'Square-scale, matte noir' },
    rubber:    { id: 'rubber', label: 'Vulcanised rubber', short: 'Rubber',
      swatch: 'radial-gradient(circle at 30% 25%,#25313F,#0C131B 70%)',
      note: 'Tropical texture, integrated' },
    bracelet:  { id: 'bracelet', label: 'Integrated bracelet', short: 'Bracelet',
      swatch: 'linear-gradient(135deg,#D2D7DD 0 18%,#8A9099 18% 34%,#C3C8CE 34% 50%,#7E848C 50% 66%,#BFC4CA 66% 82%,#878D95 82%)',
      note: 'Micro-adjust deployant' },
    calf:      { id: 'calf', label: 'Box calf, saddle-stitched', short: 'Calf',
      swatch: 'repeating-linear-gradient(75deg,#8A5A34 0 9px,#6E4527 9px 18px)',
      note: 'Vegetable-tanned, cognac' },
    textile:   { id: 'textile', label: 'Woven technical textile', short: 'Textile',
      swatch: 'repeating-linear-gradient(45deg,#5B6167 0 4px,#3C4147 4px 8px),repeating-linear-gradient(-45deg,#4A5056 0 4px,#33383D 4px 8px)',
      note: 'Grey, water-resistant' },
    satin:     { id: 'satin', label: 'Double satin, midnight', short: 'Satin',
      swatch: 'linear-gradient(115deg,#111C33,#20304F 45%,#0B1220)',
      note: 'Silk-blend, evening weight' }
  };

  const ENGRAVING = {
    none:     { id: 'none',     label: 'No engraving',                 max: 0 },
    caseback: { id: 'caseback', label: 'Hand-engraved caseback',    max: 24, note: 'Cut by hand in the atelier, three weeks' },
    rotor:    { id: 'rotor',    label: 'Engraved oscillating weight',max: 32, note: 'Visible through the sapphire back' }
  };

  /* --------------------------------------------------------------- CALIBRES */
  const calibres = {
    'NCT-01': {
      name: 'Calibre NCT-01',
      type: 'Automatic, in-house',
      reserve: 72, frequency: 28800, jewels: 31, components: 218,
      thickness: '4.10 mm',
      finishing: 'Geneva stripes, hand-bevelled bridges, blued screws, gold chatons',
      note: 'The maison’s founding calibre, re-engineered in 2021 with a silicon escape wheel.'
    },
    'NCT-04': {
      name: 'Calibre NCT-04',
      type: 'Automatic GMT, in-house',
      reserve: 68, frequency: 28800, jewels: 34, components: 276,
      thickness: '4.85 mm',
      finishing: 'Côtes de Genève circulaires, black-polished screws',
      note: 'A true second time zone, jumping hour hand, no date correction window.'
    },
    'NCT-07': {
      name: 'Calibre NCT-07',
      type: 'Automatic diver, in-house',
      reserve: 80, frequency: 28800, jewels: 29, components: 246,
      thickness: '5.20 mm',
      finishing: 'Sandblasted bridges, rhodium-plated, lumed crown gasket',
      note: 'Certified to 300 metres. Tested beyond it, by a margin we do not publish.'
    },
    'NCT-11': {
      name: 'Calibre NCT-11',
      type: 'Hand-wound flying tourbillon',
      reserve: 100, frequency: 21600, jewels: 41, components: 312,
      thickness: '5.60 mm',
      finishing: 'Skeletonised bridges, hand-chamfered, 41 jewels, mirror-polished steel',
      note: 'Sixty hours of hand-finishing per movement. Eight leave the atelier each year.'
    }
  };

  /* ------------------------------------------------------------- CATALOGUE */
  /* Each family is a lineage; references are the purchasable object. */
  const products = [
    {
      id: 'eclipse-ti-blue',
      ref: 'NCT-ECL-39-TI-BLU',
      family: 'Éclipse',
      name: 'Éclipse 39',
      variant: 'Titanium · Midnight Blue',
      tagline: 'Where the light goes.',
      price: 18400,
      image: 'assets/img/product-eclipse.jpg',
      thumb: 'assets/img/sm/product-eclipse.jpg',
      badge: 'Signature',
      collection: 'Éclipse',
      material: 'ti',
      dial: 'midnight',
      size: '39 mm',
      calibre: 'NCT-01',
      edition: 240,
      remaining: 34,
      availability: 'limited',
      lead: 'The reference that defined the house. A midnight dial lacquered in nine passes, set in brushed Grade-5 titanium, quietly indifferent to attention.',
      story: [
        'Éclipse began as a private commission in 2019: a client asked for a watch that would disappear into a dinner jacket and reappear only when consulted. The maison answered with a dial governed by darkness — nine layers of lacquer over a sunray-brushed plate, each pass cured for twenty hours.',
        'At 39 millimetres and 8.9 millimetres tall, the case is finished on three surfaces that never meet without a bevel between them. The lugs are drawn in a single continuous line, polished by hand for forty minutes each.'
      ],
      specs: {
        'Case': 'Grade-5 titanium, brushed & polished',
        'Diameter': '39 mm',
        'Thickness': '8.90 mm',
        'Lug to lug': '45.20 mm',
        'Dial': 'Midnight blue lacquer, nine passes',
        'Crystal': 'Double-domed sapphire, both sides AR-coated',
        'Water resistance': '100 m',
        'Movement': 'Calibre NCT-01',
        'Power reserve': '72 hours',
        'Frequency': '28,800 A/h · 4 Hz',
        'Strap': 'Alligator, titanium deployant',
        'Edition': '240 pieces per year'
      },
      config: {
        case: ['ti', 'rg', 'dlc'],
        dial: ['midnight', 'obsidian', 'opaline'],
        strap: ['alligator', 'satin', 'calf', 'bracelet'],
        engrave: ['none', 'caseback', 'rotor']
      }
    },
    {
      id: 'eclipse-rg-opaline',
      ref: 'NCT-ECL-39-RG-OPA',
      family: 'Éclipse',
      name: 'Éclipse 39 Or Rose',
      variant: 'Rose Gold · Opaline',
      tagline: 'The same restraint, at dawn.',
      price: 34900,
      image: 'assets/img/product-eclipse-rg.jpg',
      thumb: 'assets/img/sm/product-eclipse-rg.jpg',
      badge: 'New',
      collection: 'Éclipse',
      material: 'rg',
      dial: 'opaline',
      size: '39 mm',
      calibre: 'NCT-01',
      edition: 90,
      remaining: 11,
      availability: 'limited',
      lead: 'In 5N rose gold with a silver-white opaline dial, Éclipse turns from shadow to warmth without raising its voice.',
      story: [
        'The opaline dial is galvanically deposited, then brushed in concentric passes around the centre so that light moves across it like breath on glass. Rose gold catches differently: indices are polished to a black mirror, releasing single points of light.',
        'Ninety pieces a year. Each case is hand-finished in a single sitting by one artisan, whose initials are registered against the reference.'
      ],
      specs: {
        'Case': '5N rose gold, polished & brushed',
        'Diameter': '39 mm',
        'Thickness': '8.90 mm',
        'Lug to lug': '45.20 mm',
        'Dial': 'Silver-white opaline, concentric brushed',
        'Crystal': 'Double-domed sapphire, both sides AR-coated',
        'Water resistance': '100 m',
        'Movement': 'Calibre NCT-01',
        'Power reserve': '72 hours',
        'Frequency': '28,800 A/h · 4 Hz',
        'Strap': 'Alligator cognac, rose gold buckle',
        'Edition': '90 pieces per year'
      },
      config: {
        case: ['rg', 'pt'],
        dial: ['opaline', 'ivory', 'midnight'],
        strap: ['alligator', 'calf', 'satin'],
        engrave: ['none', 'caseback', 'rotor']
      }
    },
    {
      id: 'abime-42-steel',
      ref: 'NCT-ABM-42-ST-ABY',
      family: 'Abîme',
      name: 'Abîme 42',
      variant: 'Steel · Abyss Black',
      tagline: 'Pressure is a form of patience.',
      price: 12900,
      image: 'assets/img/product-abyss.jpg',
      thumb: 'assets/img/sm/product-abyss.jpg',
      badge: null,
      collection: 'Abîme',
      material: 'st',
      dial: 'abyss',
      size: '42 mm',
      calibre: 'NCT-07',
      edition: 480,
      remaining: 156,
      availability: 'available',
      lead: 'A diver built without ornament. Ceramic bezel, ghost-grey Super-LumiNova, and a bracelet whose clasp we redesigned eleven times.',
      story: [
        'Abîme was developed with three saturation divers over four years. The bezel rotates in 120 clicks — no backplay, no rattle — and the grip is machined rather than knurled so that gloves find purchase without tearing.',
        'The dial is a matte black that absorbs light, which is the only way to make pale luminous material read as bright. At 300 metres it does not change character. We have tested it lower; we simply do not say how much lower.'
      ],
      specs: {
        'Case': '904L stainless steel, brushed',
        'Diameter': '42 mm',
        'Thickness': '12.40 mm',
        'Lug to lug': '49.00 mm',
        'Bezel': 'Black ceramic, 120 clicks, unidirectional',
        'Dial': 'Matte abyss black, mint Super-LumiNova X1',
        'Water resistance': '300 m',
        'Movement': 'Calibre NCT-07',
        'Power reserve': '80 hours',
        'Frequency': '28,800 A/h · 4 Hz',
        'Bracelet': 'Integrated steel, micro-adjust clasp',
        'Edition': '480 pieces per year'
      },
      config: {
        case: ['st', 'ti', 'dlc'],
        dial: ['abyss', 'jade', 'slate'],
        strap: ['bracelet', 'rubber', 'textile'],
        engrave: ['none', 'caseback']
      }
    },
    {
      id: 'abime-42-jade',
      ref: 'NCT-ABM-42-ST-JAD',
      family: 'Abîme',
      name: 'Abîme 42 Vert',
      variant: 'Steel · Submerged Green',
      tagline: 'The colour of forty metres.',
      price: 13600,
      image: 'assets/img/product-abyss-jade.jpg',
      thumb: 'assets/img/sm/product-abyss-jade.jpg',
      badge: null,
      collection: 'Abîme',
      material: 'st',
      dial: 'jade',
      size: '42 mm',
      calibre: 'NCT-07',
      edition: 180,
      remaining: 42,
      availability: 'limited',
      lead: 'A dial drawn from bathymetric charts of the Ligurian shelf — green that collapses to black at the edges.',
      story: [
        'The gradient is achieved by hand: a base coat of deep forest green, then a translucent black vignette airbrushed from the rim inward. No two dials register identically, and the maison considers this the point.',
        'An annual series of 180. When the series closes, the tooling is retired.'
      ],
      specs: {
        'Case': '904L stainless steel, brushed',
        'Diameter': '42 mm',
        'Thickness': '12.40 mm',
        'Lug to lug': '49.00 mm',
        'Bezel': 'Black ceramic, 120 clicks, unidirectional',
        'Dial': 'Fumé green to black, airbrushed by hand',
        'Water resistance': '300 m',
        'Movement': 'Calibre NCT-07',
        'Power reserve': '80 hours',
        'Frequency': '28,800 A/h · 4 Hz',
        'Bracelet': 'Integrated steel, micro-adjust clasp',
        'Edition': '180 pieces per year'
      },
      config: {
        case: ['st', 'ti', 'dlc'],
        dial: ['jade', 'abyss'],
        strap: ['bracelet', 'rubber', 'textile'],
        engrave: ['none', 'caseback']
      }
    },
    {
      id: 'meridien-rg',
      ref: 'NCT-MER-39-RG-OPA',
      family: 'Méridien',
      name: 'Méridien 39',
      variant: 'Rose Gold · Opaline',
      tagline: 'Two horizons, one wrist.',
      price: 41200,
      image: 'assets/img/product-meridian.jpg',
      thumb: 'assets/img/sm/product-meridian.jpg',
      badge: 'Signature',
      collection: 'Méridien',
      material: 'rg',
      dial: 'opaline',
      size: '39 mm',
      calibre: 'NCT-04',
      edition: 60,
      remaining: 6,
      availability: 'limited',
      lead: 'A true GMT in rose gold, with a two-tone 24-hour bezel in green enamel and champagne gold.',
      story: [
        'The Méridien was made for the maison’s travelling clients — those who cross eight time zones without adjusting their expectations. The hour hand jumps independently; the date follows it, correctly, in both directions.',
        'The 24-hour bezel is fired enamel over a gold base, a process with a failure rate that our atelier declines to discuss except to say it is high.'
      ],
      specs: {
        'Case': '5N rose gold, polished',
        'Diameter': '39 mm',
        'Thickness': '10.60 mm',
        'Lug to lug': '46.40 mm',
        'Bezel': 'Two-tone grand feu enamel, 24 hours',
        'Dial': 'Silver-white opaline, applied gold indices',
        'Water resistance': '100 m',
        'Movement': 'Calibre NCT-04',
        'Power reserve': '68 hours',
        'Frequency': '28,800 A/h · 4 Hz',
        'Strap': 'Alligator cognac, rose gold pin buckle',
        'Edition': '60 pieces per year'
      },
      config: {
        case: ['rg', 'pt'],
        dial: ['opaline', 'ivory', 'ruten'],
        strap: ['alligator', 'calf', 'satin'],
        engrave: ['none', 'caseback', 'rotor']
      }
    },
    {
      id: 'meridien-steel',
      ref: 'NCT-MER-39-ST-SLA',
      family: 'Méridien',
      name: 'Méridien 39 Acier',
      variant: 'Steel · Slate',
      tagline: 'A quieter longitude.',
      price: 16800,
      image: 'assets/img/product-meridian-st.jpg',
      thumb: 'assets/img/sm/product-meridian-st.jpg',
      badge: null,
      collection: 'Méridien',
      material: 'st',
      dial: 'slate',
      size: '39 mm',
      calibre: 'NCT-04',
      edition: 300,
      remaining: 88,
      availability: 'available',
      lead: 'The traveller’s complication in 904L steel, with a slate dial that reads as graphite in daylight and near-black after dark.',
      story: [
        'What the rose gold reference asserts, this one simply states. The enamel bezel gives way to a matte ceramic 24-hour scale; the dial is a slate grey with a fine vertical brush, so the hands stand clear of it at any angle.',
        'Intended to be worn, not stored. The maison services it for as long as it is owned.'
      ],
      specs: {
        'Case': '904L stainless steel, brushed & polished',
        'Diameter': '39 mm',
        'Thickness': '10.60 mm',
        'Lug to lug': '46.40 mm',
        'Bezel': 'Ceramic, 24 hours, matte',
        'Dial': 'Slate grey, vertical brushed',
        'Water resistance': '100 m',
        'Movement': 'Calibre NCT-04',
        'Power reserve': '68 hours',
        'Frequency': '28,800 A/h · 4 Hz',
        'Bracelet': 'Integrated steel, micro-adjust clasp',
        'Edition': '300 pieces per year'
      },
      config: {
        case: ['st', 'ti'],
        dial: ['slate', 'midnight', 'obsidian'],
        strap: ['bracelet', 'alligator', 'rubber', 'textile'],
        engrave: ['none', 'caseback', 'rotor']
      }
    },
    {
      id: 'vide-dlc',
      ref: 'NCT-VID-42-DLC-RUT',
      family: 'Vide',
      name: 'Vide Tourbillon',
      variant: 'Black DLC · Ruthenium',
      tagline: 'Nothing to hide behind.',
      price: 185000,
      image: 'assets/img/product-void.jpg',
      thumb: 'assets/img/sm/product-void.jpg',
      badge: 'Atelier',
      collection: 'Vide',
      material: 'dlc',
      dial: 'ruten',
      size: '42 mm',
      calibre: 'NCT-11',
      edition: 8,
      remaining: 2,
      availability: 'allocation',
      lead: 'A skeletonised flying tourbillon in black DLC titanium. Sixty hours of hand-finishing per movement; eight pieces a year.',
      story: [
        'Vide is the maison’s argument that structure can be beautiful when it is honest. Every bridge is skeletonised to the minimum section its stress analysis permits, then chamfered by hand until each edge holds a single unbroken line of light.',
        'The flying tourbillon is cantilevered from one side only — a construction that removes material and demands a stiffer cage. The balance beats at 3 Hz, slowly enough to watch.',
        'Eight movements leave the atelier each year. Allocation is offered first to clients with an existing relationship, then by waitlist.'
      ],
      specs: {
        'Case': 'Black DLC titanium, micro-blasted',
        'Diameter': '42 mm',
        'Thickness': '11.20 mm',
        'Lug to lug': '48.60 mm',
        'Dial': 'Smoked sapphire, skeletonised',
        'Complication': 'Flying tourbillon, 60-second',
        'Water resistance': '50 m',
        'Movement': 'Calibre NCT-11, hand-wound',
        'Power reserve': '100 hours',
        'Frequency': '21,600 A/h · 3 Hz',
        'Components': '312, hand-finished',
        'Edition': '8 pieces per year'
      },
      config: {
        case: ['dlc', 'ti', 'pt'],
        dial: ['ruten', 'obsidian'],
        strap: ['rubber', 'alligator', 'satin'],
        engrave: ['none', 'caseback', 'rotor']
      }
    },
    {
      id: 'vide-platinum',
      ref: 'NCT-VID-42-PT-IVO',
      family: 'Vide',
      name: 'Vide Nuit Blanche',
      variant: 'Platinum · Aged Ivory',
      tagline: 'The smallest edition we have ever made.',
      price: 265000,
      image: 'assets/img/product-void-pt.jpg',
      thumb: 'assets/img/sm/product-void-pt.jpg',
      badge: '3 pieces',
      collection: 'Vide',
      material: 'pt',
      dial: 'ivory',
      size: '42 mm',
      calibre: 'NCT-11',
      edition: 3,
      remaining: 1,
      availability: 'allocation',
      lead: '950 platinum with an ivory skeletonised dial and a solid gold tourbillon bridge. Three pieces only.',
      story: [
        'Commissioned by a collector in Kyoto and released, with his permission, as a series of three. The ivory dial is a matte grand feu lacquer with the bridges cut through it; the tourbillon bridge is solid 18k gold, mirror-finished.',
        'Two are allocated. One remains. It is available by conversation, not by button.'
      ],
      specs: {
        'Case': '950 platinum, polished',
        'Diameter': '42 mm',
        'Thickness': '11.20 mm',
        'Lug to lug': '48.60 mm',
        'Dial': 'Ivory grand feu lacquer, skeletonised',
        'Complication': 'Flying tourbillon, 60-second',
        'Water resistance': '50 m',
        'Movement': 'Calibre NCT-11, hand-wound',
        'Power reserve': '100 hours',
        'Frequency': '21,600 A/h · 3 Hz',
        'Components': '312, hand-finished',
        'Edition': '3 pieces, total'
      },
      config: {
        case: ['pt', 'dlc'],
        dial: ['ivory', 'ruten'],
        strap: ['alligator', 'satin'],
        engrave: ['none', 'caseback']
      }
    }
  ];


  /* ----------------------------------------------------- THE REGISTER
     The site is one continuous document. Each stage of the client journey is a
     numbered folio in the maison's register — the same ledger kept by hand
     since 1874. Pages declare which folios they contain; the spine in the
     gutter tracks the reader's position, and the handoff closes each folio by
     naming the next. This is the narrative spine of the whole experience. */
  const journey = [
    { n: 'I',   roman: 1, title: 'The House', note: 'Brand', stage: 'Brand',
      href: 'index.html', pages: ['index'], from: null,
      lead: 'A Geneva workshop that kept the night shift.' },

    { n: 'II',  roman: 2, title: 'The Object', note: 'Hero', stage: 'Hero',
      href: 'index.html#folio-object', pages: [], from: 'The House',
      lead: 'Eight references a year, allocated before they are advertised.' },

    { n: 'III', roman: 3, title: 'The Origin', note: 'Story', stage: 'Story',
      href: 'heritage.html', pages: ['heritage'], from: 'The Object',
      lead: 'One hundred and fifty-two years, five generations, one address.' },

    { n: 'IV',  roman: 4, title: 'The Series', note: 'Collection', stage: 'Collection',
      href: 'collection.html', pages: ['collection'], from: 'The Origin',
      lead: 'Four families. Eight references. A single annual series each.',
      handoff: {
        title: 'Before it can be configured, it has to be made',
        copy: 'Four watchmakers, five hundred hours, and one engine lathe from 1912. The argument for the object begins in the finishing room.',
        cta: 'Enter the atelier', href: 'craft.html'
      } },

    { n: 'V',   roman: 5, title: 'The Hand', note: 'Craftsmanship', stage: 'Craftsmanship',
      href: 'craft.html', pages: ['craft'], from: 'The Series',
      lead: 'Skeletonising, chamfering, engine-turning, lacquer, regulation.',
      handoff: {
        title: 'Finishing is only an argument until you look at the object',
        copy: 'Every reference is configurable — case metal, dial, strap, and a hand-cut engraving recorded in the register.',
        cta: 'Examine a reference', href: 'product.html?ref=NCT-ECL-39-TI-BLU'
      } },

    { n: 'VI',  roman: 6, title: 'The Reference', note: 'Product detail & configuration', stage: 'Product detail',
      href: 'product.html', pages: ['product'], from: 'The Hand',
      lead: 'Specify it. The case number is reserved to you for seventy-two hours.',
      handoff: {
        title: 'Reserve it, or hold it',
        copy: 'Adding a reference reserves it while a maison advisor confirms the allocation, the lead time and the case number in writing.',
        cta: 'Review your bag', href: 'cart.html'
      } },

    { n: 'VII', roman: 7, title: 'The Acquiring', note: 'Interaction, bag & checkout', stage: 'Checkout',
      href: 'checkout.html', pages: ['cart', 'checkout'], from: 'The Reference',
      lead: 'No payment is taken until an advisor confirms the allocation.',
      handoff: {
        title: 'Begin again',
        copy: 'The register is closed for now. Eight references a year, and none forthcoming beyond them.',
        cta: 'Return to Folio I', href: 'index.html'
      } }
  ];

  /* Off-spine pages are appendices to the register, so nothing on the site
     falls outside the fiction of a single document. */
  const appendices = {
    journal:      { n: 'A', title: 'Notes from the bench', from: 'The Hand' },
    boutiques:    { n: 'B', title: 'The Rooms',            from: 'The House' },
    contact:      { n: 'C', title: 'Correspondence',       from: 'The Register' },
    'not-found':  { n: '—', title: 'Not in the register',  from: null }
  };

  /* The commercial path, shown on commerce pages so buying reads as the closing
     movement of the same story rather than a separate shop. */
  const acquisition = [
    { key: 'discover',  label: 'Discover',  href: 'collection.html' },
    { key: 'configure', label: 'Configure', href: 'product.html' },
    { key: 'bag',       label: 'Bag',       href: 'cart.html' },
    { key: 'confirm',   label: 'Confirm',   href: 'checkout.html' }
  ];

  /* --------------------------------------------------------------- SERVICES */
  const services = [
    {
      n: '01', title: 'Lifetime servicing',
      text: 'Every Noctis is serviced by the maison for as long as it is owned, by the hand that assembled it where possible. First service at eight years, thereafter every five.'
    },
    {
      n: '02', title: 'Five-year international warranty',
      text: 'Extended to eight years on registration. Covers movement, case, crystal and water resistance, transferable with the watch.'
    },
    {
      n: '03', title: 'Insured worldwide delivery',
      text: 'Collected in person at a boutique, or hand-delivered by a maison courier in a sealed case. Signature required, identities verified.'
    },
    {
      n: '04', title: 'Provenance register',
      text: 'Each watch is entered in the maison’s register under its reference and case number. Ownership transfers are recorded, not erased.'
    }
  ];

  /* -------------------------------------------------------------- BOUTIQUES */
  const boutiques = [
    { city: 'Genève',    country: 'Switzerland', address: '14 Rue du Rhône, 1204', phone: '+41 22 000 18 74', hours: 'Mon–Sat, 10:00–19:00', flagship: true,  image: 'assets/img/boutique-01.jpg' },
    { city: 'New York',  country: 'United States', address: '9 East 57th Street, NY 10022', phone: '+1 212 555 0174', hours: 'Mon–Sat, 10:00–18:00', flagship: false, image: 'assets/img/boutique-01.jpg' },
    { city: 'Tokyo',     country: 'Japan', address: 'Ginza 4-chōme, Chūō-ku', phone: '+81 3 5555 1874', hours: 'Tue–Sun, 11:00–19:00', flagship: false, image: 'assets/img/boutique-01.jpg' },
    { city: 'Dubai',     country: 'UAE', address: 'Fashion Avenue, Dubai Mall', phone: '+971 4 555 1874', hours: 'Daily, 10:00–22:00', flagship: false, image: 'assets/img/boutique-01.jpg' },
    { city: 'Paris',     country: 'France', address: '8 Place Vendôme, 75001', phone: '+33 1 55 55 1874', hours: 'Mon–Sat, 10:30–19:00', flagship: false, image: 'assets/img/boutique-01.jpg' },
    { city: 'Zürich',    country: 'Switzerland', address: 'Bahnhofstrasse 42, 8001', phone: '+41 44 555 1874', hours: 'Mon–Fri, 10:00–18:30', flagship: false, image: 'assets/img/boutique-01.jpg' }
  ];

  /* --------------------------------------------------------------- HERITAGE */
  const timeline = [
    { year: '1874', title: 'A workshop on the Rhône', text: 'Élodie Noctis opens a two-bench workshop restoring marine chronometers for the Genoese shipping trade. She keeps the night shift.' },
    { year: '1911', title: 'Calibre NB-3', text: 'The maison’s first in-house movement is delivered to the Swiss observatory trials and finishes in the top ten — on its first attempt.' },
    { year: '1938', title: 'The black dials', text: 'A commission for night-shift pilots produces the maison’s earliest matte black dials. Legibility in darkness becomes an obsession, then a specialism.' },
    { year: '1968', title: 'Abîme prototype', text: 'A diver’s watch rated to 200 metres, tested in the Ligurian Sea by a crew who refused to hand it back for eleven months.' },
    { year: '1994', title: 'The moon phase of record', text: 'A one-off astronomical watch deviates by one day every 122 years. It is still owned by the family that commissioned it.' },
    { year: '2019', title: 'Éclipse', text: 'Nine passes of lacquer, twenty hours of curing each. The watch that defines the house’s modern voice: quiet, dark, exact.' },
    { year: '2024', title: 'Guilloché studio', text: 'A restored 1912 straight-line engine lathe is brought back into service. One artisan. Four hundred dials a year, at most.' },
    { year: '2026', title: 'Vide Nuit Blanche', text: 'Three pieces in platinum, allocated before the press received images. The maison’s smallest and most complete statement.' }
  ];

  /* --------------------------------------------------------------- JOURNAL */
  const journal = [
    { kicker: 'Craft', title: 'Sixty hours of chamfering', excerpt: 'Inside the finishing room where a single bevel is cut, polished and inspected under eight magnifications before it may be seen.', image: 'assets/img/movement-macro.jpg', read: '9 min', date: 'August 2026' },
    { kicker: 'Material', title: 'Nine passes of lacquer', excerpt: 'Why a dial takes eleven weeks, and what happens to the ones that fail the third pass in the light box.', image: 'assets/img/texture-guilloche.jpg', read: '6 min', date: 'July 2026' },
    { kicker: 'Night', title: 'The pilots who asked for black', excerpt: 'In 1938 a night-mail crew asked for a dial that would not glare. We have been answering that request ever since.', image: 'assets/img/editorial-wrist.jpg', read: '12 min', date: 'June 2026' }
  ];

  /* ------------------------------------------------------------------- FAQ */
  const faqs = [
    { q: 'How do I acquire an allocation piece?', a: 'Vide references are offered by allocation. Register your interest and a maison advisor will arrange a conversation — in a boutique, or by video. Allocations are not transferred or resold; the maison records each transfer.' },
    { q: 'Can I see the watch before purchasing?', a: 'Yes. Every reference can be requested to any boutique for a private viewing, usually within five working days. There is no obligation and no follow-up call unless you ask for one.' },
    { q: 'What does servicing involve?', a: 'The movement is fully disassembled, cleaned, re-lubricated and re-regulated to −2/+4 seconds a day. The case is refinished by hand. Expect eight to twelve weeks; you will be given a comparable watch to wear meanwhile.' },
    { q: 'Is the engraving reversible?', a: 'A caseback engraving is permanent and will be noted in the provenance register. Rotor engraving is reversible during a service, as the component can be refinished.' },
    { q: 'Do you deliver internationally?', a: 'We deliver to 74 countries with insured, tracked carriage. Duties and taxes are calculated at checkout for most destinations; where they cannot be, a maison advisor will confirm before dispatch.' }
  ];


  /* ------------------------------------------------- REFERENCE-SPECIFIC PRICING
     Option deltas are authored per reference, not globally: the same metal
     costs the maison differently across case architectures (a 39 mm polished
     gold case is not a 42 mm micro-blasted one). Each block is anchored to its
     own reference price at 0, so configurations reconcile across a family. */
  const priceDeltas = {
    'eclipse-ti-blue': {
      case:   { ti: 0, rg: 15600, dlc: 3400 },
      dial:   { midnight: 0, obsidian: -300, opaline: 900 },
      strap:  { alligator: 0, satin: 100, calf: -400, bracelet: 1900 },
      engrave:{ none: 0, caseback: 1200, rotor: 2400 }
    },
    'eclipse-rg-opaline': {
      case:   { rg: 0, pt: 38000 },
      dial:   { opaline: 0, ivory: 1100, midnight: -900 },
      strap:  { alligator: 0, calf: -400, satin: 100 },
      engrave:{ none: 0, caseback: 1200, rotor: 2400 }
    },
    'abime-42-steel': {
      case:   { st: 0, ti: 900, dlc: 3400 },
      dial:   { abyss: 0, jade: 700, slate: -200 },
      strap:  { bracelet: 0, rubber: -200, textile: -600 },
      engrave:{ none: 0, caseback: 1200 }
    },
    'abime-42-jade': {
      case:   { st: 0, ti: 900, dlc: 3400 },
      dial:   { jade: 0, abyss: -700 },
      strap:  { bracelet: 0, rubber: -200, textile: -600 },
      engrave:{ none: 0, caseback: 1200 }
    },
    'meridien-rg': {
      case:   { rg: 0, pt: 52000 },
      dial:   { opaline: 0, ivory: 1100, ruten: 1400 },
      strap:  { alligator: 0, calf: -400, satin: 100 },
      engrave:{ none: 0, caseback: 1200, rotor: 2400 }
    },
    'meridien-steel': {
      case:   { st: 0, ti: 900, rg: 23500 },
      dial:   { slate: 0, midnight: -300, obsidian: -500, opaline: 900 },
      strap:  { bracelet: 0, alligator: -1900, rubber: -2100, textile: -2500 },
      engrave:{ none: 0, caseback: 1200, rotor: 2400 }
    },
    'vide-dlc': {
      case:   { dlc: 0, ti: -4200, pt: 78900 },
      dial:   { ruten: 0, obsidian: -1400, ivory: 1100 },
      strap:  { rubber: 0, alligator: 900, satin: 1100 },
      engrave:{ none: 0, caseback: 1200, rotor: 2400 }
    },
    'vide-platinum': {
      case:   { pt: 0, dlc: -78900 },
      dial:   { ivory: 0, ruten: -1100 },
      strap:  { alligator: 0, satin: 200 },
      engrave:{ none: 0, caseback: 1200 }
    }
  };

  /* --------------------------------------------------------------- HELPERS */
  const byId = (id) => products.find((p) => p.id === id);
  const byRef = (ref) => products.find((p) => p.ref === ref || p.id === ref);
  const families = () => [...new Set(products.map((p) => p.family))];

  const formatPrice = (n, opts = {}) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: opts.cents ? 2 : 0,
      maximumFractionDigits: opts.cents ? 2 : 0
    }).format(n);

  const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n);

  return {
    brand, products, calibres, services, boutiques, timeline, journal, faqs,
    journey, appendices, acquisition,
    CASE_METALS, DIALS, STRAPS, ENGRAVING, priceDeltas,
    byId, byRef, families, formatPrice, formatNumber
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = NOCTIS;
