from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Video
from .serializers import VideoSerializer


class AdminVideoListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        videos = Video.objects.all().order_by("-created_at")
        return Response(VideoSerializer(videos, many=True).data)

    def post(self, request):
        serializer = VideoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminVideoDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        try:
            return Video.objects.get(pk=pk)
        except Video.DoesNotExist:
            return None

    def patch(self, request, pk):
        video = self.get_object(pk)
        if video is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = VideoSerializer(video, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        deleted, _ = Video.objects.filter(pk=pk).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
