from rest_framework import serializers
from .models import SensorReading, Robot, RobotTelemetry, RobotCommand

class SensorReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorReading
        fields = '__all__'

class RobotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Robot
        fields = '__all__'

class RobotTelemetrySerializer(serializers.ModelSerializer):
    class Meta:
        model = RobotTelemetry
        fields = '__all__'

class RobotCommandSerializer(serializers.ModelSerializer):
    class Meta:
        model = RobotCommand
        fields = '__all__'
