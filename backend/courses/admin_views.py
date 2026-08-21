from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Course
from .serializers import CourseSerializer


class AdminCourseListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        courses = Course.objects.all().order_by("sort_order")
        return Response(CourseSerializer(courses, many=True).data)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminCourseDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        try:
            return Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return None

    def patch(self, request, pk):
        course = self.get_object(pk)
        if course is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = CourseSerializer(course, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        deleted, _ = Course.objects.filter(pk=pk).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminCourseReorderView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        swap_with = request.data.get("swap_with")
        try:
            a = Course.objects.get(pk=pk)
            b = Course.objects.get(pk=swap_with)
        except Course.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        with transaction.atomic():
            a.sort_order, b.sort_order = b.sort_order, a.sort_order
            a.save(update_fields=["sort_order"])
            b.save(update_fields=["sort_order"])
        return Response(CourseSerializer([a, b], many=True).data)
