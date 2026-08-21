from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["name", "email", "password", "course"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.approved = False
        user.set_password(password)
        user.save()
        return user


class MeSerializer(serializers.ModelSerializer):
    student_courses = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "name", "email", "course", "approved", "contact", "is_staff", "created_at", "student_courses"]

    def get_student_courses(self, obj):
        return [
            {"course_id": sc.course_id, "courses": {"name": sc.course.name}}
            for sc in obj.student_courses.select_related("course").all()
        ]
