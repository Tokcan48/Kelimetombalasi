// SEO Meta Tag Management Utility
// Handles canonical URLs, robots meta, and page-specific meta tags

const BASE_URL = 'https://kelimetombalasi.com'

/**
 * Set page meta tags dynamically
 * @param {Object} options - Meta tag options
 * @param {string} options.title - Page title
 * @param {string} options.description - Page description
 * @param {string} options.path - Current path (for canonical)
 * @param {string} options.robots - Robots meta (default: 'index, follow')
 * @param {boolean} options.noindex - Set to true for noindex pages
 */
export const setPageMeta = ({ title, description, path, robots = 'index, follow', noindex = false }) => {
  // Set document title
  if (title) {
    document.title = `${title} | Kelime Tombalası`
  }

  // Update or create meta description
  let metaDescription = document.querySelector('meta[name="description"]')
  if (!metaDescription) {
    metaDescription = document.createElement('meta')
    metaDescription.setAttribute('name', 'description')
    document.head.appendChild(metaDescription)
  }
  if (description) {
    metaDescription.setAttribute('content', description)
  }

  // Update or create robots meta
  let metaRobots = document.querySelector('meta[name="robots"]')
  if (!metaRobots) {
    metaRobots = document.createElement('meta')
    metaRobots.setAttribute('name', 'robots')
    document.head.appendChild(metaRobots)
  }
  
  if (noindex) {
    metaRobots.setAttribute('content', 'noindex, follow')
  } else {
    metaRobots.setAttribute('content', robots)
  }

  // Update or create canonical URL
  let canonical = document.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  
  if (path) {
    // Remove query parameters and hash for canonical
    const cleanPath = path.split('?')[0].split('#')[0]
    canonical.setAttribute('href', `${BASE_URL}${cleanPath}`)
  }
}

/**
 * Remove dynamic meta tags (cleanup)
 */
export const removeDynamicMeta = () => {
  // Keep base meta tags, only remove dynamic ones if needed
  // This is mainly for cleanup between route changes
}


