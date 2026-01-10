from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import list_users, LoginView, create_user

urlpatterns = [
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', list_users, name="list_users"),
    path("user/create/", create_user, name="create_user"),
]