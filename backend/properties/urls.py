from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'properties', views.PropertyViewSet, basename='property')
router.register(r'contractors', views.ContractorViewSet, basename='contractor')

urlpatterns = [
    path('', include(router.urls)),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('properties/<int:property_id>/mark_completed/', views.mark_property_completed, name='mark_completed'),
    path('properties/<int:property_id>/admin_review/', views.admin_review_standalone, name='admin-review'),
] 