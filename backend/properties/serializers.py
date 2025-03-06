from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser, Property, Contractor, EvaluationRequest, PropertyImage, PriceOffer, CompletionImage

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

class CompletionImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompletionImage
        fields = ('id', 'image', 'description', 'uploaded_at')

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    homeowner = serializers.SerializerMethodField()
    assigned_contractor = serializers.SerializerMethodField()
    condition_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    current_price_offer = serializers.SerializerMethodField()
    completion_images = CompletionImageSerializer(many=True, read_only=True)
    work_areas = serializers.CharField(required=False)
    work_areas_display = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'description', 'address', 'city',
            'size', 'property_type', 'number_of_rooms', 'number_of_floors',
            'plot_number', 'condition', 'condition_display', 
            'status', 'status_display', 'latitude', 'longitude',
            'images', 'homeowner', 'assigned_contractor', 'evaluation_report', 
            'rating', 'evaluation_date', 'current_price_offer',
            'completion_note',
            'completion_date',
            'completion_images',
            'completion_images_count',
            'work_areas',
            'work_areas_display',
            'work_details',
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

    def get_current_price_offer(self, obj):
        if obj.status == 'price_proposed':
            offer = obj.price_offers.filter(status='pending').first()
            if offer:
                return PriceOfferSerializer(offer).data
        return None

    def get_work_areas_display(self, obj):
        return [dict(Property.WORK_AREA_CHOICES).get(area, area) for area in obj.work_areas]

    def create(self, validated_data):
        # Handle work_areas if it comes as a string
        if 'work_areas' in validated_data and isinstance(validated_data['work_areas'], str):
            work_areas = validated_data['work_areas'].split(',')
            validated_data['work_areas'] = work_areas

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
        # Handle work_areas if it comes as a string
        if 'work_areas' in validated_data and isinstance(validated_data['work_areas'], str):
            work_areas = validated_data['work_areas'].split(',')
            validated_data['work_areas'] = work_areas

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

class PriceOfferSerializer(serializers.ModelSerializer):
    property_title = serializers.SerializerMethodField()
    property_address = serializers.SerializerMethodField()
    contractor_name = serializers.SerializerMethodField()
    contractor_specialization = serializers.SerializerMethodField()
    contractor_experience_years = serializers.SerializerMethodField()
    contractor_phone = serializers.SerializerMethodField()
    
    class Meta:
        model = PriceOffer
        fields = [
            'id', 
            'property',
            'property_title',
            'property_address',
            'amount',
            'description',
            'status',
            'proposed_at',
            'contractor_name',
            'contractor_specialization',
            'contractor_experience_years',
            'contractor_phone'
        ]
        read_only_fields = ['status', 'proposed_at']
    
    def get_property_title(self, obj):
        return obj.property.title if obj.property else None
    
    def get_property_address(self, obj):
        return obj.property.address if obj.property else None
        
    def get_contractor_name(self, obj):
        return f"{obj.contractor.user.first_name} {obj.contractor.user.last_name}"
    
    def get_contractor_specialization(self, obj):
        return obj.contractor.specialization
    
    def get_contractor_experience_years(self, obj):
        return obj.contractor.experience_years
    
    def get_contractor_phone(self, obj):
        return obj.contractor.user.phone 

class PropertyCompletionSerializer(serializers.Serializer):
    completion_note = serializers.CharField(
        required=True,
        error_messages={
            'required': 'Please provide a completion note',
            'blank': 'Completion note cannot be blank'
        }
    )
    images = serializers.ListField(
        child=serializers.ImageField(
            error_messages={
                'invalid': 'Invalid image format',
                'required': 'Please provide at least one image'
            }
        ),
        required=True,
        min_length=1,
        error_messages={
            'required': 'Please provide at least one image',
            'min_length': 'Please provide at least one image',
            'empty': 'Please provide at least one image'
        }
    )
    image_descriptions = serializers.ListField(
        child=serializers.CharField(allow_blank=True),
        required=False
    ) 