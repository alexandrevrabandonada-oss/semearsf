import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "https://esm.sh/web-push@3.6.6"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        const apiKey = Deno.env.get('INGEST_API_KEY')

        if (authHeader !== `Bearer ${apiKey}`) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        )

        const { data: subscriptions, error: fetchError } = await supabaseClient
            .from('push_subscriptions')
            .select('*')
            .eq('is_active', true)

        if (fetchError) throw fetchError

        const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
        const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

        if (!vapidPublicKey || !vapidPrivateKey) {
            throw new Error('VAPID keys not configured')
        }

        webpush.setVapidDetails(
            'mailto:portal@semear.org.br',
            vapidPublicKey,
            vapidPrivateKey
        )

        const payload = JSON.stringify({
            title: 'Teste de Notificação',
            body: 'Este é um alerta de teste do SEMEAR PWA.',
            icon: '/icons/icon-192.png'
        })

        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                }
                return webpush.sendNotification(pushSubscription, payload)
            })
        )

        const successCount = results.filter(r => r.status === 'fulfilled').length

        return new Response(JSON.stringify({
            success: true,
            sent: successCount,
            total: subscriptions.length
        }), {
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
