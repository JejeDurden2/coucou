import { Page, View, Text } from '@react-pdf/renderer';

import { styles, COLORS, SPACING } from '../styles';

interface CtaPageProps {
  brandName: string;
}

export function CtaPage({ brandName }: CtaPageProps): React.JSX.Element {
  return (
    <Page size="A4" style={styles.page}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: SPACING.xl,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontFamily: 'Helvetica-Bold',
            color: COLORS.white,
            textAlign: 'center',
            marginBottom: SPACING.lg,
          }}
        >
          {"Passez à l'action"}
        </Text>

        <Text
          style={{
            fontSize: 12,
            color: COLORS.gray300,
            textAlign: 'center',
            marginBottom: SPACING.xxl,
            lineHeight: 1.6,
          }}
        >
          {`Ce rapport a identifié des opportunités concrètes pour ${brandName}. Notre accompagnement étape 3 vous permet de mettre en œuvre chaque recommandation avec un suivi personnalisé.`}
        </Text>

        <View
          style={{
            backgroundColor: COLORS.purple,
            paddingHorizontal: SPACING.xl,
            paddingVertical: SPACING.md,
            borderRadius: 8,
            marginBottom: SPACING.lg,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'Helvetica-Bold',
              color: COLORS.white,
              textAlign: 'center',
            }}
          >
            {"Découvrir l'accompagnement GEO"}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 10,
            color: COLORS.gray400,
            textAlign: 'center',
          }}
        >
          coucou-ia.com
        </Text>
      </View>

      <View
        style={{
          ...styles.footer,
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 8, color: COLORS.gray500 }}>
          {'© Coucou IA — Rapport confidentiel'}
        </Text>
      </View>
    </Page>
  );
}
