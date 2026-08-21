from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Course, StudentCourse

from .models import Video

User = get_user_model()


class VideoAccessTests(APITestCase):
    def setUp(self):
        Video.objects.create(title="Public", video_url="https://x/1", course="Oracle DBA", is_public=True)
        Video.objects.create(title="Primary-only", video_url="https://x/2", course="Oracle DBA", is_public=False)
        Video.objects.create(title="Enrolled-only", video_url="https://x/3", course="Linux", is_public=False)
        Video.objects.create(title="Unrelated", video_url="https://x/4", course="PostgreSQL DBA", is_public=False)

        self.course_linux = Course.objects.create(name="Linux", sort_order=1)
        self.student = User.objects.create_user(
            email="student@test.com", password="pass123", name="Student", course="Oracle DBA", approved=True
        )
        StudentCourse.objects.create(student=self.student, course=self.course_linux)
        login = self.client.post(
            "/api/auth/login/", {"email": "student@test.com", "password": "pass123"}, format="json"
        )
        self.token = login.data["token"]

    def test_public_endpoint_only_returns_public_videos(self):
        resp = self.client.get("/api/videos/public/")
        titles = {v["title"] for v in resp.data}
        self.assertEqual(titles, {"Public"})

    def test_mine_returns_primary_and_enrolled_course_videos_only(self):
        resp = self.client.get("/api/videos/mine/", HTTP_AUTHORIZATION=f"Token {self.token}")
        titles = {v["title"] for v in resp.data}
        self.assertEqual(titles, {"Public", "Primary-only", "Enrolled-only"})

    def test_mine_requires_approval(self):
        User.objects.filter(email="student@test.com").update(approved=False)
        resp = self.client.get("/api/videos/mine/", HTTP_AUTHORIZATION=f"Token {self.token}")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_mine_requires_auth(self):
        resp = self.client.get("/api/videos/mine/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
