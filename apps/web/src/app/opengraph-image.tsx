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
    (
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

        {/* Logo placeholder */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: '#8B5CF6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 24,
            }}
          >
            <span style={{ fontSize: 48, color: 'white' }}>👋</span>
          </div>
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
      </div>
    ),
    {
      ...size,
    },
  );
}
