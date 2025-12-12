import { useEffect } from 'react'

/**
 * Hook to load Google AdSense script only on content pages
 * Prevents ads from showing on pages without sufficient content (Admin, Login, etc.)
 */
export function useAdSense() {
  useEffect(() => {
    // Check if AdSense script is already loaded
    const existingScript = document.querySelector('script[src*="adsbygoogle"]')
    
    if (existingScript) {
      return // Script already loaded
    }

    // Create and add AdSense script
    const script = document.createElement('script')
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=pub-5013733153774232'
    script.async = true
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)

    // Cleanup function
    return () => {
      // Don't remove script on unmount as it might be used by other components
      // The script will remain for navigation between content pages
    }
  }, [])
}


