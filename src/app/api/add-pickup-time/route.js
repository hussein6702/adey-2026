import { supabase } from '../../../../supabase';

export async function GET() {
  try {
    // Add pickup_time column
    const { error: err } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_time TEXT DEFAULT 'morning' CHECK (pickup_time IN ('morning', 'afternoon'));`
    });

    // Verify column exists
    const { data, error: testErr } = await supabase
      .from('orders')
      .select('pickup_time')
      .limit(1);

    if (testErr) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not add column. Please add it manually in Supabase Dashboard:',
        sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_time TEXT DEFAULT 'morning' CHECK (pickup_time IN ('morning', 'afternoon'));`,
        rpcError: err?.message
      }), { status: 200 });
    }

    return new Response(JSON.stringify({ success: true, message: 'Column pickup_time added or already exists!' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
