import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager

COURSE_CHOICES = [
    ("Oracle DBA", "Oracle DBA"),
    ("Oracle Developer", "Oracle Developer"),
    ("PostgreSQL DBA", "PostgreSQL DBA"),
    ("PostgreSQL Developer", "PostgreSQL Developer"),
]


class User(AbstractUser):
    username = None
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    # Blank/null so staff accounts (created via createsuperuser or the Django
    # admin) aren't forced to pick a fake student course — students always
    # provide one at registration, enforced by RegisterSerializer instead.
    course = models.CharField(max_length=50, choices=COURSE_CHOICES, blank=True, null=True)
    approved = models.BooleanField(default=False)
    contact = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    objects = UserManager()

    def __str__(self):
        return self.email
