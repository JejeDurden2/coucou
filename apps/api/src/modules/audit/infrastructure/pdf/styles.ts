import { StyleSheet } from '@react-pdf/renderer';

export const COLORS = {
  background: '#0F0B1A',
  backgroundLight: '#1A1428',
  backgroundCard: '#231D33',
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  purpleDark: '#6D28D9',
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const SEVERITY_COLORS: Record<string, string> = {
  critical: COLORS.error,
  warning: COLORS.warning,
  info: COLORS.info,
} as const;

export const PRIORITY_COLORS: Record<string, string> = {
  critical: COLORS.error,
  high: COLORS.warning,
  medium: COLORS.info,
  low: COLORS.gray400,
} as const;

export const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.background,
    color: COLORS.white,
    paddingHorizontal: 40,
    paddingVertical: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  h1: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  h2: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.purple,
    marginBottom: SPACING.md,
  },
  h3: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  body: {
    fontSize: 10,
    color: COLORS.gray300,
    lineHeight: 1.5,
  },
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  tableRow: {
    flexDirection: 'row' as const,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2640',
    paddingVertical: 6,
    alignItems: 'center' as const,
  },
  tableHeader: {
    flexDirection: 'row' as const,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.purple,
    paddingVertical: 8,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    fontSize: 8,
    color: COLORS.gray500,
  },
});
