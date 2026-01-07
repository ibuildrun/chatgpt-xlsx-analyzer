import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <h2 style={{ fontSize: '4rem', margin: 0 }}>404</h2>
      <p style={{ color: '#666' }}>Page not found</p>
      <Link
        href="/"
        style={{
          padding: '0.5rem 1rem',
          background: 'black',
          color: 'white',
          textDecoration: 'none',
        }}
      >
        Go home
      </Link>
    </div>
  );
}
