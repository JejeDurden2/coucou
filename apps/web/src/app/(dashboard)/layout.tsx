import type { Metadata } from 'next';

import DashboardClient from './dashboard-client';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps): React.ReactNode {
  return <DashboardClient>{children}</DashboardClient>;
}
