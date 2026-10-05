import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_URL, BUSINESS_INFO, ROUTE_SEO } from '../config/seoConfig';

function updateMetaTag(attributeName, attributeValue, content) {
  if (!content) return;
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateLinkTag(rel, href) {
  if (!href) return;
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * SEOHead Component
 * Manages document head tags, canonical links, Open Graph, Twitter Cards, and JSON-LD schema
 */
export default function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  ogImage = `${SITE_URL}/Nirmalyam_Logo-removebg-preview.webp`,
  noindex = false,
  schemas = [],
}) {
  const location = useLocation();

  useEffect(() => {
    // 1. Resolve route defaults if not explicitly provided
    const routeData = ROUTE_SEO[location.pathname] || {};
    const finalTitle = title || routeData.title || `${BUSINESS_INFO.name} | Paper Bag Manufacturer in Pune`;
    const finalDescription = description || routeData.description || BUSINESS_INFO.tagline;
    const finalKeywords = keywords || routeData.keywords || '';
    const finalCanonical = canonical || routeData.canonical || `${SITE_URL}${location.pathname}`;
    const finalOgType = ogType || routeData.ogType || 'website';

    // 2. Set Document Title
    document.title = finalTitle;

    // 3. Set Primary Meta Tags
    updateMetaTag('name', 'description', finalDescription);
    if (finalKeywords) {
      updateMetaTag('name', 'keywords', finalKeywords);
    }
    updateMetaTag('name', 'author', BUSINESS_INFO.name);
    updateMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // 4. Set Canonical Link
    updateLinkTag('canonical', finalCanonical);

    // 5. Open Graph Meta Tags
    updateMetaTag('property', 'og:title', finalTitle);
    updateMetaTag('property', 'og:description', finalDescription);
    updateMetaTag('property', 'og:url', finalCanonical);
    updateMetaTag('property', 'og:type', finalOgType);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:site_name', BUSINESS_INFO.name);
    updateMetaTag('property', 'og:locale', 'en_IN');

    // 6. Twitter / X Cards
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', finalTitle);
    updateMetaTag('name', 'twitter:description', finalDescription);
    updateMetaTag('name', 'twitter:image', ogImage);

    // 7. Inject Base Schemas (Organization + WebSite + LocalBusiness)
    const baseSchemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: BUSINESS_INFO.name,
        legalName: BUSINESS_INFO.legalName,
        url: SITE_URL,
        logo: BUSINESS_INFO.logo,
        email: BUSINESS_INFO.email,
        telephone: BUSINESS_INFO.telephone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: BUSINESS_INFO.address.streetAddress,
          addressLocality: BUSINESS_INFO.address.addressLocality,
          addressRegion: BUSINESS_INFO.address.addressRegion,
          postalCode: BUSINESS_INFO.address.postalCode,
          addressCountry: BUSINESS_INFO.address.addressCountry,
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${SITE_URL}/#localbusiness`,
        name: BUSINESS_INFO.name,
        image: BUSINESS_INFO.logo,
        url: SITE_URL,
        telephone: BUSINESS_INFO.telephone,
        email: BUSINESS_INFO.email,
        priceRange: '₹₹ - Factory Wholesale Rates',
        address: {
          '@type': 'PostalAddress',
          streetAddress: BUSINESS_INFO.address.streetAddress,
          addressLocality: BUSINESS_INFO.address.addressLocality,
          addressRegion: BUSINESS_INFO.address.addressRegion,
          postalCode: BUSINESS_INFO.address.postalCode,
          addressCountry: BUSINESS_INFO.address.addressCountry,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: BUSINESS_INFO.geo.latitude,
          longitude: BUSINESS_INFO.geo.longitude,
        },
        hasMap: BUSINESS_INFO.mapsUrl,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BUSINESS_INFO.name,
        description: BUSINESS_INFO.tagline,
        publisher: {
          '@id': `${SITE_URL}/#organization`,
        },
      },
      ...schemas,
    ];

    // Remove any prior dynamic schema script
    const existingScript = document.getElementById('seo-dynamic-schema');
    if (existingScript) {
      existingScript.remove();
    }

    // Append updated JSON-LD script
    const script = document.createElement('script');
    script.id = 'seo-dynamic-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(baseSchemas.length === 1 ? baseSchemas[0] : baseSchemas);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount if needed
    };
  }, [location.pathname, title, description, keywords, canonical, ogType, ogImage, noindex, schemas]);

  return null;
}
