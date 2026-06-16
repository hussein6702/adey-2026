import { supabase } from '../../../../supabase';

export async function GET() {
  try {
    // Add order_code column
    const { error: err } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_code TEXT UNIQUE DEFAULT NULL;`
    });

    // Check if column exists as fallback
    const { data, error: testErr } = await supabase
      .from('orders')
      .select('order_code')
      .limit(1);

    if (testErr) {
      if (err) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Could not add column. Please add it manually in Supabase Dashboard:',
          sql: 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_code TEXT UNIQUE DEFAULT NULL;',
          rpcError: err.message
        }), { status: 200 });
      }
      return new Response(JSON.stringify({ success: false, error: testErr.message }), { status: 200 });
    }

    return new Response(JSON.stringify({ success: true, message: 'Column order_code added or already exists!' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
