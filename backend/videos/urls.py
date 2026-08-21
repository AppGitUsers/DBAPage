from django.urls import path

from .views import MyVideoListView, PublicVideoListView

urlpatterns = [
    path("public/", PublicVideoListView.as_view()),
    path("mine/", MyVideoListView.as_view()),
]
