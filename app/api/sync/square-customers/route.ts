import { NextResponse } from 'next/server';

const SQUARE_BASE_URL = 'https://connect.squareup.com';
const SQUARE_API_VERSION = '2026-08-19';

type SquareCustomer = {
  id: string;
  given_name?: string;
  family_name?: string;
  email_address?: string;
  phone_number?: string;
  company_name?: string;
  birthday?: string;
  address?: Record<string, unknown>;
  note?: string;
  reference_id?: string;
  creation_source?: string;
  updated_at?: string;
};

const headers = () => ({
  'Square-Version': SQUARE_API_VERSION,
  Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN || ''}`,
  'Content-Type': 'application/json',
});

async function squareFetch(path: string, init: RequestInit = {}) {
  return fetch(`${SQUARE_BASE_URL}${path}`, {
    ...init,
    headers: { ...headers(), ...(init.headers || {}) },
    cache: 'no-store',
  });
}

async function fetchAllSquareCustomers(): Promise<SquareCustomer[]> {
  const customers: SquareCustomer[] = [];
  let cursor = '';

  for (let page = 0; page < 100; page += 1) {
    const params = new URLSearchParams({ limit: '100' });
    if (cursor) params.set('cursor', cursor);

    const response = await squareFetch(`/v2/customers?${params.toString()}`);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(`Square Customers API ${response.status}: ${JSON.stringify(data)}`);
    }

    if (Array.isArray(data.customers)) customers.push(...data.customers);
    cursor = String(data.cursor || '');
    if (!cursor) break;
  }

  return customers;
}

function toRow(customer: SquareCustomer) {
  const fullName = [customer.family_name, customer.given_name]
    .filter(Boolean)
    .join(' ')
    .trim() || customer.company_name || `Square顧客 (${customer.id.slice(0, 8)}...)`;

  return {
    id: customer.id,
    given_name: customer.given_name || null,
    family_name: customer.family_name || null,
    full_name: fullName,
    kana: null,
    phone_number: customer.phone_number || null,
    email_address: customer.email_address || null,
    company_name: customer.company_name || null,
    birthday: customer.birthday || null,
    address: customer.address || {},
    note: customer.note || null,
    reference_id: customer.reference_id || null,
    creation_source: customer.creation_source || null,
    square_updated_at: customer.updated_at || null,
    raw_data: customer,
  };
}

async function supabaseFetch(path: string, init: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const secretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

  if (!baseUrl || !secretKey) throw new Error('Supabase環境変数が設定されていません。');

  return fetch(`${baseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
}

export async function POST() {
  try {
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      return NextResponse.json({ success: false, error: 'SQUARE_ACCESS_TOKEN が設定されていません。' }, { status: 500 });
    }

    const customers = await fetchAllSquareCustomers();
    const rows = customers.map(toRow);

    // 全件を毎回置き換えるのではなく、既存顧客はIDでupsertし、新規顧客を蓄積します。
    // Square側で変更された顧客だけが実質的に更新され、既存の顧客レコードは残ります。
    for (let i = 0; i < rows.length; i += 100) {
      const chunk = rows.slice(i, i + 100);
      if (chunk.length === 0) continue;

      const response = await supabaseFetch('square_customers?on_conflict=id', {
        method: 'POST',
        body: JSON.stringify(chunk),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(`Supabase square_customers upsert ${response.status}: ${JSON.stringify(data)}`);
      }
    }

    return NextResponse.json({
      success: true,
      count: rows.length,
      newOrUpdated: rows.length,
      customers: rows,
      source: 'incremental-square-customer-db',
    });
  } catch (error) {
    console.error('Square顧客同期エラー:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Square顧客同期に失敗しました。',
    }, { status: 500 });
  }
}
