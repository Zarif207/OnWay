/**
 * Network utility functions for checking connectivity and service availability
 */

/**
 * Check if the user has internet connectivity
 * @returns {boolean} True if online, false if offline
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Test connectivity to a specific service
 * @param {string} url - URL to test
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} True if service is reachable
 */
export const testServiceConnectivity = async (url, timeout = 3000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors' // Avoid CORS issues for testing
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.warn(`Service connectivity test failed for ${url}:`, error.message);
    return false;
  }
};

/**
 * Test OSRM service availability
 * @returns {Promise<Object>} Service status information
 */
export const testOSRMConnectivity = async () => {
  const services = [
    'https://router.project-osrm.org',
    'https://routing.openstreetmap.de',
  ];
  
  const results = await Promise.allSettled(
    services.map(async (service) => {
      const isReachable = await testServiceConnectivity(service);
      return { service, isReachable };
    })
  );
  
  const serviceStatus = results.map((result, index) => ({
    service: services[index],
    isReachable: result.status === 'fulfilled' ? result.value.isReachable : false,
    error: result.status === 'rejected' ? result.reason.message : null
  }));
  
  const availableServices = serviceStatus.filter(s => s.isReachable).length;
  
  return {
    hasConnectivity: isOnline(),
    availableServices,
    totalServices: services.length,
    serviceStatus,
    recommendation: availableServices === 0 ? 
      'No routing services available. Using fallback calculations.' :
      `${availableServices}/${services.length} routing services available.`
  };
};

/**
 * Get network connection information
 * @returns {Object} Network connection details
 */
export const getNetworkInfo = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) {
    return {
      type: 'unknown',
      effectiveType: 'unknown',
      downlink: 'unknown',
      rtt: 'unknown'
    };
  }
  
  return {
    type: connection.type || 'unknown',
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || 'unknown',
    rtt: connection.rtt || 'unknown'
  };
};

/**
 * Monitor network status changes
 * @param {Function} callback - Callback function to call on status change
 * @returns {Function} Cleanup function to remove listeners
 */
export const monitorNetworkStatus = (callback) => {
  const handleOnline = () => callback({ online: true, timestamp: Date.now() });
  const handleOffline = () => callback({ online: false, timestamp: Date.now() });
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};