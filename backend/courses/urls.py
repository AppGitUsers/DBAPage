from django.urls import path

from .views import PublicCourseListView

urlpatterns = [
    path("", PublicCourseListView.as_view()),
]
