from django.urls import path

from .admin_views import AdminVideoDetailView, AdminVideoListView

urlpatterns = [
    path("", AdminVideoListView.as_view()),
    path("<int:pk>/", AdminVideoDetailView.as_view()),
]
