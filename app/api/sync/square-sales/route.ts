import { NextRequest, NextResponse } from 'next/server';

type SquareOrder = {
  id?: string;
  created_at?: string;
  closed_at?: string;
  customer_id?: string;
  total_money?: { amount?: number | string; currency?: string };
  line_items?: Array<{
    name?: string;
    quantity?: string;
    total_money?: { amount?: number | string };
    catalog_object_id?: string;
    variation_name?: string;
  }>;
};

type SquarePayment = {
  id?: string;
  order_id?: string;
  status?: string;
  team_member_id?: string;
  customer_id?: string;
  created_at?: string;
  amount_money?: { amount?: number | string; currency?: string };
};

type StoredSquareSale = {
  id: string;
  square_order_id?: string | null;
  square_payment_id?: string | null;
  customer_id?: string | null;
  date: string;
  client_name: string;
  category: '月謝・コース' | '回数券' | '物販・プロテイン' | '体験料';
  amount: number;
  payment_method: 'Square決済';
  staff: 'TAKA' | 'NANA' | '未設定';
  memo: string;
  product_name?: string | null;
  product_names?: string[];
  square_catalog_object_ids?: string[];
  source: 'square';
  team_member_id?: string | null;
};

const SQUARE_API_VERSION = '2026-08-19';
const SQUARE_BASE_URL = 'https://connect.squareup.com';

const jsonHeaders = () => ({
  Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN || ''}`,
  'Square-Version': SQUARE_API_VERSION,
  'Content-Type': 'application/json',
});

const supabaseHeaders = () => ({
  apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
  'Content-Type': 'application/json',
});

const categorize = (names: string[]): StoredSquareSale['category'] => {
  const text = names.join(' ').toLowerCase();
  if (text.includes('体験')) return '体験料';
  if (
    text.includes('回数券') ||
    text.includes('回数') ||
    text.includes('ticket') ||
    text.includes('5回') ||
    text.includes('8回') ||
    text.includes('10回')
  ) return '回数券';
  if (text.includes('プロテイン') || text.includes('protein') || text.includes('物販')) {
    return '物販・プロテイン';
  }
  return '月謝・コース';
};

const toDateOnly = (value?: string) => (value ? value.slice(0, 10) : '');

const moneyToMajorUnits = (amount: number | string | undefined, currency?: string) => {
  const value = Number(amount || 0);
  return currency === 'JPY' ? value : value / 100;
};

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash === 0 ? 1 : hash;
}

async function fetchAllOrders(locationId: string, startAt: string, endAt: string) {
  const orders: SquareOrder[] = [];
  let cursor: string | undefined;

  do {
    const response = await fetch(`${SQUARE_BASE_URL}/v2/orders/search`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({
        location_ids: [locationId],
        limit: 1000,
        cursor,
        return_entries: false,
        query: {
          filter: {
            state_filter: { states: ['COMPLETED'] },
            date_time_filter: { closed_at: { start_at: startAt, end_at: endAt } },
          },
          sort: { sort_field: 'CLOSED_AT', sort_order: 'DESC' },
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.errors?.[0]?.detail || `Square Orders API error (${response.status})`);
    }

    if (Array.isArray(data.orders)) orders.push(...data.orders);
    cursor = data.cursor || undefined;
  } while (cursor);

  return orders;
}

async function fetchAllPayments(locationId: string, startAt: string, endAt: string) {
  const payments: SquarePayment[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({
      location_id: locationId,
      begin_time: startAt,
      end_time: endAt,
      limit: '100',
      sort_order: 'DESC',
    });
    if (cursor) params.set('cursor', cursor);

    const response = await fetch(`${SQUARE_BASE_URL}/v2/payments?${params.toString()}`, {
      headers: jsonHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.errors?.[0]?.detail || `Square Payments API error (${response.status})`);
    }

    if (Array.isArray(data.payments)) payments.push(...data.payments);
    cursor = data.cursor || undefined;
  } while (cursor);

  return payments;
}

async function fetchCustomerNames(customerIds: string[]) {
  const names = new Map<string, string>();
  if (customerIds.length === 0) return names;

  try {
    for (let i = 0; i < customerIds.length; i += 100) {
      const chunk = customerIds.slice(i, i + 100);

      const response = await fetch(`${SQUARE_BASE_URL}/v2/customers/bulk-retrieve`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ customer_ids: chunk }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('Square顧客情報取得エラー:', response.status, data);
        continue;
      }

      if (data.responses && typeof data.responses === 'object') {
        for (const [customerId, result] of Object.entries(data.responses)) {
          const customer = (result as any)?.customer;
          if (!customer) continue;

          const name = [customer.family_name, customer.given_name]
            .filter(Boolean)
            .join(' ')
            .trim();

          if (name) {
            names.set(customerId, `${name} 様`);
          }
        }
      }

      if (Array.isArray(data.customers)) {
        for (const customer of data.customers) {
          const name = [customer.family_name, customer.given_name]
            .filter(Boolean)
            .join(' ')
            .trim();

          if (customer.id && name) {
            names.set(customer.id, `${name} 様`);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Square顧客情報取得に失敗しました:', error);
  }

  return names;
}

async function loadStoredSales(startDate: string, endDate: string): Promise<StoredSquareSale[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return [];

  const params = new URLSearchParams({
    select: 'id,square_order_id,square_payment_id,customer_id,date,client_name,category,amount,payment_method,staff,memo,product_name,product_names,square_catalog_object_ids,source,team_member_id',
    date: `gte.${startDate}`,
    order: 'date.desc',
    limit: '10000',
  });
  params.append('date', `lte.${endDate}`);

  const response = await fetch(`${url}/rest/v1/square_sales?${params.toString()}`, {
    headers: supabaseHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) {
    console.warn('square_sales読み込み失敗:', response.status, await response.text());
    return [];
  }

  return (await response.json()) as StoredSquareSale[];
}

async function getLatestStoredDate(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;

  const params = new URLSearchParams({
    select: 'date',
    order: 'date.desc',
    limit: '1',
  });

  const response = await fetch(`${url}/rest/v1/square_sales?${params.toString()}`, {
    headers: supabaseHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) return null;

  const rows = await response.json();
  return Array.isArray(rows) && rows[0]?.date ? String(rows[0].date) : null;
}

async function upsertStoredSales(sales: StoredSquareSale[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || sales.length === 0) return;

  const rows = sales.map((sale) => ({
    id: String(sale.id),
    square_order_id: sale.square_order_id || null,
    square_payment_id: sale.square_payment_id || null,
    customer_id: sale.customer_id || null,
    date: sale.date,
    client_name: sale.client_name,
    category: sale.category,
    amount: sale.amount,
    payment_method: sale.payment_method,
    staff: sale.staff,
    // Square同期では既存のGOLAZOメモを上書きしないため、
    // 初回保存時だけSquare由来のメモを入れ、既存行はDB側の値を維持します。
    memo: sale.memo,
    product_name: sale.product_name || null,
    product_names: sale.product_names || [],
    square_catalog_object_ids: sale.square_catalog_object_ids || [],
    source: 'square',
    team_member_id: sale.team_member_id || null,
    raw_data: sale,
    updated_at: new Date().toISOString(),
  }));

  const response = await fetch(
    `${url}/rest/v1/square_sales?on_conflict=id`,
    {
      method: 'POST',
      headers: {
        ...supabaseHeaders(),
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(rows),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GOLAZO売上保存に失敗しました (${response.status}): ${detail}`);
  }
}

async function updateStoredSalesWithoutOverwritingMemos(sales: StoredSquareSale[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || sales.length === 0) return;

  // 既存行は商品名・顧客名などSquare側の最新情報だけ更新し、
  // memoは更新しません。新規行だけupsertStoredSalesで登録されます。
  for (const sale of sales) {
    const response = await fetch(
      `${url}/rest/v1/square_sales?id=eq.${encodeURIComponent(String(sale.id))}`,
      {
        method: 'PATCH',
        headers: {
          ...supabaseHeaders(),
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          square_order_id: sale.square_order_id || null,
          square_payment_id: sale.square_payment_id || null,
          customer_id: sale.customer_id || null,
          date: sale.date,
          client_name: sale.client_name,
          category: sale.category,
          amount: sale.amount,
          payment_method: sale.payment_method,
          staff: sale.staff,
          product_name: sale.product_name || null,
          product_names: sale.product_names || [],
          square_catalog_object_ids: sale.square_catalog_object_ids || [],
          source: 'square',
          team_member_id: sale.team_member_id || null,
          raw_data: sale,
          updated_at: new Date().toISOString(),
        }),
      },
    );

    if (!response.ok) {
      console.warn('既存Square売上の更新に失敗:', sale.id, response.status);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = process.env.SQUARE_ACCESS_TOKEN;
    const locationId = process.env.SQUARE_LOCATION_ID;

    if (!token || !locationId) {
      return NextResponse.json(
        { success: false, error: 'Squareの環境変数が設定されていません。' },
        { status: 500 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const requestedStartDate = String(body.startDate || new Date().toISOString().slice(0, 10));
    const requestedEndDate = String(body.endDate || requestedStartDate);

    const latestStoredDate = await getLatestStoredDate();
    const today = new Date().toISOString().slice(0, 10);

    let syncStartDate = requestedStartDate;
    let shouldSyncSquare = !latestStoredDate;

    if (latestStoredDate && requestedEndDate >= today) {
      const overlap = new Date(`${latestStoredDate}T00:00:00+09:00`);
      overlap.setDate(overlap.getDate() - 7);
      const overlapDate = overlap.toISOString().slice(0, 10);
      syncStartDate = overlapDate > requestedStartDate ? overlapDate : requestedStartDate;
      shouldSyncSquare = true;
    }

    if (shouldSyncSquare) {
      const startAt = `${syncStartDate}T00:00:00+09:00`;
      const endAt = `${requestedEndDate}T23:59:59+09:00`;

      let orders: SquareOrder[] = [];
      let payments: SquarePayment[] = [];
      let ordersError = '';
      let paymentsError = '';

      try {
        orders = await fetchAllOrders(locationId, startAt, endAt);
      } catch (error) {
        ordersError = error instanceof Error ? error.message : 'Square Orders API error';
        console.warn('Square Orders API unavailable; Paymentsへフォールバック:', ordersError);
      }

      try {
        payments = await fetchAllPayments(locationId, startAt, endAt);
      } catch (error) {
        paymentsError = error instanceof Error ? error.message : 'Square Payments API error';
        console.warn('Square Payments API unavailable:', paymentsError);
      }

      if (orders.length > 0) {
        const paymentByOrder = new Map<string, SquarePayment>();
        for (const payment of payments) {
          if (payment.order_id && payment.status === 'COMPLETED') {
            paymentByOrder.set(payment.order_id, payment);
          }
        }

        const customerIds = Array.from(
          new Set(
            orders
              .map((order) => {
                const payment = paymentByOrder.get(order.id || '');
                return order.customer_id || payment?.customer_id || null;
              })
              .filter(Boolean) as string[],
          ),
        );
        const customerNames = await fetchCustomerNames(customerIds);

        const sales: StoredSquareSale[] = orders
          .filter((order) => order.id && Number(order.total_money?.amount || 0) > 0)
          .map((order) => {
            const payment = paymentByOrder.get(order.id!);
            const customerId = order.customer_id || payment?.customer_id || null;
            const productNames = (order.line_items || [])
              .map((item) => item.name || item.variation_name || '')
              .filter(Boolean);
            const catalogIds = (order.line_items || [])
              .map((item) => item.catalog_object_id || '')
              .filter(Boolean);

            const customerName = customerId
              ? customerNames.get(customerId) || `Square顧客 (${customerId.slice(0, 8)}…)`
              : 'Square取引';

            return {
              id: String(Math.abs(hashString(order.id!))),
              date: toDateOnly(order.closed_at || order.created_at),
              client_name: customerName,
              clientName: customerName,
              category: categorize(productNames),
              amount: moneyToMajorUnits(order.total_money?.amount, order.total_money?.currency),
              payment_method: 'Square決済',
              paymentMethod: 'Square決済',
              staff: '未設定',
              memo: productNames.join(' / ') || 'Square売上',
              product_name: productNames[0] || null,
              productName: productNames[0] || null,
              product_names: productNames,
              productNames,
              square_catalog_object_ids: catalogIds,
              squareCatalogObjectIds: catalogIds,
              source: 'square',
              square_order_id: order.id!,
              squareOrderId: order.id!,
              customer_id: customerId,
              square_payment_id: payment?.id || null,
              squarePaymentId: payment?.id || null,
              team_member_id: payment?.team_member_id || null,
              teamMemberId: payment?.team_member_id || null,
            } as unknown as StoredSquareSale;
          });

        const existing = await loadStoredSales(requestedStartDate, requestedEndDate);
        const existingIds = new Set(existing.map((item) => String(item.id)));
        const newSales = sales.filter((sale) => !existingIds.has(String(sale.id)));

        if (newSales.length > 0) {
          await upsertStoredSales(newSales);
        }
        await updateStoredSalesWithoutOverwritingMemos(
          sales.filter((sale) => existingIds.has(String(sale.id))),
        );
      } else if (payments.length > 0) {
        const completedPayments = payments.filter(
          (payment) =>
            payment.id &&
            payment.status === 'COMPLETED' &&
            Number(payment.amount_money?.amount || 0) > 0,
        );

        const customerIds = Array.from(
          new Set(completedPayments.map((payment) => payment.customer_id).filter(Boolean) as string[]),
        );
        const customerNames = await fetchCustomerNames(customerIds);

        const sales: StoredSquareSale[] = completedPayments.map((payment) => {
          const customerName = payment.customer_id
            ? customerNames.get(payment.customer_id) || `Square顧客 (${payment.customer_id.slice(0, 8)}…)`
            : 'Square決済';

          return {
            id: String(Math.abs(hashString(payment.id!))),
            date: toDateOnly(payment.created_at),
            client_name: customerName,
            clientName: customerName,
            category: '月謝・コース',
            amount: moneyToMajorUnits(payment.amount_money?.amount, payment.amount_money?.currency),
            payment_method: 'Square決済',
            paymentMethod: 'Square決済',
            staff: '未設定',
            memo: 'Square決済（Orders権限なしのため決済情報から同期）',
            product_name: null,
            productName: null,
            product_names: [],
            productNames: [],
            square_catalog_object_ids: [],
            squareCatalogObjectIds: [],
            source: 'square',
            square_payment_id: payment.id!,
            squarePaymentId: payment.id!,
            customer_id: payment.customer_id || null,
            team_member_id: payment.team_member_id || null,
            teamMemberId: payment.team_member_id || null,
          } as unknown as StoredSquareSale;
        });

        const existing = await loadStoredSales(requestedStartDate, requestedEndDate);
        const existingIds = new Set(existing.map((item) => String(item.id)));
        const newSales = sales.filter((sale) => !existingIds.has(String(sale.id)));

        if (newSales.length > 0) {
          await upsertStoredSales(newSales);
        }
        await updateStoredSalesWithoutOverwritingMemos(
          sales.filter((sale) => existingIds.has(String(sale.id))),
        );

        if (sales.length === 0 && ordersError && paymentsError) {
          return NextResponse.json(
            { success: false, error: `Square売上を取得できませんでした。Orders: ${ordersError} / Payments: ${paymentsError}` },
            { status: 403 },
          );
        }
      } else if (!latestStoredDate) {
        return NextResponse.json(
          {
            success: false,
            error: `Square売上を取得できませんでした。Orders: ${ordersError || '0件'} / Payments: ${paymentsError || '0件'}`,
          },
          { status: 403 },
        );
      }
    }

    const storedSales = await loadStoredSales(requestedStartDate, requestedEndDate);

    return NextResponse.json({
      success: true,
      sales: storedSales.map((item) => ({
        id: Number(item.id),
        date: item.date,
        clientName: item.client_name,
        category: item.category,
        amount: Number(item.amount) || 0,
        paymentMethod: 'Square決済',
        staff: item.staff || '未設定',
        memo: item.memo || '',
        productName: item.product_name || undefined,
        productNames: Array.isArray(item.product_names) ? item.product_names : [],
        squareCatalogObjectIds: Array.isArray(item.square_catalog_object_ids)
          ? item.square_catalog_object_ids
          : [],
        source: 'square',
        squareOrderId: item.square_order_id || undefined,
        squarePaymentId: item.square_payment_id || undefined,
        customerId: item.customer_id || undefined,
        teamMemberId: item.team_member_id || undefined,
      })),
      count: storedSales.length,
      startDate: requestedStartDate,
      endDate: requestedEndDate,
      source: shouldSyncSquare ? 'incremental-square-and-db' : 'db-only',
      syncedFrom: shouldSyncSquare ? syncStartDate : null,
    });
  } catch (error) {
    console.error('Square sales sync error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Square同期中にエラーが発生しました。' },
      { status: 500 },
    );
  }
}
