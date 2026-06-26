'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#f9fafb',
        color: '#1f2937',
      }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '480px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            We couldn&apos;t load this page right now. This is usually temporary — please try again in a moment.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
          <a href="/" style={{ display: 'block', marginTop: '1rem', color: '#059669', textDecoration: 'none' }}>
            ← Back to Home
          </a>
        </div>
      </body>
    </html>
  );
}