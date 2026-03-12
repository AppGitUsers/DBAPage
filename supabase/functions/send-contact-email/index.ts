import "@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {

    const body = await req.json()
    const { name, email, contact, subject, message } = body

    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY")

    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: "maruthesh12131@gmail.com" }]
          }
        ],
        from: {
          email: "maruthesh12131@gmail.com"
        },
        subject: "New Contact Message",
        content: [
          {
            type: "text/plain",
            value: `
Name: ${name}
Email: ${email}
Contact: ${contact}
Subject: ${subject}

Message:
${message}
`
          }
        ]
      })
    })

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    )

  } catch (err) {

    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      }
    )
  }

})