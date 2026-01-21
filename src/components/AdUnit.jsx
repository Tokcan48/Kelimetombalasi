/**
 * AdSense Ad Unit Component
 * 
 * IMPORTANT: Currently disabled - AdSense script is not loaded
 * This component is prepared for future use when AdSense is re-enabled
 * 
 * Usage:
 * <AdUnit slot="1234567890" format="auto" style={{ display: 'block' }} />
 * 
 * Rules:
 * - Ads should be placed within or between content sections
 * - Ads should NOT be placed inside tool/input areas
 * - Ads should NOT be placed in print preview areas
 * - Ads are automatically hidden in print mode via CSS
 */

import { useEffect, useRef } from 'react'

function AdUnit({ slot, format = 'auto', style = { display: 'block' }, className = '' }) {
  const adRef = useRef(null)

  useEffect(() => {
    // Only initialize if AdSense script is loaded
    if (typeof window !== 'undefined' && window.adsbygoogle && adRef.current) {
      try {
        // Push ad to AdSense
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (e) {
        // Silently handle errors (e.g., ad blocker)
        if (import.meta.env.DEV) {
          console.info('AdSense ad unit initialization skipped:', e.message)
        }
      }
    }
  }, [])

  // If AdSense is disabled, return null (no ad shown)
  if (typeof window === 'undefined' || !window.adsbygoogle) {
    return null
  }

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style
        }}
        data-ad-client="ca-pub-5013733153774232"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}

export default AdUnit


