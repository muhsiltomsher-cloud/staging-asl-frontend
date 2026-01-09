'use client';

import { useEffect } from 'react';

// Check if the error is a ChunkLoadError (happens when deployment changes chunk hashes)
function isChunkLoadError(error: Error): boolean {
  return (
    error.name === 'ChunkLoadError' ||
    error.message.includes('ChunkLoadError') ||
    error.message.includes('Failed to load chunk') ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Failed to fetch dynamically imported module')
  );
}

// Session storage key to prevent infinite reload loops
const CHUNK_ERROR_RELOAD_KEY = 'chunk_error_reload_attempted';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Check if this is a chunk load error that should trigger auto-reload
  const shouldAutoReload = isChunkLoadError(error) && 
    typeof window !== 'undefined' && 
    !sessionStorage.getItem(CHUNK_ERROR_RELOAD_KEY);

  useEffect(() => {
    console.error('Global application error:', error);

    // Handle ChunkLoadError by reloading the page
    if (isChunkLoadError(error)) {
      // Check if we already tried reloading to prevent infinite loops
      const hasReloaded = sessionStorage.getItem(CHUNK_ERROR_RELOAD_KEY);
      
      if (!hasReloaded) {
        // Set flag to prevent infinite reload loop
        sessionStorage.setItem(CHUNK_ERROR_RELOAD_KEY, 'true');
        // Reload the page after a brief delay to get fresh chunks
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        // Clear the flag after showing the error UI so future chunk errors can trigger reload
        sessionStorage.removeItem(CHUNK_ERROR_RELOAD_KEY);
      }
    }
  }, [error]);

  // Show loading state while reloading for chunk errors
  if (shouldAutoReload) {
    return (
      <html>
        <body>
          <div style={{
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: '#f7f6f2',
          }}>
            <div style={{ textAlign: 'center', maxWidth: '500px' }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                border: '4px solid #78350f',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{
                fontSize: '1rem',
                color: '#92400e',
              }}>
                Updating application...
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#f7f6f2',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h1 style={{
              marginBottom: '1rem',
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#78350f',
            }}>
              Something went wrong
            </h1>
            <p style={{
              marginBottom: '2rem',
              fontSize: '1rem',
              color: '#92400e',
            }}>
              We apologize for the inconvenience. Please try again or refresh the page.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                color: 'white',
                backgroundColor: '#78350f',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            {error.digest && (
              <p style={{
                marginTop: '2rem',
                fontSize: '0.75rem',
                color: '#d97706',
              }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
