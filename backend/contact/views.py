from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .emailer import send_contact_email
from .serializers import ContactMessageSerializer


class ContactCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # The message is already persisted; a failed/misconfigured SendGrid call
        # must not roll that back, matching the two independent calls Home.jsx
        # used to make against Supabase.
        try:
            send_contact_email(request.data)
        except Exception:
            pass
        return Response(serializer.data, status=status.HTTP_201_CREATED)
