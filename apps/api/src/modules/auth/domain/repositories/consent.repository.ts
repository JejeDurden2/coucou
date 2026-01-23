export const CONSENT_REPOSITORY = Symbol('CONSENT_REPOSITORY');

export type ConsentType = 'TERMS_OF_SERVICE' | 'PRIVACY_POLICY';
export type ConsentAction = 'ACCEPTED' | 'WITHDRAWN';

export interface LogConsentData {
  userId: string;
  type: ConsentType;
  action: ConsentAction;
  version: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ConsentLog {
  id: string;
  userId: string;
  type: ConsentType;
  action: ConsentAction;
  version: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface ConsentRepository {
  logConsent(data: LogConsentData): Promise<ConsentLog>;
  hasAcceptedCurrentTerms(userId: string, version: string): Promise<boolean>;
  getConsentHistory(userId: string): Promise<ConsentLog[]>;
}
