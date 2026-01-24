from django.db import models
from django.utils import timezone

class SensorReading(models.Model):
    sensor_id = models.CharField(max_length=50, default="BBB-03")
    temperature = models.FloatField()
    humidity = models.FloatField()
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.sensor_id}: {self.temperature}°C"

# ==========================================
#  MODELOS DE ROBÓTICA (Fase 6)
# ==========================================

class Robot(models.Model):
    ROBOT_TYPES = [
        ('ground', 'Terrestre (Rover)'),
        ('aerial', 'Aéreo (Drone)'),
        ('arm', 'Brazo Robótico'),
    ]
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('inactive', 'Inactivo'),
        ('maintenance', 'Mantenimiento'),
    ]

    robot_id = models.CharField(max_length=50, unique=True, primary_key=True)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=ROBOT_TYPES, default='ground')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.robot_id})"

class RobotTelemetry(models.Model):
    robot = models.ForeignKey(Robot, on_delete=models.CASCADE, related_name='telemetries')
    battery_level = models.FloatField(help_text="Porcentaje de batería 0-100")
    status_mode = models.CharField(max_length=50, default='idle') # idle, moving, error
    position_x = models.FloatField(default=0.0)
    position_y = models.FloatField(default=0.0)
    position_z = models.FloatField(default=0.0)
    velocity_linear = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = "Robot Telemetries"

class RobotCommand(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('normal', 'Normal'),
        ('high', 'Alta'),
        ('emergency', 'Emergencia'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('sent', 'Enviado'),
        ('in_progress', 'En Progreso'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
    ]

    robot = models.ForeignKey(Robot, on_delete=models.CASCADE, related_name='commands')
    command_type = models.CharField(max_length=50) # NAVIGATE, STOP, etc.
    payload = models.JSONField(default=dict, help_text="Parámetros del comando en JSON")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    executed_at = models.DateTimeField(null=True, blank=True)
    result_log = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.command_type} -> {self.robot.robot_id} [{self.status}]"
