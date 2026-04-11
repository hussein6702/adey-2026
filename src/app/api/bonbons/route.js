import { supabase } from '../../../../supabase';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('bonbons')
            .select('*')
            .eq('active', true)
            .order('name', { ascending: true });

        if (error) {
            return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
        }

        // Group by category
        const grouped = {};
        for (const bonbon of data) {
            if (!grouped[bonbon.category]) grouped[bonbon.category] = [];
            grouped[bonbon.category].push(bonbon);
        }

        return new Response(JSON.stringify({ success: true, bonbons: data, grouped }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}
