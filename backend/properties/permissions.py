from rest_framework.permissions import BasePermission

class IsContractor(BasePermission):
    """
    Custom permission to only allow contractors to access the view.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'contractor' 