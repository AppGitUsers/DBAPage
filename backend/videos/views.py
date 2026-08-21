from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Video
from .serializers import VideoSerializer


class PublicVideoListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = VideoSerializer

    def get_queryset(self):
        return Video.objects.filter(is_public=True).order_by("-created_at")


class MyVideoListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.approved:
            return Response({"detail": "not approved"}, status=status.HTTP_403_FORBIDDEN)
        course_names = {user.course}
        course_names |= {sc.course.name for sc in user.student_courses.select_related("course").all()}
        videos = Video.objects.filter(course__in=course_names).order_by("-created_at")
        return Response(VideoSerializer(videos, many=True).data)
