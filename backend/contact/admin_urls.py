from django.urls import path

from .admin_views import AdminMessageDetailView, AdminMessageListView

urlpatterns = [
    path("", AdminMessageListView.as_view()),
    path("<int:pk>/", AdminMessageDetailView.as_view()),
]
