"""
API URL Configuration

These URL patterns expose the REST API for the React frontend.
All endpoints are prefixed with /api/
"""

from django.urls import path
from . import api_views

urlpatterns = [
    # Authentication
    path('auth/login/', api_views.login, name='api_login'),
    path('auth/logout/', api_views.logout, name='api_logout'),
    
    # User Management
    path('users/', api_views.users, name='api_users'),
    
    # Question Management
    path('questions/', api_views.questions, name='api_questions'),
    
    # Test Management
    path('tests/', api_views.tests, name='api_tests'),
    path('tests/<int:test_index>/', api_views.test_detail, name='api_test_detail'),
    
    # Exam Operations
    path('exams/select/<int:test_index>/', api_views.select_test, name='api_select_test'),
    path('exams/submit/', api_views.submit_exam, name='api_submit_exam'),
    
    # Results
    path('results/', api_views.results, name='api_results'),
    path('results/script/', api_views.answer_script, name='api_answer_script'),
]
