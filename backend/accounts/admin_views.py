from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import StudentCourse

from .serializers import MeSerializer

User = get_user_model()


class CandidateListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        candidates = User.objects.filter(is_staff=False).order_by("-created_at")
        return Response(MeSerializer(candidates, many=True).data)


class CandidateDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            candidate = User.objects.get(pk=pk, is_staff=False)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if "approved" in request.data:
            candidate.approved = bool(request.data["approved"])
            candidate.save(update_fields=["approved"])
        return Response(MeSerializer(candidate).data)

    def delete(self, request, pk):
        deleted, _ = User.objects.filter(pk=pk, is_staff=False).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CandidateCoursesView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        try:
            candidate = User.objects.get(pk=pk, is_staff=False)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        course_ids = request.data.get("course_ids", [])
        with transaction.atomic():
            StudentCourse.objects.filter(student=candidate).delete()
            StudentCourse.objects.bulk_create(
                [StudentCourse(student=candidate, course_id=cid) for cid in course_ids]
            )
        return Response(MeSerializer(candidate).data)
