from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import list_users, LoginView, create_user, students_by_grade, user_detail, SectionViewSet

router = DefaultRouter()
router.register(r"sections", SectionViewSet, basename="section")

urlpatterns = [
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', list_users, name="list_users"),
    path("user/create/", create_user, name="create_user"),
    path("user/<int:pk>/", user_detail),
    path("", include(router.urls)),
    path("students/", students_by_grade),

]