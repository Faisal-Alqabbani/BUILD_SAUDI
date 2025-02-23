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
    images = PropertyImageSerializer(many=True, read_only=True)
    homeowner = serializers.SerializerMethodField()
    assigned_contractor = serializers.SerializerMethodField()
    condition_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'description', 'address', 'city',
            'size', 'property_type', 'number_of_rooms', 'number_of_floors',
            'plot_number', 'condition', 'condition_display', 
            'status', 'status_display', 'latitude', 'longitude',
            'images', 'homeowner', 'assigned_contractor', 'evaluation_report', 
            'rating', 'evaluation_date'
        ]

    def get_homeowner(self, obj):
        return {
            'name': obj.homeowner.get_full_name() or obj.homeowner.email,
            'email': obj.homeowner.email,
            'phone': obj.homeowner.phone
        }

    def get_assigned_contractor(self, obj):
        if obj.assigned_contractor:
            return {
                'name': obj.assigned_contractor.user.get_full_name(),
                'email': obj.assigned_contractor.user.email,
                'specialization': obj.assigned_contractor.specialization,
                'experience_years': obj.assigned_contractor.experience_years,
                'phone': obj.assigned_contractor.user.phone
            }
        return None

    def get_condition_display(self, obj):
        condition_map = {
            'GOOD': 'حالة ممتازة',
            'FAIR': 'حالة جيدة',
            'POOR': 'حالة متوسطة',
            'DILAPIDATED': 'حالة سيئة'
        }
        return condition_map.get(obj.condition, obj.condition)

    def get_status_display(self, obj):
        status_map = {
            'pending': 'قيد المراجعة',
            'approved': 'تمت الموافقة',
            'rejected': 'مرفوض',
            'eval_pending': 'قيد التقييم'
        }
        return status_map.get(obj.status, obj.status)

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
            'email', 'password',
            'first_name', 'last_name', 'role', 'gender',
            'date_of_birth', 'phone', 'national_id',
            'contractor_details'
        )

    def create(self, validated_data):
        contractor_details = validated_data.pop('contractor_details', None)
        password = validated_data.pop('password')
        
        # Set username to email
        validated_data['username'] = validated_data['email']
        
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
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        try:
            user = CustomUser.objects.get(email=data['email'])
            if user.check_password(data['password']):
                if user.is_active:
                    return user
        except CustomUser.DoesNotExist:
            pass
        
        raise serializers.ValidationError("البريد الإلكتروني أو كلمة المرور غير صحيحة") 