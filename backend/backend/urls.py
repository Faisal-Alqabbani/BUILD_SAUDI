"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from properties.views import (
    CustomUserViewSet, PropertyViewSet,
    ContractorViewSet, EvaluationRequestViewSet,
    signup_view, login_view, logout_view,
    PriceOfferViewSet, accept_price_offer, reject_price_offer, complete_property_work,
    mark_property_completed, admin_review_standalone, approve_property
)
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)
router.register(r'properties', PropertyViewSet)
router.register(r'contractors', ContractorViewSet)
router.register(r'evaluation-requests', EvaluationRequestViewSet)
router.register(r'price-offers', PriceOfferViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/signup/', signup_view, name='signup'),
    path('api/login/', login_view, name='login'),
    path('api/logout/', logout_view, name='logout'),
    path('api/price-offers/<int:offer_id>/accept/', accept_price_offer, name='accept-price-offer'),
    path('api/price-offers/<int:offer_id>/reject/', reject_price_offer, name='reject-price-offer'),
    path('api/properties/<int:property_id>/complete/', complete_property_work, name='complete-property-work'),
    path('api/properties/<int:property_id>/mark_completed/', mark_property_completed, name='mark-property-completed'),
    path('api/properties/<int:property_id>/admin_review/', admin_review_standalone, name='admin-review'),
    path('api/properties/<int:property_id>/approve/', approve_property, name='approve-property'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
