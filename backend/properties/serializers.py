from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser, Property, Contractor, EvaluationRequest, PropertyImage

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            'id', 
            'username', 
            'email', 
            'password',
            'first_name',
            'last_name',
            'role',
            'gender',
            'date_of_birth',
            'phone',
            'mobile_verified',
            'national_id',
            'registration_date'
        )
        extra_kwargs = {
            'password': {'write_only': True},
            'mobile_verified': {'read_only': True},
            'registration_date': {'read_only': True}
        }

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

class ContractorSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    
    class Meta:
        model = Contractor
        fields = '__all__'

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ('id', 'image', 'is_thumbnail', 'order', 'uploaded_at')

class PropertySerializer(serializers.ModelSerializer):
    homeowner = CustomUserSerializer(read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Property
        fields = (
            'id', 'homeowner', 'title', 'description',
            'address', 'city', 'latitude', 'longitude',
            'plot_number', 'property_type', 'size',
            'number_of_floors', 'number_of_rooms',
            'condition', 'status', 'admin_approver',
            'assigned_contractor', 'evaluation_report',
            'evaluation_date', 'images', 'uploaded_images'
        )

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        property = Property.objects.create(**validated_data)
        
        for index, image in enumerate(uploaded_images):
            PropertyImage.objects.create(
                property=property,
                image=image,
                is_thumbnail=(index == 0),  # First image is thumbnail
                order=index
            )
        
        return property

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # Update property instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Add new images if provided
        current_count = instance.images.count()
        for index, image in enumerate(uploaded_images):
            PropertyImage.objects.create(
                property=instance,
                image=image,
                is_thumbnail=(index == 0 and current_count == 0),  # First image is thumbnail only if no existing images
                order=current_count + index
            )
        
        return instance

class EvaluationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationRequest
        fields = '__all__'

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    contractor_details = serializers.DictField(required=False, write_only=True)

    class Meta:
        model = CustomUser
        fields = (
            'username', 'email', 'password',
            'first_name', 'last_name', 'role', 'gender',
            'date_of_birth', 'phone', 'national_id',
            'contractor_details'
        )

    def create(self, validated_data):
        contractor_details = validated_data.pop('contractor_details', None)
        password = validated_data.pop('password')
        
        # Create user
        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()

        # Create contractor if role is contractor
        if user.role == 'contractor' and contractor_details:
            Contractor.objects.create(
                user=user,
                specialization=contractor_details.get('specialization'),
                experience_years=contractor_details.get('experience_years'),
                license_number=contractor_details.get('license_number')
            )

        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect Credentials") 