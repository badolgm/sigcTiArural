"""
Pytest configuration and shared fixtures for backend tests.

For Fase 0 we keep it minimal because domain tests are pure Python.
In later phases we can add Django fixtures here if needed.
"""
import pytest

# Example future fixture (commented for now):
# @pytest.fixture
# def sample_sensor_data():
#     return {"temperature": 25.0, "humidity": 60.0}