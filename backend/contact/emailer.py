import os

import requests


def send_contact_email(data):
    """Mirrors the previous Supabase Edge Function's SendGrid call exactly."""
    api_key = os.environ.get("SENDGRID_API_KEY")
    to_mail = os.environ.get("TO_MAIL")
    from_mail = os.environ.get("FROM_MAIL")
    if not (api_key and to_mail and from_mail):
        return False

    body = (
        f"Name: {data.get('name', '')}\n"
        f"Email: {data.get('email', '')}\n"
        f"Contact: {data.get('contact', '')}\n"
        f"Subject: {data.get('subject', '')}\n\n"
        f"Message:\n{data.get('message', '')}\n"
    )
    response = requests.post(
        "https://api.sendgrid.com/v3/mail/send",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "personalizations": [{"to": [{"email": to_mail}]}],
            "from": {"email": from_mail},
            "subject": "New Contact Message",
            "content": [{"type": "text/plain", "value": body}],
        },
        timeout=10,
    )
    return response.ok
