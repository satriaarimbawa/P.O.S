import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductItem } from '../components/pos/ModifierModal';
import { CategoryData } from '../components/pos/MenuGrid';
import { Coffee, CupSoda, Utensils, Cookie } from 'lucide-react';

export const DEFAULT_CATEGORIES: CategoryData[] = [
  { 
    id: 'cat_kopi', 
    name: 'Kopi & Espresso', 
    emoji: '☕',
    icon: Coffee,
    colorTheme: 'from-amber-600 to-amber-900',
    bgColor: 'bg-amber-50/80 hover:bg-amber-100/80',
    borderColor: 'border-amber-200 hover:border-amber-400',
    textColor: 'text-amber-900',
    badgeBg: 'bg-amber-100 text-amber-800',
    station: 'BARISTA',
    description: 'Espresso, Latte, Cappuccino, Caramel & Aren',
  },
  { 
    id: 'cat_nonkopi', 
    name: 'Non-Kopi & Teh', 
    emoji: '🍵',
    icon: CupSoda,
    colorTheme: 'from-emerald-600 to-teal-900',
    bgColor: 'bg-emerald-50/80 hover:bg-emerald-100/80',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
    textColor: 'text-emerald-900',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    station: 'BARISTA',
    description: 'Matcha Latte, Coklat Klasik, & Teh Tarik',
  },
  { 
    id: 'cat_makanan', 
    name: 'Makanan Utama', 
    emoji: '🍛',
    icon: Utensils,
    colorTheme: 'from-orange-500 to-red-800',
    bgColor: 'bg-orange-50/80 hover:bg-orange-100/80',
    borderColor: 'border-orange-200 hover:border-orange-400',
    textColor: 'text-orange-900',
    badgeBg: 'bg-orange-100 text-orange-800',
    station: 'HOT_KITCHEN',
    description: 'Nasi Goreng, Indomie Telur, & Roti Bakar',
  },
  { 
    id: 'cat_snack', 
    name: 'Snack & Pastry', 
    emoji: '🥐',
    icon: Cookie,
    colorTheme: 'from-yellow-500 to-amber-800',
    bgColor: 'bg-yellow-50/80 hover:bg-yellow-100/80',
    borderColor: 'border-yellow-200 hover:border-yellow-400',
    textColor: 'text-yellow-900',
    badgeBg: 'bg-yellow-100 text-yellow-800',
    station: 'BAKERY',
    description: 'Croissant Butter, Fries, & Pisang Goreng',
  },
];

export const DEFAULT_PRODUCTS: ProductItem[] = [
  { id: 'p1', categoryId: 'cat_kopi', name: 'Iced Latte', price: 32000, station: 'BARISTA', hasModifiers: true },
  { id: 'p2', categoryId: 'cat_kopi', name: 'Americano', price: 22000, station: 'BARISTA', hasModifiers: true },
  { id: 'p3', categoryId: 'cat_kopi', name: 'Cappuccino', price: 32000, station: 'BARISTA', hasModifiers: true },
  { id: 'p4', categoryId: 'cat_kopi', name: 'Kopi Susu Gula Aren', price: 28000, station: 'BARISTA', hasModifiers: true },
  { id: 'p5', categoryId: 'cat_kopi', name: 'Espresso Single', price: 18000, station: 'BARISTA', hasModifiers: false },
  { id: 'p6', categoryId: 'cat_kopi', name: 'Caramel Macchiato', price: 35000, station: 'BARISTA', hasModifiers: true },
  { id: 'p7', categoryId: 'cat_nonkopi', name: 'Matcha Latte', price: 38000, station: 'BARISTA', hasModifiers: true },
  { id: 'p8', categoryId: 'cat_nonkopi', name: 'Coklat Klasik', price: 28000, station: 'BARISTA', hasModifiers: true },
  { id: 'p9', categoryId: 'cat_nonkopi', name: 'Teh Tarik Special', price: 22000, station: 'BARISTA', hasModifiers: false },
  { id: 'p10', categoryId: 'cat_makanan', name: 'Nasi Goreng Spesial', price: 35000, station: 'HOT_KITCHEN', hasModifiers: false },
  { id: 'p11', categoryId: 'cat_makanan', name: 'Indomie Goreng Telur', price: 25000, station: 'HOT_KITCHEN', hasModifiers: false },
  { id: 'p12', categoryId: 'cat_makanan', name: 'Roti Bakar Coklat Keju', price: 20000, station: 'HOT_KITCHEN', hasModifiers: false },
  { id: 'p13', categoryId: 'cat_snack', name: 'Croissant Butter', price: 25000, station: 'BAKERY', hasModifiers: false },
  { id: 'p14', categoryId: 'cat_snack', name: 'Kentang Goreng (Fries)', price: 22000, station: 'HOT_KITCHEN', hasModifiers: false },
  { id: 'p15', categoryId: 'cat_snack', name: 'Pisang Goreng Madu', price: 18000, station: 'HOT_KITCHEN', hasModifiers: false },
];

interface CatalogState {
  categories: CategoryData[];
  products: ProductItem[];
  addCategory: (category: Omit<CategoryData, 'icon'> & { icon?: any }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addProduct: (product: Omit<ProductItem, 'id'> & { id?: string }) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductPrice: (id: string, newPrice: number) => Promise<void>;
  resetToDefaults: () => void;
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      categories: DEFAULT_CATEGORIES,
      products: DEFAULT_PRODUCTS,

      addCategory: async (categoryData) => {
        const id = categoryData.id || `cat_${Date.now()}`;
        const newCat: CategoryData = {
          ...categoryData,
          id,
          icon: categoryData.icon || Coffee,
          colorTheme: categoryData.colorTheme || 'from-indigo-600 to-indigo-900',
          bgColor: categoryData.bgColor || 'bg-indigo-50/80 hover:bg-indigo-100/80',
          borderColor: categoryData.borderColor || 'border-indigo-200 hover:border-indigo-400',
          textColor: categoryData.textColor || 'text-indigo-900',
          badgeBg: categoryData.badgeBg || 'bg-indigo-100 text-indigo-800',
          station: categoryData.station || 'BARISTA',
          description: categoryData.description || 'Menu kategori baru',
        };

        if ((window as any).posAPI?.createCategory) {
          try {
            await (window as any).posAPI.createCategory({ id, name: newCat.name });
          } catch (e) {
            console.warn('IPC createCategory failed:', e);
          }
        }

        set({ categories: [...get().categories, newCat] });
      },

      deleteCategory: async (id: string) => {
        if ((window as any).posAPI?.deleteCategory) {
          try {
            await (window as any).posAPI.deleteCategory(id);
          } catch (e) {
            console.warn('IPC deleteCategory failed:', e);
          }
        }
        set({
          categories: get().categories.filter((c) => c.id !== id),
          products: get().products.filter((p) => p.categoryId !== id),
        });
      },

      addProduct: async (productData) => {
        const id = productData.id || `p_${Date.now()}`;
        const newProd: ProductItem = {
          ...productData,
          id,
          hasModifiers: productData.hasModifiers ?? false,
        };

        if ((window as any).posAPI?.createProduct) {
          try {
            await (window as any).posAPI.createProduct(newProd);
          } catch (e) {
            console.warn('IPC createProduct failed:', e);
          }
        }

        set({ products: [...get().products, newProd] });
      },

      deleteProduct: async (id: string) => {
        if ((window as any).posAPI?.deleteProduct) {
          try {
            await (window as any).posAPI.deleteProduct(id);
          } catch (e) {
            console.warn('IPC deleteProduct failed:', e);
          }
        }
        set({ products: get().products.filter((p) => p.id !== id) });
      },

      updateProductPrice: async (id: string, newPrice: number) => {
        const updated = get().products.map((p) => (p.id === id ? { ...p, price: newPrice } : p));
        const item = updated.find((p) => p.id === id);
        if (item && (window as any).posAPI?.createProduct) {
          try {
            await (window as any).posAPI.createProduct(item);
          } catch (e) {
            console.warn('IPC updateProduct failed:', e);
          }
        }
        set({ products: updated });
      },

      resetToDefaults: () => {
        set({ categories: DEFAULT_CATEGORIES, products: DEFAULT_PRODUCTS });
      },
    }),
    {
      name: 'kopipos-catalog-storage',
    }
  )
);
