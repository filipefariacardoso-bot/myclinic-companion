import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function is intentionally disabled. Notification system migrated to in-app notifications.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return new Response(JSON.stringify({ success: true, disabled: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
