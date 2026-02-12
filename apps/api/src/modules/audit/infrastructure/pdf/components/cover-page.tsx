import { Page, View, Text } from '@react-pdf/renderer';

import { styles, COLORS, SPACING } from '../styles';

interface CoverPageProps {
  brandName: string;
  domain: string;
  completedAt: Date;
}

export function CoverPage({
  brandName,
  domain,
  completedAt,
}: CoverPageProps): React.JSX.Element {
  const formattedDate = completedAt.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Page size="A4" style={styles.page}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 36,
            fontFamily: 'Helvetica-Bold',
            color: COLORS.purple,
            marginBottom: SPACING.xl,
          }}
        >
          Coucou IA
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: COLORS.gray400,
            marginBottom: SPACING.lg,
          }}
        >
          {"Rapport d'Audit GEO"}
        </Text>

        <Text
          style={{
            fontSize: 32,
            fontFamily: 'Helvetica-Bold',
            color: COLORS.white,
            marginBottom: SPACING.sm,
            textAlign: 'center',
          }}
        >
          {brandName}
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: COLORS.purpleLight,
            marginBottom: SPACING.xxl,
          }}
        >
          {domain}
        </Text>

        <Text style={{ fontSize: 10, color: COLORS.gray500 }}>
          {formattedDate}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text>Coucou IA</Text>
        <Text>Confidentiel</Text>
      </View>
    </Page>
  );
}
