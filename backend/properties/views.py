from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.utils import timezone
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from .models import CustomUser, Property, Contractor, EvaluationRequest, PropertyImage, PriceOffer, CompletionImage
from .serializers import (
    SignupSerializer, LoginSerializer,
    CustomUserSerializer, PropertySerializer,
    ContractorSerializer, EvaluationRequestSerializer,
    PriceOfferSerializer, PropertyCompletionSerializer
)
from .permissions import IsContractor
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import Http404

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
        Allow public access to list, retrieve, completed properties and completed-list.
        Require authentication for other actions.
        """
        if self.action in ['list', 'retrieve', 'completed_properties', 'completed_list']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'], url_path='completed')
    def completed_properties(self, request):
        """
        Endpoint for getting completed properties
        URL: /api/properties/completed/
        """
        completed = Property.objects.filter(
            status='completed'
        ).order_by('-completion_date')
        serializer = self.get_serializer(completed, many=True)
        return Response(serializer.data)

    @action(
        detail=False, 
        methods=['get'], 
        permission_classes=[AllowAny], 
        url_path='completed-list',
        authentication_classes=[]  # This removes authentication requirement completely
    )
    def completed_list(self, request):
        """
        Endpoint for getting completed properties
        URL: /api/properties/completed-list/
        """
        completed_properties = Property.objects.filter(
            status='completed'
        ).order_by('-completion_date')
        
        serializer = self.get_serializer(completed_properties, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        queryset = Property.objects.all()
        status = self.request.query_params.get('status', None)
        
        # For non-authenticated users, show completed properties and allow property details
        if not self.request.user.is_authenticated:
            if self.action == 'list':
                if status == 'completed':
                    return queryset.filter(status='completed').order_by('-completion_date')
                return Property.objects.none()
            # For retrieve action (property details), allow access to any property
            elif self.action == 'retrieve':
                return queryset
        
        # For authenticated users, handle as before
        if status:
            if status == 'completed':
                return queryset.filter(status='completed').order_by('-completion_date')
            elif self.request.user.role == 'contractor':
                if status == 'approved':
                    return queryset.filter(status=status)
            elif self.request.user.role == 'user':
                return queryset.filter(homeowner=self.request.user)
            elif self.request.user.role == 'admin':
                return queryset.filter(status=status)
        
        # Default queryset based on user role
        if self.request.user.role == 'user':
            return queryset.filter(homeowner=self.request.user)
        elif self.request.user.role == 'contractor':
            return queryset.filter(
                Q(status='approved') |
                Q(assigned_contractor__user=self.request.user)
            )
        elif self.request.user.role == 'admin':
            return queryset
        
        return queryset

    def get_object(self):
        """
        Allow public access to all property details
        """
        # Get the object without permission checks
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        
        try:
            obj = queryset.get(**filter_kwargs)
            return obj
        except Property.DoesNotExist:
            raise Http404("Property not found")

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
        """
        Action to handle admin review of properties
        URL: /api/properties/{id}/admin_review/
        """
        if request.user.role != 'admin':
            return Response(
                {"detail": "Only admins can review properties"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        property = self.get_object()
        action = request.data.get('action')
        
        if action == 'approve':
            property.status = 'approved'
            property.admin_approver = request.user
            property.save()
            return Response({"detail": "Property approved successfully"})
        elif action == 'reject':
            property.status = 'rejected'
            property.save()
            return Response({"detail": "Property rejected successfully"})
        else:
            return Response(
                {"detail": "Invalid action"},
                status=status.HTTP_400_BAD_REQUEST
            )

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

    @action(
        detail=True, 
        methods=['post'],
        parser_classes=[MultiPartParser, FormParser],
        url_path='mark_completed'
    )
    def mark_completed(self, request, pk=None):
        try:
            property_obj = self.get_object()
            contractor = Contractor.objects.get(user=request.user)

            # Debug logs
            print("Request data:", request.data)
            print("Request FILES:", request.FILES)

            # Verify this contractor is assigned to the property
            if property_obj.assigned_contractor != contractor:
                return Response(
                    {"detail": "You are not assigned to this property"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Verify property is in progress
            if property_obj.status != 'in_progress':
                return Response(
                    {"detail": "This property is not in progress"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = PropertyCompletionSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {
                        "detail": "Invalid data provided",
                        "errors": serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update property status
            property_obj.status = 'completed'
            property_obj.completion_note = serializer.validated_data['completion_note']
            property_obj.completion_date = timezone.now()
            property_obj.save()

            # Handle image uploads
            images = request.FILES.getlist('images')
            descriptions = request.data.getlist('image_descriptions', [])

            if not images:
                return Response(
                    {"detail": "No images provided"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create completion images
            for index, image in enumerate(images):
                description = descriptions[index] if index < len(descriptions) else ""
                CompletionImage.objects.create(
                    property=property_obj,
                    image=image,
                    description=description
                )

            return Response({
                "detail": "Property marked as completed with images",
                "property": PropertySerializer(property_obj).data
            })

        except Contractor.DoesNotExist:
            return Response(
                {"detail": "Contractor profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print("Error:", str(e))  # Debug log
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def admin_requests(self, request):
        """Get properties pending admin review"""
        if request.user.role != 'admin':
            return Response(
                {"detail": "Only admins can view pending requests"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get properties pending admin review
        properties = Property.objects.filter(status='pending')
        
        serializer = self.get_serializer(properties, many=True)
        return Response(serializer.data)

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

class PriceOfferViewSet(viewsets.ModelViewSet):
    queryset = PriceOffer.objects.all()
    serializer_class = PriceOfferSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'contractor':
            try:
                # Contractors see their own offers
                contractor = Contractor.objects.get(user=user)
                return PriceOffer.objects.filter(contractor=contractor)
            except Contractor.DoesNotExist:
                # If no contractor profile exists, return empty queryset
                return PriceOffer.objects.none()
        elif user.role == 'user':
            # Property owners see offers for their properties
            return PriceOffer.objects.filter(property__homeowner=user)
        elif user.role == 'admin':
            # Admins see all offers
            return PriceOffer.objects.all()
        return PriceOffer.objects.none()
    
    def perform_create(self, serializer):
        # Get the contractor profile for the current user
        contractor = Contractor.objects.get(user=self.request.user)
        
        # Save the offer with the contractor
        offer = serializer.save(
            contractor=contractor,
            status='pending'
        )
        
        # Update the property status to price_proposed
        property_obj = offer.property
        property_obj.status = 'price_proposed'
        property_obj.assigned_contractor = contractor
        property_obj.save()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_price_offer(request, offer_id):
    user = request.user
    if user.role != 'user':
        return Response(
            {"detail": "Only property owners can accept offers"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        offer = PriceOffer.objects.get(id=offer_id)
        property_obj = offer.property
        
        # Verify the user owns this property
        if property_obj.homeowner != user:
            return Response(
                {"detail": "You don't own this property"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update offer status
        offer.status = 'accepted'
        offer.save()
        
        # Update property status
        property_obj.status = 'in_progress'
        property_obj.save()
        
        # Reject all other offers for this property
        PriceOffer.objects.filter(
            property=property_obj, 
            status='pending'
        ).exclude(id=offer_id).update(status='rejected')
        
        return Response(
            {"detail": "Offer accepted successfully", "property": PropertySerializer(property_obj).data},
            status=status.HTTP_200_OK
        )
    except PriceOffer.DoesNotExist:
        return Response(
            {"detail": "Offer not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_price_offer(request, offer_id):
    user = request.user
    if user.role != 'user':
        return Response(
            {"detail": "Only property owners can reject offers"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        offer = PriceOffer.objects.get(id=offer_id)
        property_obj = offer.property
        
        # Verify the user owns this property
        if property_obj.homeowner != user:
            return Response(
                {"detail": "You don't own this property"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update offer status
        offer.status = 'rejected'
        offer.save()
        
        # Reset property status and remove assigned contractor
        property_obj.status = 'approved'
        property_obj.assigned_contractor = None
        property_obj.save()
        
        return Response(
            {"detail": "Offer rejected successfully"},
            status=status.HTTP_200_OK
        )
    except PriceOffer.DoesNotExist:
        return Response(
            {"detail": "Offer not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_property_work(request, property_id):
    user = request.user
    if user.role != 'contractor':
        return Response(
            {"detail": "Only contractors can mark work as completed"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        property_obj = Property.objects.get(id=property_id)
        contractor = Contractor.objects.get(user=user)
        
        # Verify this contractor is assigned to the property
        if property_obj.assigned_contractor != contractor:
            return Response(
                {"detail": "You are not assigned to this property"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verify property is in progress
        if property_obj.status != 'in_progress':
            return Response(
                {"detail": "This property is not in progress"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update property status
        property_obj.status = 'completed'
        property_obj.save()
        
        return Response(
            {"detail": "Property work marked as completed"},
            status=status.HTTP_200_OK
        )
    except Property.DoesNotExist:
        return Response(
            {"detail": "Property not found"},
            status=status.HTTP_404_NOT_FOUND
        )

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_property_completed(request, property_id):
    user = request.user
    if user.role != 'contractor':
        return Response(
            {"detail": "Only contractors can mark properties as completed"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Get the contractor profile
        contractor = Contractor.objects.get(user=user)
        
        # Get the property
        property_obj = Property.objects.get(id=property_id)
        
        # Check if this contractor is assigned to the property
        if property_obj.assigned_contractor != contractor:
            return Response(
                {"detail": "You are not assigned to this property"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if the property is in progress
        if property_obj.status != 'in_progress':
            return Response(
                {"detail": "Only properties in progress can be marked as completed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the property status
        property_obj.status = 'completed'
        property_obj.save()
        
        return Response(
            {"detail": "Property marked as completed successfully"},
            status=status.HTTP_200_OK
        )
    
    except Contractor.DoesNotExist:
        return Response(
            {"detail": "Contractor profile not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Property.DoesNotExist:
        return Response(
            {"detail": "Property not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_review_standalone(request, property_id):
    """Standalone view for admin review"""
    if request.user.role != 'admin':
        return Response(
            {"detail": "Only admins can review properties"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Convert property_id to integer if it's a string
    try:
        property_id = int(property_id)
    except ValueError:
        return Response(
            {"detail": f"Invalid property ID: {property_id}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # List all properties to help debug
    all_properties = Property.objects.all()
    
    try:
        # Check if property exists
        if not Property.objects.filter(id=property_id).exists():
            return Response(
                {"detail": f"Property with ID {property_id} not found. Available IDs: {[p.id for p in all_properties]}"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        property_obj = Property.objects.get(id=property_id)
        action = request.data.get('action')
        
        if action == 'approve':
            property_obj.status = 'approved'
            property_obj.admin_approver = request.user
            property_obj.save()
            return Response({"detail": "Property approved successfully"})
        elif action == 'reject':
            property_obj.status = 'rejected'
            property_obj.save()
            return Response({"detail": "Property rejected successfully"})
        else:
            return Response(
                {"detail": f"Invalid action: {action}"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Property.DoesNotExist:
        return Response(
            {"detail": "Property not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": f"Error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_review_property(request, pk):
    try:
        property = Property.objects.get(pk=pk)
        
        # Get data from request
        status = request.data.get('status')
        
        if status not in ['approved', 'rejected']:
            return Response(
                {"error": "Status must be either 'approved' or 'rejected'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update property
        property.status = status
        property.admin_approver = request.user
        
        # If there's a rejection reason
        if status == 'rejected' and 'rejection_reason' in request.data:
            property.rejection_reason = request.data.get('rejection_reason')
        
        property.save()
        
        return Response({
            "message": f"Property successfully {status}",
            "property": PropertySerializer(property).data
        })
        
    except Property.DoesNotExist:
        return Response(
            {"error": "Property not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_property(request, property_id):
    """Alternative endpoint for admin approval"""
    if request.user.role != 'admin':
        return Response(
            {"detail": "Only admins can approve properties"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        property_id = int(property_id)
        property_obj = Property.objects.get(id=property_id)
        
        action = request.data.get('action')
        
        if action == 'approve':
            property_obj.status = 'approved'
            property_obj.admin_approver = request.user
            property_obj.save()
            return Response({"detail": "Property approved successfully"})
        elif action == 'reject':
            property_obj.status = 'rejected'
            property_obj.save()
            return Response({"detail": "Property rejected successfully"})
        else:
            return Response(
                {"detail": f"Invalid action: {action}"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Property.DoesNotExist:
        return Response(
            {"detail": "Property not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": f"Error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
