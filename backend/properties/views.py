from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from .models import CustomUser, Property, Contractor, EvaluationRequest
from .serializers import (
    SignupSerializer, LoginSerializer,
    CustomUserSerializer, PropertySerializer,
    ContractorSerializer, EvaluationRequestSerializer
)

# Create your views here.

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Property.objects.all()
        elif user.role == 'contractor':
            return Property.objects.filter(assigned_contractor__user=user)
        return Property.objects.filter(homeowner=user)

    def create(self, request):
        # Automatically set homeowner to current user
        request.data['homeowner'] = request.user.id
        request.data['status'] = 'pending'
        return super().create(request)

    @action(detail=True, methods=['post'])
    def admin_review(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({"error": "Only admins can review properties"},
                          status=status.HTTP_403_FORBIDDEN)
        
        property = self.get_object()
        action = request.data.get('action')
        
        if action == 'approve':
            property.status = 'eval_pending'
            property.admin_approver = request.user
        elif action == 'reject':
            property.status = 'rejected'
        else:
            return Response({"error": "Invalid action"},
                          status=status.HTTP_400_BAD_REQUEST)
        
        property.save()
        return Response(PropertySerializer(property).data)

    @action(detail=True, methods=['post'])
    def contractor_review(self, request, pk=None):
        if request.user.role != 'contractor':
            return Response({"error": "Only contractors can submit evaluations"},
                          status=status.HTTP_403_FORBIDDEN)
        
        property = self.get_object()
        action = request.data.get('action')
        evaluation_report = request.data.get('evaluation_report')
        
        if property.status != 'eval_pending':
            return Response({"error": "Property is not ready for evaluation"},
                          status=status.HTTP_400_BAD_REQUEST)

        if action == 'approve':
            property.status = 'approved'
        elif action == 'reject':
            property.status = 'rejected'
        else:
            return Response({"error": "Invalid action"},
                          status=status.HTTP_400_BAD_REQUEST)
        
        property.evaluation_report = evaluation_report
        property.save()
        
        return Response(PropertySerializer(property).data)

    @action(detail=True, methods=['post'])
    def assign_contractor(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({"error": "Only admins can assign contractors"},
                          status=status.HTTP_403_FORBIDDEN)
        
        property = self.get_object()
        contractor_id = request.data.get('contractor_id')
        
        try:
            contractor = Contractor.objects.get(id=contractor_id)
            property.assigned_contractor = contractor
            property.save()
            
            # Create evaluation request
            EvaluationRequest.objects.create(
                property=property,
                contractor=contractor
            )
            
            return Response(PropertySerializer(property).data)
        except Contractor.DoesNotExist:
            return Response({"error": "Contractor not found"},
                          status=status.HTTP_404_NOT_FOUND)

class ContractorViewSet(viewsets.ModelViewSet):
    queryset = Contractor.objects.all()
    serializer_class = ContractorSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def submit_evaluation(self, request, pk=None):
        if request.user.role != 'contractor':
            return Response({"error": "Only contractors can submit evaluations"},
                          status=status.HTTP_403_FORBIDDEN)
        
        property_id = request.data.get('property_id')
        evaluation_report = request.data.get('evaluation_report')
        property_rating = request.data.get('rating')
        
        if not property_rating or not (0 <= float(property_rating) <= 5):
            return Response({"error": "Rating must be between 0 and 5"},
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            property = Property.objects.get(
                id=property_id,
                assigned_contractor__user=request.user
            )
            
            property.evaluation_report = evaluation_report
            property.rating = float(property_rating)
            property.status = 'approved'
            property.evaluation_date = timezone.now()
            property.save()
            
            # Update evaluation request
            eval_request = EvaluationRequest.objects.get(
                property=property,
                contractor__user=request.user
            )
            eval_request.completed = True
            eval_request.save()
            
            return Response(PropertySerializer(property).data)
        except Property.DoesNotExist:
            return Response({"error": "Property not found or not assigned to you"},
                          status=status.HTTP_404_NOT_FOUND)

class EvaluationRequestViewSet(viewsets.ModelViewSet):
    queryset = EvaluationRequest.objects.all()
    serializer_class = EvaluationRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return EvaluationRequest.objects.all()
        elif user.role == 'contractor':
            return EvaluationRequest.objects.filter(contractor__user=user)
        return EvaluationRequest.objects.none()

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': CustomUserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': CustomUserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    request.user.auth_token.delete()
    return Response(status=status.HTTP_200_OK)
