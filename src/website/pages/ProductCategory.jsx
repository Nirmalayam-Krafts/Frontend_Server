import { useParams, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Leaf, 
  Droplets,
  Zap,
  Phone,
  CheckCircle2,
  ChevronRight,
  Award,
  Heart,
  Scale,
  Layers,
  Package,
  Settings,
  Weight,
  HelpCircle
} from 'lucide-react';
import PagePopup from '../components/PagePopup';
import SEOHead from '../components/SEOHead';
import { SITE_URL, BUSINESS_INFO } from '../config/seoConfig';

const CANONICAL_MAP = {
  ecokraft: 'ecocraft',
  fnb: 'food-bakery-bags',
  industrial: 'kraft-paper-rolls',
};

const HIDDEN_CATEGORIES = [
  'luxury',
  'custom-printed-paper-bags',
  'handle-bags',
  'flat-handle',
];

const categoryData = {
  ecocraft: {
    id: 'ecocraft',
    title: 'EcoCraft Paper Bags',
    seoTitle: 'Eco-Friendly Paper Bags | EcoCraft Collection | Nirmalyam Krafts',
    seoDesc: 'Wholesale eco-friendly paper bags crafted with high-tensile kraft paper and durable handles. Sustainable, biodegradable everyday packaging for retail and boutiques in Pune, India.',
    keywords: 'eco friendly paper bags, sustainable paper bags, recyclable paper bags, kraft paper bags, eco craft paper bags Pune, paper carry bags wholesale',
    image: '/images/newGen/BOTTOMV.jpeg',
    minOrder: '100 UNITS',
    color: '#4ade80',
    description: 'Our signature high-strength kraft bags combine industrial-grade durability with a refined, tactile aesthetic.',
    longDescription: 'Crafted from sustainably sourced fibers, these bags are designed to elevate your brand\'s presence while honoring the planet. Featuring premium twisted paper handles and reinforced bottoms for effortless retail carry.',
    bullets: [
      { label: 'Sustainably Sourced', icon: CheckCircle2 },
      { label: '100% Recyclable', icon: Leaf },
      { label: 'Holds up to 12kg', icon: Zap },
      { label: 'Soy-based Inks', icon: Droplets }
    ],
    specs: [
      { label: 'Material', value: 'High-Tensile Virgin & Recycled Kraft', icon: Layers },
      { label: 'Weight Range', value: '60 - 120 GSM', icon: Weight },
      { label: 'Handle Types', value: 'Twisted Paper / Flat Handle', icon: Settings },
      { label: 'Capacity', value: '3kg - 12kg', icon: Scale },
      { label: 'Min Order', value: '100 units', icon: Package }
    ],
    gallery: [
      { title: 'Vibrant Series', desc: 'Modern colorful branding', image: '/images/collection_ecocraft_new.webp' },
      { title: 'Retail Excellence', desc: 'High-volume branded carry', image: '/images/newGen/BOTTOMvF.jpeg' },
      { title: 'Sustainable Craft', desc: 'Eco-conscious perfection', image: '/images/newGen/bottomVSlider.png' }
    ],
    faqs: [
      { q: 'What GSM options are available for EcoCraft bags?', a: 'We manufacture EcoCraft bags from 60 GSM up to 120 GSM depending on your required carrying capacity and aesthetic preference.' },
      { q: 'Can I print my brand logo on EcoCraft paper bags?', a: 'Yes, we offer custom flexo and offset printing using eco-safe soy and water-based inks with precise Pantone matching.' },
      { q: 'What is the minimum order quantity (MOQ)?', a: 'Our factory MOQ starts at just 100 units, making it accessible for retail brands of all sizes.' }
    ]
  },

  'food-bakery-bags': {
    id: 'food-bakery-bags',
    title: 'Food & Bakery Paper Bags',
    seoTitle: 'Food & Bakery Paper Bags Manufacturer | Nirmalyam Krafts',
    seoDesc: 'Food-grade, grease-resistant paper bags for bakeries, cafes, restaurants, and cloud kitchens. Odor-free, sustainable takeaway packaging manufactured in Pune, India.',
    keywords: 'food paper bags, bakery paper bags, food packaging paper bags, takeaway paper bags, restaurant paper bags, cafe paper bags, food grade paper bags Pune',
    image: '/images/newGen/bottomVFB.jpeg',
    minOrder: '100 UNITS',
    color: '#f59e0b',
    description: 'Specialized grease-resistant and moisture-controlled packaging for the food and beverage industry.',
    longDescription: 'Developed for restaurateurs and bakers, our F&B line features food-grade barrier paper that resists oil and moisture without plastic laminates. Perfect for hot breads, pastries, burger takeaways, and cloud kitchens.',
    bullets: [
      { label: 'Food-Contact Safe', icon: CheckCircle2 },
      { label: 'Grease Resistant', icon: Droplets },
      { label: 'Moisture Barrier', icon: Zap },
      { label: 'Eco-Ink Safe', icon: Leaf }
    ],
    specs: [
      { label: 'Material', value: 'Food-Grade Greaseproof Kraft Paper', icon: Layers },
      { label: 'Weight Range', value: '70 - 110 GSM', icon: Weight },
      { label: 'Features', value: 'Oil & Steam Resistant', icon: Settings },
      { label: 'Certification', value: 'Food-Contact Compliant', icon: ShieldCheck },
      { label: 'Min Order', value: '100 units', icon: Package }
    ],
    gallery: [
      { title: 'Gourmet Carry', desc: 'Premium restaurant solutions', image: '/collection-fnb.webp' },
      { title: 'Classic Brown Collection', desc: 'Natural brown finish', image: '/images/new/V_Bottom_Bag7.webp' },
      { title: 'Bakery Special', desc: 'Vibrant artisanal branding', image: '/images/new/fnb_bakery.webp' }
    ],
    faqs: [
      { q: 'Are these paper bags safe for direct food contact?', a: 'Yes, our bakery and food bags use certified food-grade barrier paper free from harmful bleaching agents and plastics.' },
      { q: 'Do you manufacture bags for hot and oily foods?', a: 'Yes, our greaseproof kraft paper effectively resists oil seepage from fried items, burgers, croissants, and baked goods.' }
    ]
  },

  'shopping-bags': {
    id: 'shopping-bags',
    title: 'Custom Paper Shopping Bags',
    seoTitle: 'Custom Paper Shopping Bags Manufacturer | Nirmalyam Krafts',
    seoDesc: 'High-strength paper shopping bags and branded carry bags for retail stores, supermarkets, fashion boutiques, and exhibitions. Reinforced handles with heavy load-bearing capacity in Pune.',
    keywords: 'paper shopping bags, kraft shopping bags, paper carry bags, custom shopping paper bags, printed shopping paper bags, retail paper bags Pune',
    image: '/images/new/V_BottomBag6.webp',
    minOrder: '100 UNITS',
    color: '#0284c7',
    description: 'High-strength retail paper carry bags designed to deliver a premium unboxing and in-store shopping experience.',
    longDescription: 'Our shopping bags are built for high-end retail, boutiques, lifestyle outlets, and department stores. Featuring reinforced side gussets and sturdy bottoms, they combine ergonomic handling with robust weight capacity.',
    bullets: [
      { label: 'Heavy Load Test', icon: Scale },
      { label: 'Reinforced Base', icon: Package },
      { label: 'Ergonomic Handles', icon: Heart },
      { label: 'Retail Standard', icon: Award }
    ],
    specs: [
      { label: 'Material', value: 'Premium Natural & Bleached Kraft', icon: Layers },
      { label: 'Weight Range', value: '80 - 140 GSM', icon: Weight },
      { label: 'Handles', value: 'Twisted Paper Cord & Flat Fold', icon: Settings },
      { label: 'Load Capacity', value: 'Up to 12kg', icon: Scale },
      { label: 'Min Order', value: '100 units', icon: Package }
    ],
    gallery: [
      { title: 'Retail Carry', desc: 'Everyday high-volume shopping', image: '/images/newGen/BOTTOMV.jpeg' },
      { title: 'Artisanal Kraft', desc: 'Textured natural brown carry', image: '/images/new/V_BottomBag6.webp' },
      { title: 'Boutique Collection', desc: 'Custom printed retail solutions', image: '/images/newGen/BOTTOMvF.jpeg' }
    ],
    faqs: [
      { q: 'How much weight can your shopping bags hold?', a: 'Depending on the selected GSM and base dimensions, our paper shopping bags are load-tested to hold between 5kg and 12kg comfortably.' },
      { q: 'Are these bags suitable for clothing and footwear stores?', a: 'Yes, our shopping bags are widely used by apparel brands, footwear retailers, and lifestyle boutiques.' }
    ]
  },

  'grocery-bags': {
    id: 'grocery-bags',
    title: 'Kraft Grocery Paper Bags',
    seoTitle: 'Kraft Grocery Paper Bags Manufacturer | Nirmalyam Krafts',
    seoDesc: 'Sturdy square-bottom kraft grocery paper bags for supermarkets, grocery stores, and departmental retail. High load capacity, tear resistance, and eco-friendly paper construction.',
    keywords: 'grocery paper bags, kraft grocery bags, paper grocery bags, grocery carry bags, paper bags for supermarkets, sustainable grocery bags Pune',
    image: '/images/product_sos.webp',
    minOrder: '100 UNITS',
    color: '#15803d',
    description: 'Heavy-duty grocery bags engineered with wide flat bottoms for fast packing and heavy volume capacity.',
    longDescription: 'Specially constructed for supermarkets, organic grocery stores, and farm-to-table markets. The self-standing flat bottom allows effortless upright packing at checkout counters, reducing bagging time while eliminating single-use plastic sacks.',
    bullets: [
      { label: 'Self-Standing Base', icon: Package },
      { label: 'Tear-Resistant Paper', icon: ShieldCheck },
      { label: 'High Bulk Volume', icon: Layers },
      { label: '100% Biodegradable', icon: Leaf }
    ],
    specs: [
      { label: 'Material', value: 'Heavy Virgin & Recycled Kraft Paper', icon: Layers },
      { label: 'Weight Range', value: '70 - 130 GSM', icon: Weight },
      { label: 'Bottom Style', value: 'Square / Block Bottom', icon: Settings },
      { label: 'Capacity', value: 'Up to 10kg', icon: Scale },
      { label: 'Min Order', value: '100 units', icon: Package }
    ],
    gallery: [
      { title: 'Supermarket SOS', desc: 'Fast-packing self-opening bags', image: '/images/product_sos.webp' },
      { title: 'Natural Grocery Sacks', desc: 'High-tensile brown kraft', image: '/images/new/V_Bottom_Bag7.webp' },
      { title: 'Bulk Packaged', desc: 'Palletized wholesale supply', image: '/images/newGen/BOTTOMV.jpeg' }
    ],
    faqs: [
      { q: 'Can your grocery paper bags stand upright on their own?', a: 'Yes, our grocery bags feature square block bottoms that remain self-standing on checkout counters for swift packing.' }
    ]
  },

  'square-bottom-bags': {
    id: 'square-bottom-bags',
    title: 'Square Bottom Paper Bags',
    seoTitle: 'Square Bottom Paper Bags Manufacturer | Nirmalyam Krafts',
    seoDesc: 'Self-standing square bottom and block bottom kraft paper bags for retail, food takeout, and grocery packaging. Easy-fill wide base design with superior structural stability.',
    keywords: 'square bottom paper bags, square bottom kraft bags, flat bottom paper bags, self standing paper bags, block bottom paper bags Pune, SOS paper bags',
    image: '/images/newGen/BOTTOMvF.jpeg',
    minOrder: '100 UNITS',
    color: '#c09457',
    description: 'Self-standing block bottom bags engineered for effortless filling, packing, and stable shelf placement.',
    longDescription: 'Square bottom bags (also known as SOS or flat bottom bags) provide a rectangular base that stands upright without support. Ideal for bakeries, food deliveries, meal kits, and retail merchandising, they maximize packing efficiency while presenting a neat, professional silhouette.',
    bullets: [
      { label: 'Self-Standing Base', icon: Package },
      { label: 'High Capacity', icon: Scale },
      { label: 'Fast Packing', icon: Zap },
      { label: 'Recycled Paper', icon: Leaf }
    ],
    specs: [
      { label: 'Material', value: 'High-Tensile Brown & White Kraft', icon: Layers },
      { label: 'Base Style', value: 'Self-Opening Square / Block Bottom', icon: Settings },
      { label: 'Weight Range', value: '70 - 130 GSM', icon: Weight },
      { label: 'Capacity', value: '2kg - 10kg', icon: Scale },
      { label: 'Min Order', value: '100 units', icon: Package }
    ],
    gallery: [
      { title: 'Square Base Takeaway', desc: 'Perfect for meal containers', image: '/images/newGen/BOTTOMvF.jpeg' },
      { title: 'Self-Standing Grocery', desc: 'Stable upright display', image: '/images/product_sos.webp' },
      { title: 'Artisanal Craft', desc: 'Natural brown finish', image: '/images/newGen/bottomVSlider.png' }
    ],
    faqs: [
      { q: 'Can square bottom bags hold takeaway food containers flat?', a: 'Yes! The wide rectangular base allows food boxes and meal trays to sit completely flat without tipping over during transit.' }
    ]
  },

  'kraft-paper-rolls': {
    id: 'kraft-paper-rolls',
    title: 'Industrial Kraft Paper Rolls',
    seoTitle: 'Kraft Paper Rolls Manufacturer & Supplier | Nirmalyam Krafts',
    seoDesc: 'High-strength industrial kraft paper rolls in brown and bleached white variations (120 to 240 GSM). Ideal for protective wrapping, void filling, parcel cushioning, and corrugated packaging in Pune.',
    keywords: 'kraft paper rolls, kraft paper roll manufacturer, kraft paper rolls supplier, kraft paper roll Pune, kraft paper rolls India, packaging kraft paper rolls, wrapping kraft paper',
    image: '/images/new/KraftRoll_New.webp',
    minOrder: '100 UNITS',
    color: '#8b5e34',
    description: 'Premium brown and white industrial rolls designed for superior protection, wrapping, and shipping.',
    longDescription: 'Our industrial kraft paper rolls are manufactured with high tensile strength and tear resistance. Ideal for protective wrapping, void filling, parcel cushioning, and bulk packaging. Available in natural brown and bleached white variations with consistent GSM tolerance across the entire roll width.',
    bullets: [
      { label: 'Tear Resistant', icon: ShieldCheck },
      { label: 'Puncture Proof', icon: Zap },
      { label: 'Moisture Safe', icon: Droplets },
      { label: '100% Recycled', icon: Leaf }
    ],
    specs: [
      { label: 'GSM Range', value: '120 - 240 GSM', icon: Weight },
      { label: 'Width', value: 'Up to 2 meters', icon: Scale },
      { label: 'Tensile Strength', value: 'Industrial Grade', icon: Zap },
      { label: 'Composition', value: 'Recycled & Virgin Kraft', icon: Layers },
      { label: 'Application', value: 'Protective Wrapping & Cushioning', icon: Settings },
      { label: 'Min Order', value: '100 units / rolls', icon: Package }
    ],
    gallery: [
      { title: 'Factory Warehouse', desc: 'High-volume storage of brown and white rolls', image: '/images/newGen/rolls.jpeg' },
      { title: 'Quality Certification', desc: 'Nirmalyam certified industrial rolls', image: '/images/prod_rolls_paper.webp' },
      { title: 'Industrial Solutions', desc: 'Tailored for bulk wrapping and packaging', image: '/images/prod_rolls_paper_new.webp' }
    ],
    faqs: [
      { q: 'What widths and GSMs are available for kraft rolls?', a: 'We supply rolls from 120 GSM up to 240 GSM, with customizable roll widths up to 2 meters for industrial packaging machines.' },
      { q: 'Are these rolls suitable for e-commerce parcel wrapping and void fill?', a: 'Yes, our kraft rolls are widely used for e-commerce packing, void fill cushioning, and furniture surface protection.' }
    ]
  },

  pouches: {
    id: 'pouches',
    title: 'Eco-Pouches',
    seoTitle: 'Eco-Pouches & Paper Packaging | Nirmalyam Krafts',
    seoDesc: 'Modern stand-up pouches with a tactile matte paper texture for dry goods, organic snacks, tea, and coffee packaging.',
    keywords: 'eco pouches, paper stand up pouches, kraft pouches, sustainable pouches Pune',
    image: '/images/prod_pouches_paper.webp',
    minOrder: '100 UNITS',
    color: '#1a4a2e',
    description: 'Modern stand-up pouches with a premium matte paper texture for dry goods.',
    longDescription: 'Our Eco-Pouches use specialized paper-based construction providing moisture resistance while maintaining a biological, natural feel. Perfect for coffee, artisanal snacks, nuts, and dry foods.',
    bullets: [
      { label: 'Resealable Zip', icon: Zap },
      { label: 'Stand-up Base', icon: CheckCircle2 },
      { label: 'High Barrier', icon: ShieldCheck },
      { label: 'Matte Texture', icon: Layers }
    ],
    specs: [
      { label: 'Material', value: 'Paper Barrier Film', icon: Layers },
      { label: 'Closure', value: 'Press-to-Close Zip', icon: Settings },
      { label: 'Capacity', value: '100g - 2kg', icon: Scale },
      { label: 'Min Order', value: '100 units', icon: Package }
    ],
    gallery: [
      { title: 'Stand-up Pouch', desc: 'Retail-ready design', image: '/images/prod_pouches_paper.webp' },
      { title: 'Organic Feel', desc: 'Natural matte finish', image: '/images/eco_pouches_paper_grid.png' }
    ],
    faqs: [
      { q: 'Can eco-pouches be heat-sealed?', a: 'Yes, our pouches are compatible with standard impulse heat sealers above the zip closure for tamper-evident security.' }
    ]
  }
};

export default function ProductCategory() {
  const { categoryId } = useParams();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // 1. Explicitly hidden collections redirect to /products
  if (HIDDEN_CATEGORIES.includes(categoryId)) {
    return <Navigate to="/products" replace />;
  }

  // 2. Alias handling: seamless redirect to canonical SEO slug
  if (CANONICAL_MAP[categoryId]) {
    return <Navigate to={`/products/${CANONICAL_MAP[categoryId]}`} replace />;
  }

  const data = categoryData[categoryId];

  // 3. Fallback for unknown categories
  if (!data) {
    return <Navigate to="/products" replace />;
  }

  const canonicalUrl = `${SITE_URL}/products/${categoryId}`;
  const whatsappMessage = `Hi Nirmalyam Krafts, I am interested in the ${data.title} collection. Could you please share the wholesale price list and sample details?`;
  const whatsappUrl = `https://wa.me/918530669369?text=${encodeURIComponent(whatsappMessage)}`;

  // Product + Breadcrumbs + FAQ Schemas
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.title,
      description: data.description,
      image: `${SITE_URL}${data.image}`,
      brand: {
        '@type': 'Brand',
        name: BUSINESS_INFO.name,
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'INR',
        priceRange: '₹₹ - Factory Wholesale Rates',
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: BUSINESS_INFO.name,
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Products',
          item: `${SITE_URL}/products`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: data.title,
          item: canonicalUrl,
        },
      ],
    },
    ...(data.faqs && data.faqs.length > 0 ? [{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    }] : []),
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kraft-50)' }}>
      {/* ── Dynamic SEO Head ── */}
      <SEOHead
        title={data.seoTitle}
        description={data.seoDesc}
        keywords={data.keywords}
        canonical={canonicalUrl}
        ogType="product"
        ogImage={`${SITE_URL}${data.image}`}
        schemas={schemas}
      />

      {/* ── Fixed Quote Bar ── */}
      <div style={{
        position: 'fixed',
        bottom: isMobile ? 12 : 32,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: isMobile ? '94%' : '90%',
        maxWidth: 720,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: isMobile ? '20px' : '32px',
        padding: isMobile ? '10px 14px' : '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.5)',
        animation: 'quoteFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20 }}>
          <div style={{
            width: isMobile ? 44 : 60, 
            height: isMobile ? 44 : 60,
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'white',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
          }}>
            <img src={data.image} alt={data.title} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: isMobile ? 10 : 12, fontWeight: 700, color: data.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Min Order: {data.minOrder}</div>
            <div style={{ fontSize: isMobile ? 15 : 20, fontWeight: 800, color: 'var(--kraft-950)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.title}</div>
          </div>
        </div>
        <Link 
          to="/contact#contact-channels"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: 'var(--kraft-950)',
            color: 'white',
            padding: isMobile ? '12px 20px' : '16px 32px',
            borderRadius: isMobile ? '14px' : '20px',
            fontWeight: 800,
            fontSize: isMobile ? 13 : 16,
            textDecoration: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            marginLeft: 12
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isMobile ? 'Request Quote' : 'Request Wholesale Quote'} <ArrowRight size={18} />
        </Link>
      </div>

      {/* ── Main Content ── */}
      <div style={{ paddingTop: isMobile ? 'calc(var(--header-height, 80px) + 20px)' : 'calc(var(--header-height, 108px) + 40px)', paddingBottom: isMobile ? 60 : 100 }}>
        <div className="container">
          {/* Breadcrumbs */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: 8, 
            fontSize: 11, 
            fontWeight: 700, 
            color: 'var(--kraft-600)', 
            marginBottom: isMobile ? 12 : 40,
            textTransform: 'uppercase',
            letterSpacing: '0.12em'
          }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={12} strokeWidth={3} />
            <Link to="/products" style={{ color: 'inherit', textDecoration: 'none' }}>Products</Link>
            <ChevronRight size={12} strokeWidth={3} />
            <span style={{ color: 'var(--eco-600)' }}>{data.title}</span>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 0.8fr', 
            gap: isMobile ? 48 : 80, 
            alignItems: 'start' 
          }} className="category-hero-grid">
            {/* Image Section */}
            <div style={{ position: isMobile || isTablet ? 'relative' : 'sticky', top: isMobile || isTablet ? 0 : 120, marginBottom: isMobile ? 16 : 0 }}>
              <div style={{
                borderRadius: isMobile ? '24px' : '48px',
                overflow: 'hidden',
                aspectRatio: isMobile ? '5/4' : '1',
                boxShadow: '0 40px 80px -20px rgba(58, 36, 16, 0.15)',
                background: 'white',
                border: '1px solid var(--kraft-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '24px' : '40px',
                position: 'relative'
              }}>
                <img 
                  src={data.image} 
                  alt={`${data.title} by Nirmalyam Krafts`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
            </div>

            {/* Info Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ background: `${data.color}20`, color: data.color, padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em' }}>
                  MIN ORDER: {data.minOrder}
                </div>
                <div style={{ background: '#1F4013', padding: '6px 14px', borderRadius: 'var(--radius-full)', color: 'white', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}>
                  SUSTAINABLE PACKAGING
                </div>
              </div>
              
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 56px)', color: 'var(--kraft-950)', marginBottom: isMobile ? 16 : 24, lineHeight: 1.25, fontWeight: 800 }}>
                {data.title}
              </h1>
              
              <p style={{ fontSize: isMobile ? 16 : 19, color: 'var(--kraft-600)', lineHeight: 1.7, marginBottom: 40 }}>
                {data.description} {data.longDescription}
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 16, marginBottom: 48 }}>
                <Link to="/contact#contact-channels" style={{ 
                  flex: 1.5, 
                  minWidth: isMobile ? '100%' : 'auto',
                  padding: isMobile ? '18px 24px' : '22px 32px', 
                  background: 'var(--kraft-950)', 
                  color: 'white',
                  borderRadius: '20px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 12,
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: isMobile ? 16 : 18,
                  transition: 'all 0.3s',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#000'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--kraft-950)'}
                >
                   Get Wholesale Price <ArrowRight size={20} />
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ 
                  flex: 1, 
                  minWidth: isMobile ? '100%' : 'auto',
                  padding: isMobile ? '18px 24px' : '22px 32px', 
                  background: 'white', 
                  color: 'var(--kraft-950)', 
                  borderRadius: '20px', 
                  textDecoration: 'none', 
                  fontWeight: 800, 
                  fontSize: isMobile ? 16 : 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  border: '1px solid var(--kraft-200)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--kraft-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  <Phone size={20} /> Inquire WhatsApp
                </a>
              </div>

              {/* Key Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16, marginBottom: 48 }}>
                {data.bullets.map((bullet, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'white', borderRadius: '16px', border: '1px solid var(--kraft-100)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${data.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: data.color }}>
                      <bullet.icon size={20} />
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--kraft-900)' }}>{bullet.label}</span>
                  </div>
                ))}
              </div>

              {/* Specifications Table */}
              <div style={{ background: 'white', borderRadius: '24px', padding: isMobile ? '24px' : '36px', border: '1px solid var(--kraft-200)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--kraft-950)', marginBottom: 20 }}>Technical Specifications</h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }} className="specs-grid">
                  {data.specs.map((spec, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--kraft-100)' }}>
                      <spec.icon size={18} color="var(--kraft-400)" />
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--kraft-500)', fontWeight: 600 }}>{spec.label}</div>
                        <div style={{ fontSize: 15, color: 'var(--kraft-900)', fontWeight: 700 }}>{spec.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gallery Section ── */}
      <section className="section-padding" style={{ background: 'white', borderTop: '1px solid var(--kraft-200)', borderBottom: '1px solid var(--kraft-200)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label" style={{ fontSize: 12, letterSpacing: '0.2em' }}>Visual Showcase</div>
            <h2 className="section-title" style={{ fontSize: isMobile ? 28 : 40 }}>{data.title} Applications</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 32 }} className="gallery-grid">
            {data.gallery.map((item, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <div style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  aspectRatio: '1',
                  background: 'var(--kraft-50)',
                  marginBottom: 16,
                  border: '1px solid var(--kraft-100)',
                  position: 'relative'
                }}>
                  <img
                    src={item.image}
                    alt={`${item.title} - ${data.title} manufacturer Pune`}
                    className="gallery-img"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  />
                  <div className="gallery-overlay" style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    backdropFilter: 'blur(4px)'
                  }}>
                    <Link to="/contact#contact-channels" style={{
                      padding: '12px 24px',
                      background: 'white',
                      color: 'var(--kraft-950)',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                      fontSize: 14,
                      textDecoration: 'none',
                      transform: 'translateY(20px)',
                      transition: 'transform 0.3s ease'
                    }}>
                      Get a Quote
                    </Link>
                  </div>
                </div>
                <h4 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: 'var(--kraft-900)', marginBottom: 4, textAlign: 'center' }}>{item.title}</h4>
                <p style={{ fontSize: isMobile ? 13 : 15, color: 'var(--kraft-500)', lineHeight: 1.5, textAlign: 'center' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section for Search Intent & Helpful Content ── */}
      {data.faqs && data.faqs.length > 0 && (
        <section className="section-padding" style={{ background: 'var(--kraft-50)', borderBottom: '1px solid var(--kraft-200)' }}>
          <div className="container" style={{ maxWidth: 840 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div className="section-label" style={{ fontSize: 12, letterSpacing: '0.2em' }}>Frequently Asked Questions</div>
              <h2 className="section-title" style={{ fontSize: isMobile ? 26 : 36 }}>Common Questions about {data.title}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.faqs.map((faq, idx) => (
                <div key={idx} style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: isMobile ? '20px' : '24px 28px',
                  border: '1px solid var(--kraft-200)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: 'var(--kraft-950)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <HelpCircle size={20} color="var(--eco-600)" style={{ flexShrink: 0 }} />
                    {faq.q}
                  </h3>
                  <p style={{ fontSize: 15, color: 'var(--kraft-700)', lineHeight: 1.6, paddingLeft: 30 }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Bottom ── */}
      <section className="section-padding" style={{
        background: 'linear-gradient(135deg, #1a1208 0%, #3d2e1a 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', color: 'white', position: 'relative', zIndex: 1 }}>
            <Leaf size={isMobile ? 48 : 64} color="var(--eco-500)" style={{ marginBottom: 32, opacity: 0.8 }} />

            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: 24, position: 'relative', lineHeight: 1.1 }}>
              Elevate Your Packaging<br/>Experience Today
            </h2>
            <p style={{ fontSize: isMobile ? 16 : 20, color: 'rgba(255,255,255,0.7)', maxWidth: 700, margin: '0 auto 48px', position: 'relative', lineHeight: 1.6 }}>
              Join hundreds of retail, food, and e-commerce brands that trust Nirmalyam Krafts for premium, eco-friendly sustainable packaging solutions in Pune, India.
            </p>
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: 16, 
              justifyContent: 'center', 
              position: 'relative',
              maxWidth: 500,
              margin: '0 auto'
            }} className="cta-buttons">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{
                background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                color: 'white',
                padding: '18px 32px',
                borderRadius: '20px',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: 16,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                border: '2px solid rgba(255,255,255,0.4)',
              }}>
                <Phone size={20} fill="white" /> Wholesale Inquiry
              </a>
              <Link to="/quote" style={{
                padding: '18px 32px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: 16,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10
              }}>
                <Zap size={20} /> Request Custom Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes quoteFadeUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @media (max-width: 991px) {
          .category-hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .cta-buttons { flex-direction: column !important; align-items: stretch !important; }
          .cta-buttons > * { text-align: center !important; }
        }
        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
        @media (max-width: 480px) {
          .specs-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .gallery-grid div:hover .gallery-overlay {
          opacity: 1 !important;
        }
        .gallery-grid div:hover .gallery-overlay a {
          transform: translateY(0) !important;
        }
        .gallery-grid div:hover .gallery-img {
          transform: scale(1.05) !important;
        }
      `}</style>

      {/* ══════════════════ PAGE POPUP ══════════════════ */}
      <PagePopup pageType="products" />
    </div>
  );
}
