import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        )

        const { comment_id } = await req.json()

        if (!comment_id) {
            return new Response(JSON.stringify({ error: 'Missing comment_id' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 1. Get current count
        const { data: comment, error: fetchError } = await supabaseClient
            .from('conversation_comments')
            .select('reported_count')
            .eq('id', comment_id)
            .single()

        if (fetchError) throw fetchError

        const newCount = (comment.reported_count || 0) + 1
        const shouldHide = newCount >= 3

        // 2. Update count and potentially hide
        const { error: updateError } = await supabaseClient
            .from('conversation_comments')
            .update({
                reported_count: newCount,
                is_hidden: shouldHide
            })
            .eq('id', comment_id)

        if (updateError) throw updateError

        return new Response(JSON.stringify({ success: true, hidden: shouldHide }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
