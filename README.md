<div align="center">

# 🌾 **SIGC&T Rural**  
### *Sistema Integrado de Gestión del Conocimiento y Tecnología Rural*  

💡 **Aplicación Web Académica y Científica**  
para el desarrollo sostenible, la educación técnica y el control inteligente de dispositivos embebidos mediante **Inteligencia Artificial**.

---

![Banner SIGC&T](https://img.shields.io/badge/Proyecto%20Productivo-SENA-2e8b57?style=for-the-badge)
![Estado del Proyecto](https://img.shields.io/badge/Estado-En%20Desarrollo-blue?style=for-the-badge)
![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-yellow?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-Backend-black?style=for-the-badge&logo=flask)
![BeagleBone Black](https://img.shields.io/badge/BeagleBone%20Black-RevC-orange?style=for-the-badge)
![AI](https://img.shields.io/badge/Inteligencia%20Artificial-TensorFlow%20%7C%20PyTorch-ff6f00?style=for-the-badge)

</div>

---

## 🧭 **Descripción General**

**SIGC&T Rural** es una aplicación web de propósito académico, científico y social que busca **impulsar la educación técnica aplicada al campo colombiano** mediante **recursos digitales, simulaciones en tiempo real** y **tecnologías de inteligencia artificial integradas con sistemas embebidos** como:

- **BeagleBone Black Rev C**  
- **Raspberry Pi**  
- **Arduino**  
- **FPGA**

Este proyecto nace en el marco del **PROYECTO PRODUCTIVO** del **SENA (Servicio Nacional de Aprendizaje)**, dentro del programa **Tecnología en Análisis y Desarrollo de Software**, con el objetivo de **integrar ciencia, tecnología y sostenibilidad en zonas rurales** a través de una plataforma abierta, educativa y colaborativa.

---

## 🌍 **Propósito e Impacto Social**

El proyecto se concibe como una **plataforma educativa integral**, orientada al **desarrollo sostenible** y la **inclusión tecnológica** de comunidades rurales en Colombia.  

La web integrará laboratorios interactivos, modelos de IA, recursos académicos, videos instructivos, y enlaces a instituciones de prestigio que fomentan el conocimiento abierto y gratuito, tales como:

- **[PlantVillage (Penn State University)](https://plantvillage.psu.edu/)** — Referente para detección de enfermedades agrícolas con IA.  
- **[EVA FING - Universidad de la República, Uruguay](https://open.fing.edu.uy/)** — Cursos abiertos en ingeniería y tecnología.  
- **[SENA Colombia](https://www.sena.edu.co/es-co/Paginas/default.aspx)** — Formación técnica y tecnológica abierta.  
- **[Kaggle Plant Disease Classification](https://www.kaggle.com/code/shreyashpatil217/plant-disease-classification-transfer-learnig)**  
- **[Plant Diseases Deep Learning](https://www.kaggle.com/code/fenilchodvadiya/plant-diseases-detection-using-deep-learning)**  
- **[Plant Disease Detection Repository](https://github.com/imskr/Plant_Disease_Detection.git)**  
- **[PlantVillage Dataset API](https://plantvillage.psu.edu/)**  
- **[PlantVillage GitHub Dataset](https://github.com/spMohanty/PlantVillage-Dataset)**  

El sistema servirá como un **laboratorio digital** accesible desde cualquier institución educativa o centro rural, permitiendo al usuario:
- Analizar variables agrícolas (temperatura, humedad, plagas, etc.).
- Entrenar modelos de IA para diagnóstico o predicción.
- Visualizar datos y tomar decisiones inteligentes para cultivos.  

🌱 **Ejemplo de aplicación práctica:**  
En una finca rural con tres nodos BeagleBone Black, los sensores recopilan datos de temperatura, humedad y luz, que son procesados por la IA de la plataforma. Los resultados se visualizan en tiempo real desde la web, ayudando a optimizar el riego, la cosecha y la productividad agrícola.

---

## 🧠 **Enfoque Académico y Tecnológico**

El proyecto ofrece **recursos educativos integrados**, en áreas de:
- Matemáticas aplicadas  
- Física y simulación  
- Electrónica analógica y digital  
- Telecomunicaciones y señales GNU  
- Informática y telemática  
- Inteligencia Artificial aplicada a sistemas embebidos  

Todo el material será de **acceso libre y open source**, promoviendo una educación digital **sin barreras, sin publicidad invasiva y con enfoque científico real**.

---

## 🎯 **Objetivos Específicos**

- 💻 Integrar recursos académicos y simulaciones interactivas.  
- 🤖 Controlar hardware embebido desde una interfaz web.  
- 🧩 Incorporar modelos de IA para decisiones predictivas y simulaciones dinámicas.  
- ☁️ Facilitar la experimentación científica remota y colaborativa.  
- 🌾 Impulsar la productividad agroindustrial mediante tecnologías abiertas.  
- 🧑‍🏫 Apoyar la formación SENA y las instituciones rurales en educación tecnológica.  

---

```

## ⚙️ **Tecnologías Base**

| Categoría | Tecnologías |
|------------|--------------|
| **Lenguajes Base** | Python, JavaScript |
| **Frameworks Backend** | Flask, Django, Node.js (Express) |
| **Frontend Web** | HTML5, CSS3, JavaScript, React, TailwindCSS |
| **Comunicación** | WebSocket, REST API, MQTT |
| **IA y Aprendizaje Automático** | TensorFlow, PyTorch, Scikit-learn |
| **Dispositivos Embebidos** | BeagleBone Black, Raspberry Pi, Arduino, FPGA |
| **Bases de Datos** | PostgreSQL, SQLite, MongoDB |
| **Infraestructura** | Docker, Nginx, Linux Servers |
| **Control de Versiones** | Git / GitHub |

```

```

## 🧩 **Arquitectura General del Sistema**



┌────────────────────────────┐
│ Interfaz Web (UI) │ ← Navegador del Usuario
└───────────────┬────────────┘
│
Comunicación WebSocket / REST
│
┌───────────────▼───────────────┐
│ Servidor Web / API Backend │ ← Python (Flask / Django) o Node.js
│ - Gestión de usuarios │
│ - Control de sesiones │
│ - Módulo IA y simulaciones │
└───────────────┬───────────────┘
│
SSH / MQTT / TCP/IP
│
┌───────────────▼───────────────┐
│ Dispositivos Embebidos │
│ (BeagleBone, Pi, FPGA, etc.) │
│ - Sensores / Actuadores │
│ - Control en tiempo real │
└───────────────────────────────┘


```


## 🧠 **Ejemplo de Conexión con BeagleBone Black**

```python
import Adafruit_BBIO.GPIO as GPIO
import time

GPIO.setup("P8_10", GPIO.OUT)

for i in range(5):
    GPIO.output("P8_10", GPIO.HIGH)
    time.sleep(1)
    GPIO.output("P8_10", GPIO.LOW)
    time.sleep(1)

GPIO.cleanup()

🧰 Estructura Sugerida del Proyecto
sigcTiArural/
├── docs/                  # Documentación técnica y académica
├── src/                   # Código fuente
│   ├── backend/           # API, control de IA y lógica
│   ├── frontend/          # Interfaz web y componentes visuales
│   ├── ai_models/         # Modelos entrenados y scripts de IA
│   └── embedded/          # Drivers y comunicación con hardware
├── tests/                 # Pruebas unitarias y funcionales
├── data/                  # Datos para simulaciones y entrenamientos
├── config/                # Configuraciones y credenciales
├── requirements.txt       # Dependencias de Python
├── package.json           # Dependencias Node.js
└── README.md              # Este documento

🚀 Instalación Local
1️⃣ Clonar el repositorio
git clone https://github.com/badolgm/sigcTiArural.git
cd sigcTiArural

2️⃣ Crear entorno virtual (Python)
python -m venv venv
source venv/bin/activate   # Linux / Mac
venv\Scripts\activate      # Windows

3️⃣ Instalar dependencias
pip install -r requirements.txt

4️⃣ Ejecutar el servidor local
python app.py


Accede desde tu navegador:
👉 http://localhost:5000

👥 Autores y Colaboradores

Bernardo A. Gómez Montoya
Desarrollador e Investigador — Proyecto SIGC&T Rural
📧 badolgm@gmail.com

📍 Colombia

Con el apoyo de instructores, aprendices y equipos académicos del SENA – Tecnología en Análisis y Desarrollo de Software.

🧾 Licencia

Este proyecto está licenciado bajo MIT License.
Puedes usarlo, modificarlo y redistribuirlo citando la fuente original.

© 2025 Bernardo A. Gómez Montoya — Proyecto SIGC&T Rural.

<div align="center">
🌱 “La educación tecnológica aplicada es el camino más corto entre la idea y la innovación.”

— Proyecto SIGC&T Rural

🔗 Repositorio GitHub
 •
📚 Documentación Técnica (en construcción)
 •
🌾 PlantVillage

⭐ Si este proyecto te inspira, apóyalo con un Star en GitHub.

</div> ```
