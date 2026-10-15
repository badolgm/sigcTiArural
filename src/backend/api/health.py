from django.http import JsonResponse


def health(request):
    """Endpoint de salud (liveness) para el healthcheck de Docker.

    Responde 200 sin tocar la base de datos ni requerir autenticación.
    """
    return JsonResponse({"status": "ok"})
