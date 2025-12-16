import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const defaults = {
  title: 'Sendbase - Email API for Developers',
  description: 'Send transactional and marketing emails at scale with Sendbase. Simple REST API, high deliverability, real-time analytics, and developer-friendly SDKs.',
  keywords: 'email API, transactional email, email delivery, SMTP API, email service, developer email, email infrastructure',
  siteUrl: 'https://sendbase.app',
  ogImage: 'https://sendbase.app/og-image.png',
};

export function SEO({
  title,
  description = defaults.description,
  keywords = defaults.keywords,
  canonical,
  ogType = 'website',
  ogImage = defaults.ogImage,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | Sendbase` : defaults.title;
  const canonicalUrl = canonical ? `${defaults.siteUrl}${canonical}` : undefined;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {canonicalUrl && <meta name="twitter:url" content={canonicalUrl} />}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
