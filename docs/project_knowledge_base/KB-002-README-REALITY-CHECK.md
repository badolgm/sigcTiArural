# KB-002 - README Reality Check

## Fecha

2026-07-12

## Objetivo

Registrar formalmente el contraste entre `README.md` y el código real del repositorio para identificar afirmaciones verificadas, parciales, planificadas o desactualizadas.

## Fuente

- `README_REALITY_CHECK.md`

## Hallazgos

### Lo que el README describe correctamente

- El stack base del proyecto: Django/DRF, React/Vite, PostgreSQL, Docker Compose, FastAPI y TensorFlow.
- La existencia de backend, frontend, microservicio IA, notebooks y ecosistema documental amplio.
- La presencia de laboratorios interactivos y capacidades visuales avanzadas en frontend.

### Lo que el README sobredeclara o desactualiza

- Autenticación JWT como funcionalidad completada.
- WebSockets/Channels/Daphne como parte activa del backend.
- Edge operativo con BeagleBone Black, MQTT, Flask/TFLite y sensores reales.
- Modelo de datos documentado con relaciones y ownership no observados en el código.
- Endpoints de verificación, health y API docs que no existen realmente.
- Uso de Axios, OpenCV, `pyttsx3`, `scikit-learn` en navegador y Jupyter embebido.

### Lo que aparece como parcialmente cierto

- Arquitectura hexagonal: existe, pero de forma incompleta y coexistiendo con legacy.
- Plataforma cloud/edge: cloud sí existe; edge no está implementado en código real.
- Telemetría “en tiempo real”: hay polling y simulación, pero no evidencia estática de la promesa operativa descrita.
- Instalación Docker: la estructura existe, pero puertos, endpoints y expectativas del README no coinciden completamente con `docker-compose.yml`.

### Hallazgo estructural

- El README opera más como documento de intención y visión de producto que como fuente única de verdad operativa.

## Conclusiones

- El README es **parcialmente confiable**.
- Sirve para entender el alcance aspiracional del proyecto, pero no para reconstruir con precisión su estado real.
- Su valor es mayor como documento de narrativa técnica y menor como referencia operativa de despliegue, integración y arquitectura efectiva.

## Impacto para SIGCT-Rural

- SIGCT-Rural corre el riesgo de sostener decisiones de operación o de priorización basadas en capacidades que aún no existen o no están terminadas.
- La brecha más crítica afecta auth, tiempo real, edge e integración IA.
- En producto y transferencia de conocimiento, esto aumenta la confusión entre lo demo, lo funcional y lo planificado.

## Impacto para EIARC

- Para EIARC, este caso confirma que la documentación no debe ser tratada como contrato canónico si no está gobernada por artefactos técnicos más estables.
- Reafirma la necesidad de una fuente de verdad de arquitectura y contratos semánticos desacoplada de narrativas promocionales o roadmap.
- También muestra la necesidad de trazabilidad clara entre arquitectura objetivo, estado actual y madurez por componente.
