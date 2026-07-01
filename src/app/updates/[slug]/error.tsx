'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>&#x26A0;&#xFE0F;</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1f2937' }}>
        Something went wrong
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: '480px' }}>
        We couldn&apos;t load this update right now. This is usually temporary — please try again in a moment.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
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
        <a href="/updates" style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.75rem 2rem',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: 600,
          color: '#059669',
          border: '2px solid #059669',
          textDecoration: 'none',
        }}>
          All Updates
        </a>
      </div>
    </div>
  );
}