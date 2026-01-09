from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.contrib import messages
from rest_framework import views
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import LoginSerializer
from .serializers import UserSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])

def list_users(request):
    User = get_user_model()
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

class LoginView(APIView):
 def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)