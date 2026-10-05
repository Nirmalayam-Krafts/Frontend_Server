/**
 * Centralized SEO Configuration for Nirmalyam Krafts
 * Canonical Production Domain: https://nirmalyamkrafts.com
 */

export const SITE_URL = (
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SITE_URL
    ? import.meta.env.VITE_SITE_URL
    : 'https://nirmalyamkrafts.com'
).replace(/\/+$/, '');

export const BUSINESS_INFO = {
  name: 'Nirmalyam Krafts',
  legalName: 'Nirmalyam Krafts Private Limited',
  tagline: 'Leading Paper Bag Manufacturer & Sustainable Packaging Supplier in Pune, India',
  email: 'Nirmalyamkrafts@gmail.com',
  telephone: '+91 8530669369',
  whatsapp: '+91 8530669369',
  address: {
    streetAddress: 'Survey No 53, Gatha Mandir Bypass Rd, near Sairaj Chowk, Yelwadi',
    addressLocality: 'Pune',
    addressRegion: 'Maharashtra',
    postalCode: '412109',
    addressCountry: 'IN',
  },
  geo: {
    latitude: 18.7269478,
    longitude: 73.7622654,
  },
  founders: ['Mahesh Nair', 'Satish Nair'],
  foundingLocation: 'Pune, Maharashtra, India',
  logo: `${SITE_URL}/Nirmalyam_Logo-removebg-preview.webp`,
  favicon: `${SITE_URL}/favicon.png`,
  mapsUrl: 'https://www.google.com/maps/place/Nirmalyam+Krafts+Private+Ltd/@18.7269478,73.7622654,17z',
};

/**
 * Master Route SEO Registry
 */
export const ROUTE_SEO = {
  '/': {
    title: 'Paper Bag Manufacturer in Pune, India | Nirmalyam Krafts',
    h1: 'Custom & Eco-Friendly Paper Bags Manufacturer in Pune',
    description: 'Nirmalyam Krafts is a leading B2B paper bag manufacturer and supplier in Pune, India. Custom printed paper bags, food & bakery packaging, kraft shopping bags, and industrial kraft paper rolls at direct factory wholesale rates.',
    keywords: 'paper bag manufacturer Pune, paper bag manufacturer in Pune, paper bag manufacturer India, paper bags manufacturer, paper bag supplier Pune, custom paper bags, custom printed paper bags, printed paper bags, kraft paper bags, eco friendly paper bags, paper carry bags Pune',
    canonical: `${SITE_URL}/`,
    ogType: 'website',
  },
  '/products': {
    title: 'Paper Bags & Sustainable Packaging Products | Nirmalyam Krafts',
    h1: 'B2B Paper Bags & Packaging Collections',
    description: 'Explore our complete range of B2B paper bags: custom printed bags, food & bakery bags, eco-friendly kraft shopping bags, handle bags, square bottom bags, and kraft paper rolls manufactured in Pune, India.',
    keywords: 'paper bags, kraft paper bags, custom paper bags, printed paper bags, eco friendly paper bags, paper shopping bags, food paper bags, grocery paper bags, handle paper bags, kraft paper rolls',
    canonical: `${SITE_URL}/products`,
    ogType: 'website',
  },
  '/products/ecocraft': {
    title: 'Eco-Friendly Paper Bags | EcoCraft Collection | Nirmalyam Krafts',
    h1: 'Eco-Friendly Paper Bags Manufacturer',
    description: 'Wholesale eco-friendly paper bags crafted with high-tensile kraft paper and durable handles. Sustainable, biodegradable everyday packaging for retail stores, boutiques, and eco-conscious businesses.',
    keywords: 'eco friendly paper bags, sustainable paper bags, recyclable paper bags, kraft paper bags, eco craft paper bags, biodegradable paper bags Pune, paper carry bags wholesale',
    canonical: `${SITE_URL}/products/ecocraft`,
    ogType: 'product',
  },
  '/products/food-bakery-bags': {
    title: 'Food & Bakery Paper Bags Manufacturer | Nirmalyam Krafts',
    h1: 'Food & Bakery Paper Bags',
    description: 'Food-grade, grease-resistant paper bags for bakeries, cafes, restaurants, and cloud kitchens. Odor-free, sustainable takeaway and gourmet paper bags manufactured in Pune, India.',
    keywords: 'food paper bags, bakery paper bags, food packaging paper bags, takeaway paper bags, restaurant paper bags, cafe paper bags, food grade paper bags, bakery packaging bags Pune',
    canonical: `${SITE_URL}/products/food-bakery-bags`,
    ogType: 'product',
  },
  '/products/custom-printed-paper-bags': {
    title: 'Custom Printed Paper Bags Manufacturer in Pune | Nirmalyam Krafts',
    h1: 'Custom Printed Paper Bags with Logo',
    description: 'Bespoke custom printed paper bags for brands and businesses. Precision Pantone matching, high-definition flexo/offset printing, custom bag sizes, and multiple handle options at direct factory rates.',
    keywords: 'custom printed paper bags, printed paper bags, branded paper bags, logo printed paper bags, custom paper bags Pune, printed kraft paper bags, branded retail bags India',
    canonical: `${SITE_URL}/products/custom-printed-paper-bags`,
    ogType: 'product',
  },
  '/products/shopping-bags': {
    title: 'Custom Paper Shopping Bags Manufacturer | Nirmalyam Krafts',
    h1: 'Custom Paper Shopping Bags & Retail Carry Bags',
    description: 'High-strength paper shopping bags and branded carry bags for retail stores, supermarkets, fashion boutiques, and exhibitions. Reinforced handles with heavy load-bearing capacity.',
    keywords: 'paper shopping bags, kraft shopping bags, paper carry bags, custom shopping paper bags, printed shopping paper bags, branded paper shopping bags, retail paper bags Pune',
    canonical: `${SITE_URL}/products/shopping-bags`,
    ogType: 'product',
  },
  '/products/grocery-bags': {
    title: 'Kraft Grocery Paper Bags Manufacturer | Nirmalyam Krafts',
    h1: 'Heavy-Duty Grocery Paper Bags',
    description: 'Sturdy square-bottom kraft grocery paper bags for supermarkets, grocery stores, and departmental retail. High load capacity, tear resistance, and eco-friendly paper construction.',
    keywords: 'grocery paper bags, kraft grocery bags, paper grocery bags, grocery carry bags, paper bags for supermarkets, sustainable grocery bags Pune',
    canonical: `${SITE_URL}/products/grocery-bags`,
    ogType: 'product',
  },
  '/products/handle-bags': {
    title: 'Paper Bags with Handles | Custom Handle Bags | Nirmalyam Krafts',
    h1: 'Paper Bags with Handles (Twisted & Flat)',
    description: 'Versatile paper bags with comfortable, durable handles including twisted paper handles and flat fold handles. Engineered for retail, takeaway, and gifting applications.',
    keywords: 'paper bags with handles, handle paper bags, kraft paper bags with handles, twisted handle paper bags, flat handle paper bags, custom handle paper bags Pune',
    canonical: `${SITE_URL}/products/handle-bags`,
    ogType: 'product',
  },
  '/products/square-bottom-bags': {
    title: 'Square Bottom Paper Bags Manufacturer | Nirmalyam Krafts',
    h1: 'Square Bottom & Block Bottom Paper Bags',
    description: 'Self-standing square bottom and block bottom kraft paper bags for retail, food takeout, and grocery packaging. Easy-fill wide base design with superior structural stability.',
    keywords: 'square bottom paper bags, square bottom kraft bags, flat bottom paper bags, self standing paper bags, block bottom paper bags Pune, SOS paper bags',
    canonical: `${SITE_URL}/products/square-bottom-bags`,
    ogType: 'product',
  },
  '/products/kraft-paper-rolls': {
    title: 'Kraft Paper Rolls Manufacturer & Supplier | Nirmalyam Krafts',
    h1: 'Industrial Kraft Paper Rolls',
    description: 'High-strength industrial kraft paper rolls in brown and bleached white variations (120 to 240 GSM). Ideal for protective wrapping, void filling, parcel cushioning, and corrugated packaging conversion.',
    keywords: 'kraft paper rolls, kraft paper roll manufacturer, kraft paper rolls supplier, kraft paper roll Pune, kraft paper rolls India, packaging kraft paper rolls, wrapping kraft paper',
    canonical: `${SITE_URL}/products/kraft-paper-rolls`,
    ogType: 'product',
  },
  '/about': {
    title: 'About Nirmalyam Krafts | Paper Bag Manufacturer in Pune',
    h1: 'About Nirmalyam Krafts',
    description: 'Learn about Nirmalyam Krafts, an eco-conscious B2B paper bag manufacturing enterprise founded by Mahesh Nair and Satish Nair in Pune, Maharashtra. Dedicated to zero-waste, sustainable packaging.',
    keywords: 'about Nirmalyam Krafts, paper bag manufacturer Pune, packaging company Pune, Mahesh Nair, Satish Nair, eco packaging manufacturer Maharashtra',
    canonical: `${SITE_URL}/about`,
    ogType: 'website',
  },
  '/sustainability': {
    title: 'Sustainable Packaging Solutions & Green Ethos | Nirmalyam Krafts',
    h1: 'Sustainable Packaging Solutions',
    description: 'Discover Nirmalyam Krafts\' environmental commitment: responsibly sourced paper fibers, non-toxic water/soy inks, organic adhesives, and 100% recyclable plastic-free paper bags.',
    keywords: 'sustainable packaging, recyclable paper bags, eco friendly packaging solutions, circular economy packaging, plastic free paper bags Pune',
    canonical: `${SITE_URL}/sustainability`,
    ogType: 'website',
  },
  '/contact': {
    title: 'Contact Nirmalyam Krafts | Paper Bag Manufacturer Pune',
    h1: 'Contact Nirmalyam Krafts Manufacturing Facility',
    description: 'Get in touch with Nirmalyam Krafts at our Pune manufacturing unit. Call +91 8530669369, email Nirmalyamkrafts@gmail.com, or visit our facility in Yelwadi, Pune for custom paper bag inquiries.',
    keywords: 'contact Nirmalyam Krafts, paper bag manufacturer Pune address, paper bag supplier phone number, Yelwadi Pune factory, paper bags contact',
    canonical: `${SITE_URL}/contact`,
    ogType: 'website',
  },
  '/quote': {
    title: 'Get a Quote for Custom Paper Bags | Nirmalyam Krafts',
    h1: 'Request a Custom Paper Bag Quote',
    description: 'Request a free, transparent wholesale price quote for custom printed paper bags, bakery bags, or kraft paper rolls. Direct factory pricing with low MOQs and rapid pan-India fulfillment.',
    keywords: 'custom paper bag quote, bulk paper bag enquiry, paper bag price list Pune, wholesale paper bags quote, RFQ paper bags India',
    canonical: `${SITE_URL}/quote`,
    ogType: 'website',
  },
  '/privacy': {
    title: 'Privacy Policy | Nirmalyam Krafts',
    h1: 'Privacy Policy',
    description: 'Privacy Policy of Nirmalyam Krafts Private Limited detailing how we collect, protect, and handle client and customer information.',
    keywords: 'privacy policy, Nirmalyam Krafts',
    canonical: `${SITE_URL}/privacy`,
    ogType: 'website',
  },
  '/terms': {
    title: 'Terms of Service | Nirmalyam Krafts',
    h1: 'Terms of Service',
    description: 'Terms and Conditions governing orders, manufacturing specifications, and services provided by Nirmalyam Krafts.',
    keywords: 'terms of service, Nirmalyam Krafts terms',
    canonical: `${SITE_URL}/terms`,
    ogType: 'website',
  },
  '/returns': {
    title: 'Returns & Refund Policy | Nirmalyam Krafts',
    h1: 'Returns & Refund Policy',
    description: 'Information regarding our quality inspection standards, order return conditions, and replacement policies for manufactured goods.',
    keywords: 'returns policy, Nirmalyam Krafts',
    canonical: `${SITE_URL}/returns`,
    ogType: 'website',
  },
  '/shipping': {
    title: 'Shipping & Delivery Terms | Nirmalyam Krafts',
    h1: 'Shipping & Delivery Terms',
    description: 'Pan-India shipping schedules, freight policies, and delivery timelines for bulk wholesale orders from our Pune manufacturing facility.',
    keywords: 'shipping terms, paper bag delivery India, Nirmalyam Krafts logistics',
    canonical: `${SITE_URL}/shipping`,
    ogType: 'website',
  },
};
