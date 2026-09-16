# SIGCT-Rural — Identidad del Ecosistema (Documento Canónico)

**Autor:** Bernardo Adolfo Gómez Montoya
**Fecha:** 20 de julio de 2026
**Estatus:** Documento vigente de identidad. Supera y reconcilia las definiciones previas en `EIARC_MISSION.md`, `EIARC_SCOPE.md`, `EIARC_VISION.md` (marco de gobierno arquitectónico abstracto) y las secciones de `PLAN_MAESTRO.md`/`MASTERDOC.md` sobre "EIARC — Ecosistema de Inteligencia Artificial y Robótica para el Campo" (expansión agropecuaria). Esos documentos no se eliminan del disco — quedan marcados como históricos.

---

## La palabra clave es ECOSISTEMA

No plataforma. No aplicación. No dashboard. No laboratorio. No IA.

Una plataforma puede contener módulos. SIGCT-Rural contiene: Conocimiento, Investigación, Laboratorios, IA, Telemetría, Arquitectura, Gobernanza, Formación, Experimentación — todos conectados entre sí, no aislados unos de otros.

## Qué es, en una frase

SIGCT-Rural es un ecosistema construido sobre una arquitectura basada en Bounded Contexts (DDD), donde los contextos de Conocimiento, Investigación, IA, Laboratorios, Telemetría y Gobernanza colaboran para producir evidencia verificable y transformar esa evidencia nuevamente en conocimiento.

## El origen y la evolución

El proyecto nació como monitoreo agrícola con IoT — variables como pH o enfermedades de plantas. Evolucionó porque su autor no quería un simple sistema clasificador de enfermedades, sino una plataforma donde investigadores, estudiantes o usuarios pudieran investigar ciencia de datos, machine learning, deep learning y algoritmos de aprendizaje en general — usando como dominio de aplicación variables agropecuarias (agricultura de precisión, ganadería inteligente, avicultura, piscicultura, invernaderos inteligentes, monitoreo ambiental) pero sin quedar limitado a ellas.

## Principio 1 — Agnóstico de hardware y de software, sin excepción

No es "para BeagleBone", ni "para Raspberry", ni "para ESP32". Hoy la captura puede venir de una cámara o un sensor de humedad/temperatura; mañana puede venir de un enjambre de robots de IA monitoreando cultivos a gran escala, o de un sistema de captura acústica que nadie ha imaginado todavía. El diseño nunca se ata a un dispositivo específico — cualquier hardware que produzca una señal puede conectarse al ecosistema.

**Nota de alcance:** ejemplos como "el zumbido de un enjambre de abejas" o "un collar de vacas que detecta estrés" no son módulos que el proyecto se compromete a construir. Son ilustraciones de que la infraestructura de adquisición de señales (acústica, imagen, sensor) ya es genérica — cualquiera que use el ecosistema podría estudiar eso, o cualquier otra cosa, con las herramientas que el ecosistema ya provee. El objetivo no es construir el caso de las abejas; es que la infraestructura permita que alguien lo construya si quiere.

## Principio 2 — Los laboratorios deben poder comunicarse entre sí

No son contenido estático ni módulos-vitrina aislados. Son evidencia, y la evidencia debe poder fluir. Ejemplo del propio autor: si un laboratorio captura una señal (auditiva, de imagen, de sensor), esa señal debe poder seguirse a través del ecosistema — verse en el espectro de frecuencias en el laboratorio de Señales, estudiarse como circuito en Electrónica, modelarse matemáticamente en el laboratorio de Matemáticas, transmitirse en el de Telecomunicaciones. Un estudiante de electrónica podría interactuar con una placa física simple para entender cómo viaja esa señal en un circuito real, y desde ahí decidir si quiere profundizar más en el panel de matemáticas. Esta interconexión dinámica es, según el propio autor, la idea más poderosa del proyecto — más que la IA, más que Docker, más que el Dashboard.

## Principio 3 — No es un LMS

Un LMS normalmente enseña. SIGCT-Rural pretende aprender haciendo, investigando, construyendo, validando. Los laboratorios no son contenido — son evidencia. No compite con plataformas educativas posicionadas en el mercado. Los cursos y laboratorios propios son seleccionados y curados; además, el ecosistema se apoya de forma agnóstica en cualquier recurso académico abierto que internet ofrece — grandes sitios de investigación científica avanzada, referenciados directamente desde los laboratorios. Cuando el diseño de un experimento exige algo más avanzado de lo que el ecosistema ofrece internamente, el sistema **redirige** al lugar correcto — no deja al usuario buscando por su cuenta ni lo retiene con contenido insuficiente.

## Principio 4 — Tampoco es una plataforma IoT

El sistema ya contiene IA Predictiva, AI Research, Knowledge Base, Gobernanza, EIARC, Telemetría, documentación científica y referencias académicas. IoT es solo una de las tecnologías utilizadas — no la identidad del proyecto.

## Qué es EIARC realmente

EIARC es el caso de uso real del propio ecosistema funcionando como proyecto productivo — la demostración de que lo aprendido dentro de SIGCT-Rural (señales, electrónica, matemáticas, telecomunicaciones, IA) se puede convertir en una solución real, con enfoque en resolver problemas de la población más vulnerable o sacar a alguien de la pobreza extrema. No es un tema aparte, ni un framework de gobierno semántico desconectado del dominio — es el ecosistema demostrándose a sí mismo como startup, como caso de I+D+i formal ante el SENA.

EIARC también terminó siendo una forma de pensar dentro del proyecto: cuando algo falla, no se asume — se audita. Cuando aparece una contradicción, no se oculta — se documenta. Esa filosofía de verificación (evidencia sobre suposición) es la misma que rige la relación de trabajo entre el autor y cualquier IA que participe en el desarrollo del proyecto, incluido Claude.

## El ciclo central del ecosistema

Conocimiento produce Investigación. Investigación produce IA. IA produce Laboratorios. Laboratorios producen evidencia. La evidencia vuelve al Conocimiento.

Ese ciclo — no la IA, no MQTT, no Docker, no el Dashboard, no el Knowledge Hub por sí solos — es el corazón de SIGCT-Rural.

## Para quién es

Aprendices del SENA e investigadores/estudiantes de universidades en Colombia, y en principio cualquier persona interesada en ciencia de datos, investigación aplicada o construcción de proyectos productivos con enfoque tecnológico — sin importar si entra como científico de datos, investigador universitario, o simplemente alguien con una idea de hardware propio que quiere apoyo. El ecosistema ofrece conocimiento, tutoriales y enlaces para eso también.

## Qué podría llegar a ser

Un ecosistema digital de referencia para formación tecnológica basada en evidencia, donde un estudiante pueda entrar, aprender, investigar, ejecutar, validar y documentar, todo en un mismo entorno — y donde un investigador pueda mostrar métodos, resultados, errores y evidencia de forma transparente.

## Definición de cierre

SIGCT-Rural es un ecosistema vivo de conocimiento verificable donde formación, investigación, inteligencia artificial, laboratorios y telemetría convergen para transformar aprendizaje en evidencia, y evidencia en conocimiento — construido sobre Bounded Contexts, agnóstico de hardware y software, y validado a través de EIARC como su primer caso de uso productivo real.
