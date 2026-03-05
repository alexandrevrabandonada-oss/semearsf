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

        // 1. Validate required fields
        if (!conversation_id || !name || !commentBody) {
            return new Response(JSON.stringify({ error: 'Campos obrigatórios faltando' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 2. Honeypot check (hidden field for spam bots)
        if (honeypot && honeypot.length > 0) {
            console.warn(`[Spam] Honeypot triggered: IP=${ip}, UA=${userAgent}`)
            return new Response(JSON.stringify({ error: 'Spam detected' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 3. Name and body basic validation
        const cleanName = name.trim().slice(0, 100)
        const cleanBody = commentBody.trim()

        if (cleanName.length < 2) {
            return new Response(JSON.stringify({ error: 'Nome muito curto (mínimo 2 caracteres)' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        if (cleanBody.length < 3 || cleanBody.length > 2000) {
            return new Response(JSON.stringify({ error: 'Comentário deve ter entre 3 e 2000 caracteres' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 4. Rate limit check (max 3 comments in 10 minutes per IP)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
        const { count, error: countError } = await supabaseClient
            .from('conversation_comments')
            .select('*', { count: 'exact', head: true })
            .eq('ip_hash', ipHash)
            .gt('created_at', tenMinutesAgo)

        if (countError) throw countError
        if (count !== null && count >= 3) {
            console.warn(`[RateLimit] IP exceeded 3 comments in 10 min: ${ipHash}`)
            return new Response(JSON.stringify({ error: 'Limite de comentários atingido. Tente novamente em alguns minutos.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429,
            })
        }

        // 5. Heuristics for automatic moderation queue
        // Queue if: too short, too long, or suspect patterns
        let moderationStatus = 'published'
        const suspectPatterns = [
            /https?:\/\//gi,  // URLs (often spam)
        ]
        
        if (cleanBody.length < 3 || cleanBody.length > 1500) {
            moderationStatus = 'queued'
        } else if (suspectPatterns.some(p => p.test(cleanBody))) {
            // URLs trigger moderation (unless very short, legitimate links)
            const urlCount = (cleanBody.match(/https?:\/\//gi) || []).length
            if (urlCount > 1 || cleanBody.split(' ').length < 20) {
                moderationStatus = 'queued'
            }
        }

        // 6. Insert comment
        const { data, error: insertError } = await supabaseClient
            .from('conversation_comments')
            .insert({
                conversation_id,
                name: cleanName,
                body: cleanBody,
                ip_hash: ipHash,
                user_agent: userAgent,
                moderation_status: moderationStatus,
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (insertError) throw insertError

        console.log(`[Comment] Submitted by ${cleanName}, status=${moderationStatus}`)

        return new Response(JSON.stringify({ data, status: moderationStatus }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        console.error('[Error] submit-comment:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
