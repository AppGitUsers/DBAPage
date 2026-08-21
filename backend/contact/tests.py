from unittest.mock import patch

from rest_framework import status
from rest_framework.test import APITestCase

from .models import ContactMessage


class ContactFormTests(APITestCase):
    @patch("contact.views.send_contact_email", side_effect=Exception("sendgrid down"))
    def test_message_is_saved_even_if_email_send_fails(self, _mock_send):
        resp = self.client.post(
            "/api/contact/",
            {"name": "Jane", "email": "jane@test.com", "contact": "123", "subject": "Hi", "message": "Hello"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactMessage.objects.count(), 1)
