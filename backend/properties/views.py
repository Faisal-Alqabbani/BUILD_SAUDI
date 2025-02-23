from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from .models import CustomUser, Property, Contractor, EvaluationRequest, PropertyImage
from .serializers import (
    SignupSerializer, LoginSerializer,
    CustomUserSerializer, PropertySerializer,
    ContractorSerializer, EvaluationRequestSerializer
)
from .permissions import IsContractor

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
    
    def get_permissions(self):
        """
        Allow public access to retrieve property details and list approved properties
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        # Get status from query params
        status = self.request.query_params.get('status')
        
        # For unauthenticated users
        if not self.request.user.is_authenticated:
            # For property details page, show any approved property
            if self.action == 'retrieve':
                return Property.objects.filter(status='approved')
            # For listing, only show approved properties if status filter is applied
            elif status == 'approved':
                return Property.objects.filter(status='approved')
            # Otherwise show nothing
            return Property.objects.none()
            
        # For authenticated users
        user = self.request.user
        if user.role == 'admin':
            return Property.objects.all()
        elif user.role == 'contractor':
            return Property.objects.filter(status='eval_pending')
        else:  # regular user
            return Property.objects.filter(homeowner=user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Allow access to approved properties or if user is the homeowner
        if instance.status == 'approved' or (
            request.user.is_authenticated and 
            (request.user == instance.homeowner or request.user.role == 'admin')
        ):
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        return Response(
            {"error": "You don't have permission to view this property"},
            status=status.HTTP_403_FORBIDDEN
        )

    def perform_create(self, serializer):
        # Set the homeowner and initial status
        serializer.save(
            homeowner=self.request.user,
            status='pending'
        )

    def create(self, request, *args, **kwargs):
        # Create a mutable copy of the request data
        data = request.data.copy()
        
        # Create serializer with the data
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Handle image uploads
        property_instance = serializer.instance
        images = request.FILES.getlist('uploaded_images')
        for image in images:
            PropertyImage.objects.create(
                property=property_instance,
                image=image
            )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

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

    @action(detail=True, methods=['post'], permission_classes=[IsContractor])
    def contractor_review(self, request, pk=None):
        try:
            property = self.get_object()
            
            # Validate the action
            evaluation_report = request.data.get('evaluation_report')
            rating = request.data.get('rating')
            status = request.data.get('status')

            if not evaluation_report or not rating or status not in ['approved', 'rejected']:
                return Response(
                    {"error": "Please provide evaluation report, rating and valid status"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update property
            property.evaluation_report = evaluation_report
            property.rating = rating
            property.status = status
            property.evaluation_date = timezone.now()
            property.save()

            return Response({"message": "Evaluation submitted successfully"})

        except Property.DoesNotExist:
            return Response(
                {"error": "Property not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

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
