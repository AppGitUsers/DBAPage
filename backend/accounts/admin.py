from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


class UserAdmin(DjangoUserAdmin):
    model = User
    list_display = ["email", "name", "course", "approved", "is_staff"]
    list_filter = ["approved", "is_staff", "course"]
    search_fields = ["email", "name"]
    ordering = ["email"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("name", "course", "contact", "approved")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login",)}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "name", "course", "password1", "password2"),
            },
        ),
    )


admin.site.register(User, UserAdmin)
