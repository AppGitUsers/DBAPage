from django.urls import path

from .admin_views import AdminCourseDetailView, AdminCourseListView, AdminCourseReorderView

urlpatterns = [
    path("", AdminCourseListView.as_view()),
    path("<int:pk>/", AdminCourseDetailView.as_view()),
    path("<int:pk>/reorder/", AdminCourseReorderView.as_view()),
]
