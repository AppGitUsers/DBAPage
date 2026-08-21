from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Course

User = get_user_model()


class CourseVisibilityTests(APITestCase):
    def test_public_endpoint_excludes_inactive_courses(self):
        Course.objects.create(name="Active", active=True, sort_order=1)
        Course.objects.create(name="Inactive", active=False, sort_order=2)
        resp = self.client.get("/api/courses/")
        names = {c["name"] for c in resp.data}
        self.assertEqual(names, {"Active"})


class CourseReorderTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            email="admin@test.com", password="adminpass1", name="Admin", course="Oracle DBA"
        )
        login = self.client.post(
            "/api/auth/login/", {"email": "admin@test.com", "password": "adminpass1"}, format="json"
        )
        self.token = login.data["token"]
        self.a = Course.objects.create(name="A", sort_order=1)
        self.b = Course.objects.create(name="B", sort_order=2)

    def test_reorder_swaps_sort_order_atomically(self):
        resp = self.client.post(
            f"/api/admin/courses/{self.a.id}/reorder/",
            {"swap_with": self.b.id},
            format="json",
            HTTP_AUTHORIZATION=f"Token {self.token}",
        )
        self.assertEqual(resp.status_code, 200)
        self.a.refresh_from_db()
        self.b.refresh_from_db()
        self.assertEqual(self.a.sort_order, 2)
        self.assertEqual(self.b.sort_order, 1)
