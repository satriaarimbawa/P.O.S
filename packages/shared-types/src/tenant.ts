export interface Tenant {
  id: string;
  name: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  logoUrl: string | null;
  brandColor: string;
  receiptHeader: string;
  receiptFooter: string;
  taxId: string | null; // NPWP
  plan: TenantPlan;
  status: TenantStatus;
  trialEndsAt: string | null;
  createdAt: string;
}

export type TenantPlan = 'trial' | 'basic' | 'pro' | 'enterprise';
export type TenantStatus = 'active' | 'trial' | 'suspended' | 'expired';

export interface Outlet {
  id: string;
  tenantId: string;
  name: string;
  code: string; // e.g. 'JKT01'
  address: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Register {
  id: string;
  outletId: string;
  name: string; // e.g. 'Kasir 1'
  licenseId: string | null;
  lastSeenAt: string | null;
}
