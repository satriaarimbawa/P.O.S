export interface License {
  id: string;
  tenantId: string;
  outletId: string;
  licenseKey: string;
  activatedAt: string | null;
  expiresAt: string;
  status: LicenseStatus;
  machineId: string | null;
}

export type LicenseStatus = 'pending' | 'active' | 'expired' | 'revoked';

export interface LicensePayload {
  tenantId: string;
  outletId: string;
  plan: string;
  expiresAt: string;
  issuedAt: string;
}

export interface ActivationRequest {
  licenseKey: string;
  machineId: string;
  appVersion: string;
}

export interface ActivationResponse {
  success: boolean;
  tenant: {
    name: string;
    businessName: string;
    logoUrl: string | null;
    brandColor: string;
    receiptHeader: string;
    receiptFooter: string;
  };
  outlet: {
    id: string;
    name: string;
    code: string;
  };
  expiresAt: string;
}
