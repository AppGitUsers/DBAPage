from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ContactMessage
from .serializers import ContactMessageSerializer


class AdminMessageListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        messages = ContactMessage.objects.all().order_by("-created_at")
        return Response(ContactMessageSerializer(messages, many=True).data)


class AdminMessageDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            message = ContactMessage.objects.get(pk=pk)
        except ContactMessage.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if "is_read" in request.data:
            message.is_read = bool(request.data["is_read"])
            message.save(update_fields=["is_read"])
        return Response(ContactMessageSerializer(message).data)

    def delete(self, request, pk):
        deleted, _ = ContactMessage.objects.filter(pk=pk).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
