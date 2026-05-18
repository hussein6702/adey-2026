import { supabase } from '../../../../supabase';

export async function GET() {
  try {
    // Add selected_box_size column
    const { error: err1 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS selected_box_size TEXT DEFAULT NULL;`
    });

    // Add custom_box_quantity column
    const { error: err2 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS custom_box_quantity INTEGER DEFAULT 1;`
    });

    // If rpc doesn't exist, try direct approach
    if (err1 || err2) {
      // Try using the REST API to check if columns exist by doing a simple select
      const { data, error: testErr } = await supabase
        .from('orders')
        .select('selected_box_size, custom_box_quantity')
        .limit(1);

      if (testErr) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Columns do not exist yet. Please add them manually in Supabase Dashboard:',
          sql: [
            'ALTER TABLE orders ADD COLUMN IF NOT EXISTS selected_box_size TEXT DEFAULT NULL;',
            'ALTER TABLE orders ADD COLUMN IF NOT EXISTS custom_box_quantity INTEGER DEFAULT 1;',
          ],
          rpcErrors: [err1?.message, err2?.message],
        }), { status: 200 });
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Columns already exist!',
        sample: data,
      }), { status: 200 });
    }

    return new Response(JSON.stringify({ success: true, message: 'Migration complete' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
