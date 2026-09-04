export interface User {
  id: string;
  outletId: string;
  name: string;
  pin: string; // hashed
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export type UserRole = 'owner' | 'manager' | 'cashier' | 'kitchen';

export interface Shift {
  id: string;
  outletId: string;
  registerId: string;
  userId: string;
  openedAt: string;
  closedAt: string | null;
  openingCash: number;
  closingCash: number | null;
  expectedCash: number | null;
  notes: string | null;
}
