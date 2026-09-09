import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MaterialCategory = 'Kopi' | 'Dairy' | 'Sirup' | 'Bubuk' | 'Pastry' | 'Packaging' | 'Lainnya';

export interface RawMaterial {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: string; // 'kg', 'Liter', 'Gram', 'Pcs', 'Set'
  unitCost: number; // HPP per satuan (IDR)
  startStock: number; // Stok Awal Pembukaan
  stockIn: number; // Total Stok Masuk Hari Ini
  usedSystem: number; // Terpakai Berdasarkan Resep POS
  actualPhysicalStock: number; // Stok Fisik Terkini (Hasil Opname)
  alertThreshold: number; // Batas Minimum Stok
}

export interface StockInItem {
  materialId: string;
  materialName: string;
  qty: number;
  unit: string;
  unitCost: number;
  subtotal: number;
}

export interface StockInLog {
  id: string;
  date: string; // ISO String
  supplierName: string;
  invoiceNo: string;
  receivedBy: string;
  notes?: string;
  items: StockInItem[];
  totalAmount: number;
}

export interface StockTakeEntry {
  materialId: string;
  materialName: string;
  category: MaterialCategory;
  unit: string;
  unitCost: number;
  systemExpectedStock: number;
  actualCountedStock: number;
  varianceQty: number; // actual - systemExpected
  varianceCost: number; // varianceQty * unitCost
  status: 'accurate' | 'deficit' | 'surplus';
}

export interface StockTakeLog {
  id: string;
  date: string; // ISO String
  shiftName: string; // 'Shift 1 (Pagi)' | 'Shift 2 (Malam)' | 'Closing Harian'
  conductedBy: string;
  notes?: string;
  entries: StockTakeEntry[];
  totalVarianceCost: number;
  totalDeficitCost: number; // Wastage Cost
}

interface InventoryState {
  materials: RawMaterial[];
  stockInLogs: StockInLog[];
  stockTakeLogs: StockTakeLog[];
  
  // Actions
  addStockIn: (data: {
    supplierName: string;
    invoiceNo: string;
    receivedBy: string;
    notes?: string;
    items: { materialId: string; qty: number; unitCost: number }[];
  }) => void;

  submitDailyStockTake: (data: {
    shiftName: string;
    conductedBy: string;
    notes?: string;
    countedStocks: { [materialId: string]: number };
  }) => StockTakeLog;

  updateMaterialPhysicalStock: (materialId: string, actualStock: number) => void;
  updateMaterialUnitCost: (materialId: string, unitCost: number) => void;
  addMaterial: (material: Omit<RawMaterial, 'id' | 'stockIn' | 'usedSystem'>) => void;
  resetToDefaults: () => void;
}

export const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  {
    id: 'mat_1',
    name: 'Biji Kopi House Blend (Espresso)',
    category: 'Kopi',
    unit: 'kg',
    unitCost: 160000,
    startStock: 6.00,
    stockIn: 0.00,
    usedSystem: 2.84,
    actualPhysicalStock: 3.10, // Sisa sistem: 3.16 -> Selisih: -0.06 kg (-Rp 9.600)
    alertThreshold: 1.5,
  },
  {
    id: 'mat_2',
    name: 'Fresh Milk Pasteurisasi',
    category: 'Dairy',
    unit: 'Liter',
    unitCost: 22000,
    startStock: 20.0,
    stockIn: 10.0,
    usedSystem: 14.2,
    actualPhysicalStock: 15.0, // Sisa sistem: 15.8 -> Selisih: -0.8 L (-Rp 17.600)
    alertThreshold: 5.0,
  },
  {
    id: 'mat_3',
    name: 'Oat Milk Barista Edition',
    category: 'Dairy',
    unit: 'Liter',
    unitCost: 45000,
    startStock: 10.0,
    stockIn: 0.0,
    usedSystem: 3.5,
    actualPhysicalStock: 6.5, // Sisa sistem: 6.5 -> Selisih: 0 L
    alertThreshold: 2.0,
  },
  {
    id: 'mat_4',
    name: 'Sirup Gula Aren Cair Organik',
    category: 'Sirup',
    unit: 'Liter',
    unitCost: 35000,
    startStock: 5.0,
    stockIn: 0.0,
    usedSystem: 2.1,
    actualPhysicalStock: 2.8, // Sisa sistem: 2.9 -> Selisih: -0.1 L (-Rp 3.500)
    alertThreshold: 1.0,
  },
  {
    id: 'mat_5',
    name: 'Matcha Powder Ceremonial Uji',
    category: 'Bubuk',
    unit: 'Gram',
    unitCost: 600, // Rp 600/g = Rp 600.000/kg
    startStock: 1000,
    stockIn: 0,
    usedSystem: 360,
    actualPhysicalStock: 630, // Sisa sistem: 640 -> Selisih: -10 g (-Rp 6.000)
    alertThreshold: 200,
  },
  {
    id: 'mat_6',
    name: 'Butter Croissant Dough (Frozen)',
    category: 'Pastry',
    unit: 'Pcs',
    unitCost: 12000,
    startStock: 40,
    stockIn: 0,
    usedSystem: 26,
    actualPhysicalStock: 14, // Sisa sistem: 14 -> Selisih: 0 pcs
    alertThreshold: 10,
  },
  {
    id: 'mat_7',
    name: 'Cup PET 16oz + Lid + Paper Straw',
    category: 'Packaging',
    unit: 'Set',
    unitCost: 1500,
    startStock: 300,
    stockIn: 0,
    usedSystem: 130,
    actualPhysicalStock: 168, // Sisa sistem: 170 -> Selisih: -2 set (-Rp 3.000)
    alertThreshold: 50,
  },
];

export const INITIAL_STOCK_IN_LOGS: StockInLog[] = [
  {
    id: 'in_101',
    date: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    supplierName: 'Cimory Fresh Dairy Hub',
    invoiceNo: 'INV-CMR-8821',
    receivedBy: 'Sari N. (Barista)',
    notes: 'Pengiriman Fresh Milk batch pagi dingin tersegel',
    items: [
      {
        materialId: 'mat_2',
        materialName: 'Fresh Milk Pasteurisasi',
        qty: 10,
        unit: 'Liter',
        unitCost: 22000,
        subtotal: 220000,
      }
    ],
    totalAmount: 220000,
  }
];

export const INITIAL_STOCK_TAKE_LOGS: StockTakeLog[] = [
  {
    id: 'st_001',
    date: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    shiftName: 'Shift 1 (Pagi)',
    conductedBy: 'Sari N. (Supervisor)',
    notes: 'Opname pergantian shift siang, kalibrasi espresso 3 double shot',
    entries: [
      {
        materialId: 'mat_1',
        materialName: 'Biji Kopi House Blend (Espresso)',
        category: 'Kopi',
        unit: 'kg',
        unitCost: 160000,
        systemExpectedStock: 4.5,
        actualCountedStock: 4.45,
        varianceQty: -0.05,
        varianceCost: -8000,
        status: 'deficit',
      },
      {
        materialId: 'mat_2',
        materialName: 'Fresh Milk Pasteurisasi',
        category: 'Dairy',
        unit: 'Liter',
        unitCost: 22000,
        systemExpectedStock: 18.0,
        actualCountedStock: 17.5,
        varianceQty: -0.5,
        varianceCost: -11000,
        status: 'deficit',
      },
    ],
    totalVarianceCost: -19000,
    totalDeficitCost: 19000,
  }
];

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      materials: INITIAL_RAW_MATERIALS,
      stockInLogs: INITIAL_STOCK_IN_LOGS,
      stockTakeLogs: INITIAL_STOCK_TAKE_LOGS,

      addStockIn: ({ supplierName, invoiceNo, receivedBy, notes, items }) => {
        const state = get();
        const fullItems: StockInItem[] = [];
        let totalAmount = 0;

        // Clone current materials
        const updatedMaterials = [...state.materials];

        items.forEach((itemInput) => {
          const matIndex = updatedMaterials.findIndex((m) => m.id === itemInput.materialId);
          if (matIndex !== -1) {
            const mat = updatedMaterials[matIndex];
            const subtotal = itemInput.qty * itemInput.unitCost;
            totalAmount += subtotal;

            fullItems.push({
              materialId: mat.id,
              materialName: mat.name,
              qty: itemInput.qty,
              unit: mat.unit,
              unitCost: itemInput.unitCost,
              subtotal,
            });

            // Update material stock & cost
            updatedMaterials[matIndex] = {
              ...mat,
              stockIn: Number((mat.stockIn + itemInput.qty).toFixed(2)),
              actualPhysicalStock: Number((mat.actualPhysicalStock + itemInput.qty).toFixed(2)),
              unitCost: itemInput.unitCost > 0 ? itemInput.unitCost : mat.unitCost,
            };
          }
        });

        const newLog: StockInLog = {
          id: `in_${Date.now()}`,
          date: new Date().toISOString(),
          supplierName: supplierName.trim(),
          invoiceNo: invoiceNo.trim() || `SJ-${Date.now().toString().slice(-6)}`,
          receivedBy: receivedBy.trim() || 'Staff Toko',
          notes: notes?.trim() || undefined,
          items: fullItems,
          totalAmount,
        };

        set({
          materials: updatedMaterials,
          stockInLogs: [newLog, ...state.stockInLogs],
        });
      },

      submitDailyStockTake: ({ shiftName, conductedBy, notes, countedStocks }) => {
        const state = get();
        const entries: StockTakeEntry[] = [];
        let totalVarianceCost = 0;
        let totalDeficitCost = 0;

        const updatedMaterials = state.materials.map((mat) => {
          const counted = countedStocks[mat.id] !== undefined ? countedStocks[mat.id] : mat.actualPhysicalStock;
          const systemExpected = Number((mat.startStock + mat.stockIn - mat.usedSystem).toFixed(2));
          const varianceQty = Number((counted - systemExpected).toFixed(2));
          const varianceCost = varianceQty * mat.unitCost;

          let status: 'accurate' | 'deficit' | 'surplus' = 'accurate';
          if (varianceQty < 0) {
            status = 'deficit';
            totalDeficitCost += Math.abs(varianceCost);
          } else if (varianceQty > 0) {
            status = 'surplus';
          }

          totalVarianceCost += varianceCost;

          entries.push({
            materialId: mat.id,
            materialName: mat.name,
            category: mat.category,
            unit: mat.unit,
            unitCost: mat.unitCost,
            systemExpectedStock: systemExpected,
            actualCountedStock: counted,
            varianceQty,
            varianceCost,
            status,
          });

          return {
            ...mat,
            actualPhysicalStock: counted,
          };
        });

        const newLog: StockTakeLog = {
          id: `st_${Date.now()}`,
          date: new Date().toISOString(),
          shiftName,
          conductedBy: conductedBy.trim() || 'Supervisor Shift',
          notes: notes?.trim() || undefined,
          entries,
          totalVarianceCost,
          totalDeficitCost,
        };

        set({
          materials: updatedMaterials,
          stockTakeLogs: [newLog, ...state.stockTakeLogs],
        });

        return newLog;
      },

      updateMaterialPhysicalStock: (materialId, actualStock) => {
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === materialId ? { ...m, actualPhysicalStock: actualStock } : m
          ),
        }));
      },

      updateMaterialUnitCost: (materialId, unitCost) => {
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === materialId ? { ...m, unitCost } : m
          ),
        }));
      },

      addMaterial: (materialData) => {
        const newId = `mat_${Date.now()}`;
        const newMat: RawMaterial = {
          ...materialData,
          id: newId,
          stockIn: 0,
          usedSystem: 0,
        };
        set((state) => ({
          materials: [...state.materials, newMat],
        }));
      },

      resetToDefaults: () => {
        set({
          materials: INITIAL_RAW_MATERIALS,
          stockInLogs: INITIAL_STOCK_IN_LOGS,
          stockTakeLogs: INITIAL_STOCK_TAKE_LOGS,
        });
      },
    }),
    {
      name: 'kopipos-inventory-storage',
    }
  )
);
