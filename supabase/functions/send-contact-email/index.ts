import "@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {

    console.log("Function triggered")

    const body = await req.json()
    const { name, email, contact, subject, message } = body

    console.log("Received body:", body)

    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY")

    console.log("API Key present:", !!SENDGRID_API_KEY)

    const sgResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: import.meta.env.VITE_TO_MAIL}]
          }
        ],
        from: {
          email: import.meta.env.VITE_FROM_MAIL
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

    console.log("SendGrid status:", sgResponse.status)

    const responseText = await sgResponse.text()
    console.log("SendGrid response:", responseText)

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

    console.error("ERROR:", err)

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