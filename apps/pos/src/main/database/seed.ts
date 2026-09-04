import bcrypt from 'bcryptjs';
import { getDb } from './connection';
import * as schema from './schema';
// Mocking generateId for now as the package might not exist yet
const generateId = () => Math.random().toString(36).substring(2, 15);

export async function seed() {
  const db = getDb();
  const now = new Date().toISOString();
  
  // Create outlet
  const outletId = generateId();
  db.insert(schema.outlets).values({
    id: outletId,
    tenantId: 'tenant-1',
    name: 'Kopi Nusa Senopati',
    code: 'JKT01',
    createdAt: now,
  }).run();

  // Categories
  const catKopi = generateId();
  const catNonKopi = generateId();
  const catMakanan = generateId();
  const catSnack = generateId();
  
  db.insert(schema.categories).values([
    { id: catKopi, outletId, name: 'Kopi', sortOrder: 1, isActive: true },
    { id: catNonKopi, outletId, name: 'Non-Kopi', sortOrder: 2, isActive: true },
    { id: catMakanan, outletId, name: 'Makanan', sortOrder: 3, isActive: true },
    { id: catSnack, outletId, name: 'Snack', sortOrder: 4, isActive: true },
  ]).run();

  // Products
  const prodEspresso = generateId();
  const prodLatte = generateId();
  
  db.insert(schema.products).values([
    { id: prodEspresso, categoryId: catKopi, name: 'Espresso', price: 18000, isActive: true, trackInventory: false },
    { id: generateId(), categoryId: catKopi, name: 'Americano', price: 22000, isActive: true, trackInventory: false },
    { id: prodLatte, categoryId: catKopi, name: 'Latte', price: 32000, isActive: true, trackInventory: false },
    { id: generateId(), categoryId: catKopi, name: 'Cappuccino', price: 32000, isActive: true, trackInventory: false },
    { id: generateId(), categoryId: catKopi, name: 'Mocha', price: 35000, isActive: true, trackInventory: false },
    { id: generateId(), categoryId: catNonKopi, name: 'Matcha Latte', price: 38000, isActive: true, trackInventory: false },
    { id: generateId(), categoryId: catNonKopi, name: 'Coklat Panas', price: 28000, isActive: true, trackInventory: false },
    { id: generateId(), categoryId: catNonKopi, name: 'Teh Tarik', price: 22000, isActive: true, trackInventory: false },
    { id: generateId(), categoryId: catMakanan, name: 'Nasi Goreng', price: 35000, isActive: true, trackInventory: false },
    { id: generateId(), categoryId: catMakanan, name: 'Indomie Goreng', price: 25000, isActive: true, trackInventory: false },
    { id: generateId(), categoryId: catMakanan, name: 'Roti Bakar', price: 20000, isActive: true, trackInventory: false },
    { id: generateId(), categoryId: catSnack, name: 'Kentang Goreng', price: 25000, isActive: true, trackInventory: false },
    { id: generateId(), categoryId: catSnack, name: 'Pisang Goreng', price: 18000, isActive: true, trackInventory: false },
    { id: generateId(), categoryId: catNonKopi, name: 'Es Teh Manis', price: 12000, isActive: true, trackInventory: false },
    { id: generateId(), categoryId: catNonKopi, name: 'Es Jeruk', price: 15000, isActive: true, trackInventory: false },
  ]).run();

  // Modifiers
  const modUkuran = generateId();
  db.insert(schema.modifiers).values([
    { id: modUkuran, productId: prodLatte, name: 'Ukuran', isRequired: true, minSelect: 1, maxSelect: 1 },
  ]).run();

  db.insert(schema.modifierOptions).values([
    { id: generateId(), modifierId: modUkuran, name: 'Regular', priceAdd: 0 },
    { id: generateId(), modifierId: modUkuran, name: 'Large', priceAdd: 5000 },
  ]).run();

  // Users
  const adminPin = bcrypt.hashSync('1234', 10);
  const cashierPin = bcrypt.hashSync('0000', 10);

  db.insert(schema.users).values([
    { id: generateId(), outletId, name: 'Admin', pin: adminPin, role: 'ADMIN', isActive: true, createdAt: now },
    { id: generateId(), outletId, name: 'Cashier 1', pin: cashierPin, role: 'CASHIER', isActive: true, createdAt: now },
  ]).run();
}
