import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Coucou IA - Outil GEO pour améliorer votre visibilité dans ChatGPT et Claude';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: '#080A12',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 100px',
        position: 'relative',
      }}
    >
      {/* Grid pattern overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          right: 100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.1)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          right: 50,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.1)',
        }}
      />

      {/* Logo - Coucou bird */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 40,
        }}
      >
        <svg width="80" height="80" viewBox="0 0 48 48" fill="none" style={{ marginRight: 24 }}>
          {/* Body - rounded speech bubble shape */}
          <path
            d="M8 20C8 12.268 14.268 6 22 6h4c7.732 0 14 6.268 14 14v4c0 7.732-6.268 14-14 14h-2l-6 6v-6.17C11.058 35.93 8 30.374 8 24v-4z"
            fill="#8B5CF6"
          />
          {/* Eye */}
          <circle cx="28" cy="20" r="4" fill="#09090B" />
          <circle cx="29.5" cy="18.5" r="1.5" fill="#FFFFFF" />
          {/* Beak */}
          <path d="M36 22l6 2-6 2v-4z" fill="#8B5CF6" />
          {/* Wing detail */}
          <path
            d="M14 22c2-4 6-6 10-6"
            stroke="#09090B"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>
        <span
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#8B5CF6',
          }}
        >
          Coucou IA
        </span>
      </div>

      {/* Main text */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: 'white',
          lineHeight: 1.2,
          marginBottom: 24,
          maxWidth: '90%',
        }}
      >
        Votre marque est-elle visible dans ChatGPT et Claude ?
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 28,
          color: '#94A3B8',
          marginBottom: 40,
        }}
      >
        Outil GEO pour surveiller et améliorer votre visibilité IA
      </div>

      {/* URL */}
      <div
        style={{
          fontSize: 24,
          color: '#64748B',
        }}
      >
        coucou-ia.com
      </div>
    </div>,
    {
      ...size,
    },
  );
}
