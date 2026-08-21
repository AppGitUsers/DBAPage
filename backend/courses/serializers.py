from rest_framework import serializers

from .models import Course


class CourseNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["name"]


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "name", "description", "active", "sort_order", "created_at"]
