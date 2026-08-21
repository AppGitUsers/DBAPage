from django.urls import path

from .admin_views import CandidateCoursesView, CandidateDetailView, CandidateListView

urlpatterns = [
    path("", CandidateListView.as_view()),
    path("<uuid:pk>/", CandidateDetailView.as_view()),
    path("<uuid:pk>/courses/", CandidateCoursesView.as_view()),
]
