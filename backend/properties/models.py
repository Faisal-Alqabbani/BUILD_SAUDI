from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from multiselectfield import MultiSelectField

# Create your models here.

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    ROLE_CHOICES = (
        ('user', 'Property Owner'),
        ('admin', 'Administrator'),
        ('contractor', 'Contractor'),
    )
    
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
    )
    
    # Basic Info
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    gender = models.CharField(max_length=6, choices=GENDER_CHOICES, default='male')
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Contact & Verification
    phone = models.CharField(max_length=20, blank=True)
    mobile_verified = models.BooleanField(default=False)
    national_id = models.CharField(max_length=10, unique=True, null=True, blank=True)
    registration_date = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Remove username from required fields

    def __str__(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username

    def save(self, *args, **kwargs):
        if not self.username:
            # Set username to email if not provided
            self.username = self.email
        super().save(*args, **kwargs)

class Property(models.Model):
    PROPERTY_TYPES = (
        ('house', 'House'),
        ('apartment', 'Apartment'),
    )

    CONDITION_CHOICES = [
        ('GOOD', 'Good'),
        ('FAIR', 'Fair'),
        ('POOR', 'Poor'),
        ('DILAPIDATED', 'Dilapidated'),
    ]

    STATUS_CHOICES = (
        ('pending', 'Pending Admin Review'),
        ('approved', 'Approved & Available'),
        ('price_proposed', 'Price Proposed'),
        ('in_progress', 'Work In Progress'),
        ('completed', 'Work Completed'),
        ('rejected', 'Rejected'),
    )

    WORK_AREA_CHOICES = [
        ('kitchen', 'مطبخ'),
        ('bathroom', 'حمام'),
        ('bedroom', 'غرفة نوم'),
        ('living_room', 'غرفة معيشة'),
        ('full_house', 'المنزل بالكامل'),
        ('exterior', 'خارجي'),
        ('roof', 'سقف'),
        ('plumbing', 'سباكة'),
        ('electrical', 'كهرباء'),
        ('other', 'أخرى')
    ]
    
    homeowner = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='properties')
    title = models.CharField(max_length=200)
    description = models.TextField()
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[
            MinValueValidator(-90),
            MaxValueValidator(90)
        ]
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[
            MinValueValidator(-180),
            MaxValueValidator(180)
        ]
    )
    plot_number = models.CharField(max_length=50)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES)
    size = models.DecimalField(max_digits=10, decimal_places=2)
    number_of_floors = models.PositiveIntegerField(null=True, blank=True)
    number_of_rooms = models.PositiveIntegerField(null=True, blank=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    rating = models.FloatField(null=True, blank=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    
    # Workflow Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_approver = models.ForeignKey(
        'CustomUser', 
        null=True, 
        on_delete=models.SET_NULL, 
        related_name='approved_properties'
    )
    assigned_contractor = models.ForeignKey(
        'Contractor', 
        null=True, 
        blank=True,
        on_delete=models.SET_NULL
    )
    evaluation_report = models.TextField(blank=True)
    evaluation_date = models.DateTimeField(null=True)
    completion_note = models.TextField(blank=True, null=True)
    completion_date = models.DateTimeField(null=True, blank=True)

    work_areas = MultiSelectField(
        choices=WORK_AREA_CHOICES,
        max_choices=10,
        max_length=100,
        blank=True,
        verbose_name="مناطق العمل",
        help_text="حدد جميع المناطق التي تحتاج إلى عمل"
    )
    
    work_details = models.TextField(
        blank=True, 
        null=True,
        verbose_name="تفاصيل العمل",
        help_text="قدم وصفاً مفصلاً للعمل المطلوب لكل منطقة"
    )

    def __str__(self):
        return f"{self.title} - {self.city}"

    @property
    def completion_images_count(self):
        return self.completion_images.count()

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='properties/')
    is_thumbnail = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Image for {self.property.title} ({'Thumbnail' if self.is_thumbnail else 'Gallery'})"

class Contractor(models.Model):
    user = models.OneToOneField('CustomUser', on_delete=models.CASCADE)
    specialization = models.CharField(max_length=100)
    experience_years = models.IntegerField()
    license_number = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.specialization}"

class EvaluationRequest(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    contractor = models.ForeignKey(Contractor, on_delete=models.CASCADE)
    assigned_date = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)

class PriceOffer(models.Model):
    property = models.ForeignKey(Property, related_name='price_offers', on_delete=models.CASCADE)
    contractor = models.ForeignKey(Contractor, related_name='price_offers', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    proposed_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=(
            ('pending', 'Pending'),
            ('accepted', 'Accepted'),
            ('rejected', 'Rejected'),
        ),
        default='pending'
    )
    
    class Meta:
        ordering = ['-proposed_at']
        
    def __str__(self):
        return f"Offer for {self.property.title} by {self.contractor.user.first_name}"

class CompletionImage(models.Model):
    property = models.ForeignKey(
        Property, 
        on_delete=models.CASCADE,
        related_name='completion_images'
    )
    image = models.ImageField(upload_to='completion_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['uploaded_at']
