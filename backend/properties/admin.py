from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import CustomUser, Property, Contractor, EvaluationRequest, PropertyImage

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'gender')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'date_of_birth', 'gender')}),
        (_('Contact info'), {'fields': ('phone', 'mobile_verified', 'national_id')}),
        (_('Role'), {'fields': ('role',)}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    
    # Updated add_fieldsets to include all relevant fields
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'password1', 'password2',
                'first_name', 'last_name', 'role', 'gender',
                'date_of_birth', 'phone', 'national_id',
                'is_staff', 'is_superuser'
            ),
        }),
    )
    
    search_fields = ('username', 'first_name', 'last_name', 'email', 'phone', 'national_id')
    ordering = ('username',)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Property)
admin.site.register(Contractor)
admin.site.register(EvaluationRequest)
admin.site.register(PropertyImage)
