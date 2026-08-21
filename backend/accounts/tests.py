from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthFlowTests(APITestCase):
    def register(self, email="student@test.com", password="pass123"):
        return self.client.post(
            "/api/auth/register/",
            {"name": "Student", "email": email, "password": password, "course": "Oracle DBA"},
            format="json",
        )

    def test_register_does_not_issue_token(self):
        resp = self.register()
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("token", resp.data or {})
        user = User.objects.get(email="student@test.com")
        self.assertFalse(user.approved)

    def test_login_blocked_while_unapproved(self):
        self.register()
        resp = self.client.post(
            "/api/auth/login/", {"email": "student@test.com", "password": "pass123"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertNotIn("token", resp.data or {})

    def test_login_succeeds_once_approved(self):
        self.register()
        User.objects.filter(email="student@test.com").update(approved=True)
        resp = self.client.post(
            "/api/auth/login/", {"email": "student@test.com", "password": "pass123"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("token", resp.data)

    def test_password_minimum_length_is_six(self):
        resp = self.register(password="ab12")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_staff_cannot_reach_admin_endpoints(self):
        self.register()
        user = User.objects.get(email="student@test.com")
        user.approved = True
        user.save()
        login = self.client.post(
            "/api/auth/login/", {"email": "student@test.com", "password": "pass123"}, format="json"
        )
        token = login.data["token"]
        resp = self.client.get("/api/admin/candidates/", HTTP_AUTHORIZATION=f"Token {token}")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_logout_invalidates_token(self):
        self.register()
        User.objects.filter(email="student@test.com").update(approved=True)
        login = self.client.post(
            "/api/auth/login/", {"email": "student@test.com", "password": "pass123"}, format="json"
        )
        token = login.data["token"]
        self.client.post("/api/auth/logout/", HTTP_AUTHORIZATION=f"Token {token}")
        resp = self.client.get("/api/auth/me/", HTTP_AUTHORIZATION=f"Token {token}")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class AdminCandidateTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            email="admin@test.com", password="adminpass1", name="Admin", course="Oracle DBA"
        )
        self.student = User.objects.create_user(
            email="student@test.com", password="pass123", name="Student", course="Oracle DBA", approved=False
        )
        login = self.client.post(
            "/api/auth/login/", {"email": "admin@test.com", "password": "adminpass1"}, format="json"
        )
        self.admin_token = login.data["token"]

    def auth(self):
        return {"HTTP_AUTHORIZATION": f"Token {self.admin_token}"}

    def test_approve_candidate(self):
        resp = self.client.patch(
            f"/api/admin/candidates/{self.student.id}/", {"approved": True}, format="json", **self.auth()
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertTrue(self.student.approved)

    def test_delete_candidate(self):
        resp = self.client.delete(f"/api/admin/candidates/{self.student.id}/", **self.auth())
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=self.student.id).exists())
