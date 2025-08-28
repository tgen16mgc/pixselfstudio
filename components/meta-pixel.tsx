'use client';

import Script from 'next/script';

export default function MetaPixel() {
  return (
    <>
      {/* Meta Pixel Code */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1978263126045475');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1978263126045475&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
      {/* End Meta Pixel Code */}
    </>
  );
}

// Helper function to track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, parameters);
  }
};

// Predefined events for the character creation app
export const trackCharacterCreated = (characterData?: any) => {
  trackEvent('CustomEvent', {
    event_name: 'CharacterCreated',
    character_data: characterData
  });
};

export const trackAssetSelected = (assetType: string, assetName: string) => {
  trackEvent('CustomEvent', {
    event_name: 'AssetSelected',
    asset_type: assetType,
    asset_name: assetName
  });
};

export const trackDownload = (format: string) => {
  trackEvent('CustomEvent', {
    event_name: 'CharacterDownloaded',
    download_format: format
  });
};

export const trackPurchaseIntent = (productName: string, price: number, currency: string = 'USD') => {
  // Track InitiateCheckout event (standard Meta Pixel event)
  trackEvent('InitiateCheckout', {
    content_name: productName,
    content_category: 'Physical Product',
    value: price,
    currency: currency
  });
  
  // Track custom event for detailed analytics
  trackEvent('CustomEvent', {
    event_name: 'BuyNowClicked',
    product_name: productName,
    product_category: 'Physical Product',
    price: price,
    currency: currency
  });
};
