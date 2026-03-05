import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getIpHash(ip: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(ip + (Deno.env.get('SHARE_HASH_SALT') || 'fallback-salt'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

        const body = await req.json()
        const { conversation_id, name, body: commentBody, honeypot } = body
        const userAgent = req.headers.get('user-agent') || 'unknown'
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
        const ipHash = await getIpHash(ip)

        // 1. Honeypot check
        if (honeypot && honeypot.length > 0) {
            console.warn(`Spam detectado (honeypot): IP=${ip}`)
            return new Response(JSON.stringify({ error: 'Spam detected' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 2. Rate limit check (max 3 comments in 10 minutes)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
        const { count, error: countError } = await supabaseClient
            .from('conversation_comments')
            .select('*', { count: 'exact', head: true })
            .eq('ip_hash', ipHash)
            .gt('created_at', tenMinutesAgo)

        if (countError) throw countError
        if (count !== null && count >= 3) {
            return new Response(JSON.stringify({ error: 'Limite de comentários atingido. Tente novamente em alguns minutos.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429,
            })
        }

        // 3. Heuristic: if body is too short or too long, maybe queue for moderation
        let moderationStatus = 'published'
        if (commentBody.length < 2 || commentBody.length > 2000) {
            moderationStatus = 'queued'
        }

        // 4. Insert comment
        const { data, error: insertError } = await supabaseClient
            .from('conversation_comments')
            .insert({
                conversation_id,
                name: name.slice(0, 50),
                body: commentBody,
                ip_hash: ipHash,
                user_agent: userAgent,
                moderation_status: moderationStatus
            })
            .select()
            .single()

        if (insertError) throw insertError

        return new Response(JSON.stringify({ data, status: moderationStatus }), {
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
