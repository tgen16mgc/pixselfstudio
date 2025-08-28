'use client';

import Script from 'next/script';

export default function MetaPixel() {
  return (
    <>
      {/* Meta Pixel Code */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          console.log('🔧 Meta Pixel script loading...');
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          console.log('🔧 Meta Pixel script loaded, initializing...');
          fbq('init', '1978263126045475');
          fbq('track', 'PageView');
          console.log('🔧 Meta Pixel initialized and PageView tracked');
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

// Helper function to track custom events with error handling
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  console.log('🎯 trackEvent called with:', eventName, parameters);
  try {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      console.log('✅ fbq available, tracking event...');
      (window as any).fbq('track', eventName, parameters);
      console.log('📊 Meta Pixel Event Tracked:', eventName, parameters);
    } else {
      console.warn('⚠️ Meta Pixel not available for tracking:', eventName);
      console.log('🔍 Window check:', typeof window !== 'undefined');
      console.log('🔍 fbq check:', (window as any).fbq);
    }
  } catch (error) {
    console.error('❌ Meta Pixel tracking error:', error);
  }
};

// Predefined events for the character creation app
export const trackCharacterCreated = (characterData?: any) => {
  console.log('🎨 trackCharacterCreated called');
  trackEvent('CustomEvent', {
    event_name: 'CharacterCreated',
    character_data: characterData
  });
};

export const trackAssetSelected = (assetType: string, assetName: string) => {
  console.log('🎯 trackAssetSelected called:', assetType, assetName);
  trackEvent('CustomEvent', {
    event_name: 'AssetSelected',
    asset_type: assetType,
    asset_name: assetName
  });
};

export const trackDownload = (format: string) => {
  console.log('💾 trackDownload called:', format);
  trackEvent('CustomEvent', {
    event_name: 'CharacterDownloaded',
    download_format: format
  });
};
