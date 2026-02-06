import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Customer } from './src/customers/entities/customer.entity';
import {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
} from './src/config/env.config';

const firstNames = [
  'Ahmad',
  'Fatima',
  'Omar',
  'Layla',
  'Khaled',
  'Nour',
  'Sami',
  'Rania',
  'Tariq',
  'Hana',
  'Yousef',
  'Dina',
  'Zaid',
  'Sara',
  'Mahmoud',
  'Lina',
  'Ibrahim',
  'Mona',
  'Hassan',
  'Rana',
  'Ali',
  'Salma',
  'Fadi',
  'Aya',
  'Waleed',
  'Dalal',
  'Nabil',
  'Reem',
  'Jamal',
  'Amal',
];

const lastNames = [
  'Al-Rashid',
  'Haddad',
  'Mansour',
  'Nasser',
  'Khalil',
  'Othman',
  'Qasim',
  'Saleh',
  'Darwish',
  'Khoury',
  'Abuhamda',
  'Barakat',
  'Masri',
  'Shaheen',
  'Tamimi',
  'Zaghloul',
  'Husseini',
  'Issa',
  'Awad',
  'Bakri',
];

const internalNotes = [
  'VIP client — priority support',
  'Referred by partner agency',
  'Interested in commercial properties',
  'Prefers email communication',
  'High-value portfolio holder',
  'Pending KYC verification',
  'Repeat buyer — 3 previous transactions',
  'Requires Arabic-language documents',
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): Date {
  const now = Date.now();
  const offset = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(now - offset);
}

function generatePhone(): string {
  const prefix = ['77', '78', '79'][Math.floor(Math.random() * 3)];
  const number = Math.floor(Math.random() * 10_000_000)
    .toString()
    .padStart(7, '0');
  return `+962${prefix}${number}`;
}

function generateNationalId(): string {
  return Math.floor(Math.random() * 10_000_000_000)
    .toString()
    .padStart(10, '0');
}

function buildCustomers(count: number): Partial<Customer>[] {
  const usedEmails = new Set<string>();
  const customers: Partial<Customer>[] = [];

  for (let i = 0; i < count; i++) {
    const first = randomItem(firstNames);
    const last = randomItem(lastNames);
    let email = `${first.toLowerCase()}.${last.toLowerCase().replace(/-/g, '')}@example.com`;

    // Ensure unique emails
    let suffix = 1;
    while (usedEmails.has(email)) {
      email = `${first.toLowerCase()}.${last.toLowerCase().replace(/-/g, '')}${suffix}@example.com`;
      suffix++;
    }
    usedEmails.add(email);

    const hasSensitive = Math.random() < 0.4;
    const createdAt = randomDate(90);

    customers.push({
      full_name: `${first} ${last}`,
      email,
      phone_number: generatePhone(),
      national_id: hasSensitive ? generateNationalId() : null,
      internal_notes: hasSensitive ? randomItem(internalNotes) : null,
      created_at: createdAt,
      updated_at: createdAt,
    });
  }

  return customers;
}

async function seed() {
  console.log('Connecting to database...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    entities: [Customer],
    synchronize: true,
  });

  await dataSource.initialize();

  const count = 50;
  const customers = buildCustomers(count);

  console.log(`Inserting ${count} customers...`);

  const repo = dataSource.getRepository(Customer);
  await repo.save(customers);

  console.log(`Seed complete. ${count} customers inserted.`);

  await dataSource.destroy();
}

seed().catch((error: Error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
