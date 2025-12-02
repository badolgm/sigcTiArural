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