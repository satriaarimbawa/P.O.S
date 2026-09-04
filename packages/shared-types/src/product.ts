export interface Category {
  id: string;
  outletId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  costPrice: number | null;
  sku: string | null;
  imagePath: string | null;
  station: KitchenStation;
  isActive: boolean;
  trackInventory: boolean;
}

export type KitchenStation = 'BARISTA' | 'HOT_KITCHEN' | 'COLD_KITCHEN' | 'BAKERY' | 'BAR' | 'NONE';

export interface Modifier {
  id: string;
  name: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  modifierId: string;
  name: string;
  priceAdd: number;
}
