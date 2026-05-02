from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.ServiceViewSet, basename='service')
router.register(r'schedules', views.ScheduleViewSet, basename='schedule')
router.register(r'weekly-slots', views.WeeklySlotViewSet, basename='weekly-slot')
router.register(r'flexible-slots', views.FlexibleSlotViewSet, basename='flexible-slot')
router.register(r'questions', views.ServiceQuestionViewSet, basename='service-question')
router.register(r'resources', views.ResourceViewSet, basename='resource')

urlpatterns = [
    path('', include(router.urls)),
]
