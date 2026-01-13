from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .serializers import LoginSerializer, UserSerializer

User = get_user_model()


# =========================
# CREATE USER (ADMIN ONLY)
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_user(request):
    if request.user.role != "ADMIN":
        return Response(
            {"detail": "Not authorized"},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = UserSerializer(
        data=request.data,
        context={"request": request}
    )

    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(
        {"message": "User created successfully"},
        status=status.HTTP_201_CREATED
    )


# =========================
# LIST USERS (ADMIN ONLY)
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_users(request):
    if request.user.role != "ADMIN":
        return Response(
            {"detail": "Not authorized"},
            status=status.HTTP_403_FORBIDDEN
        )

    users = User.objects.all().order_by("-id")
    serializer = UserSerializer(users, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def user_detail(request, pk):
    if request.user.role != "ADMIN":
        return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
    
    user = get_object_or_404(User, pk=pk)

    if request.method == "GET":
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "PATCH":
        serializer = UserSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "DELETE":
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# =========================
# LOGIN
# =========================
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
