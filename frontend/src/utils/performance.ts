/**
 * frontend/src/utils/performance.ts
 * Performance optimization utilities and lazy loading helpers
 */
import React from 'react';

// Lazy loading helper with retry mechanism
export const lazyWithRetry = (componentImport: () => Promise<any>) => {
  return React.lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const componentModule = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return componentModule;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Assuming that the user is not on the latest version of the application.
        // Let's refresh the page immediately.
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
      }
      throw error;
    }
  });
};

// Preload component helper
export const preloadComponent = (componentImport: () => Promise<any>) => {
  return () => {
    const componentImporter = lazyWithRetry(componentImport);
    // @ts-ignore - accessing _payload to preload
    componentImporter._payload && componentImporter._payload.then();
  };
};

// Bundle analyzer helper
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    // Inform developers how to generate a bundle analysis report with Vite
    console.log('Bundle analysis available using "npm run analyze" after build');
  }
};

// Performance measurement utilities
export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`${name}-start`);
    fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const measure = performance.getEntriesByName(name)[0];
    console.log(`${name}: ${measure.duration}ms`);
  } else {
    fn();
  }
};

// Web Vitals tracking
export const trackWebVitals = () => {
  if (typeof window !== 'undefined') {
    import('web-vitals')
      .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      })
      .catch(() => {
        console.log('Web Vitals not available');
      });
  }
};

// Image lazy loading with Intersection Observer
export const createImageLazyLoader = () => {
  const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  return {
    observe: (img: HTMLImageElement) => imageObserver.observe(img),
    disconnect: () => imageObserver.disconnect(),
  };
};

// Component performance monitoring HOC
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    React.useEffect(() => {
      const startTime = performance.now();

      return () => {
        const endTime = performance.now();
        console.log(`${componentName} render time: ${endTime - startTime}ms`);
      };
    });

    return React.createElement(WrappedComponent, props);
  });
};
