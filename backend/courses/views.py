from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from .models import Course
from .serializers import CourseNameSerializer


class PublicCourseListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CourseNameSerializer

    def get_queryset(self):
        return Course.objects.filter(active=True).order_by("sort_order")
