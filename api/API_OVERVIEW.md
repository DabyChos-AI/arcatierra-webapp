# 🌱 Arca Tierra API - Overview Técnico

## 📋 Tabla de Contenido
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Variables de Entorno](#variables-de-entorno)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Modelos de Datos](#modelos-de-datos)

---

## 🌟 Introducción

La **Arca Tierra API** es un servicio backend desarrollado en **FastAPI** que actúa como gateway principal entre la aplicación web NextJS y los servicios de infraestructura del stack VPS.

### 🎯 Funcionalidades Principales

- **🔗 Gateway de Comunicación:** Conecta frontend NextJS con n8n workflows
- **💾 Gestión de Datos:** Almacena y consulta información en PostgreSQL
- **🤖 Búsquedas Inteligentes:** Implementa búsquedas semánticas con embeddings (mxbai + pgvector)
- **💳 Procesamiento de Pagos:** Integración completa con Mercado Pago
- **📧 Automatización:** Procesa formularios y dispara workflows en n8n
- **🏥 Monitoreo:** Health checks y logging estructurado

### 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    HTTP/REST    ┌──────────────────┐
│   NextJS Web    │ ──────────────► │   Arca Tierra    │
│   Application   │                 │      API         │
└─────────────────┘                 │   (FastAPI)      │
                                    └──────────────────┘
                                             │
                          ┌─────────────────┼─────────────────┐
                          │                 │                 │
                          ▼                 ▼                 ▼
                   ┌──────────┐    ┌─────────────┐    ┌─────────────┐
                   │    n8n   │    │ PostgreSQL  │    │ Servicios   │
                   │Workflows │    │+ pgvector   │    │ Externos    │
                   └──────────┘    └─────────────┘    │• Mercado Pago│
                                                      │• mxbai      │
                                                      │• SMTP       │
                                                      └─────────────┘
```

---

## 🚀 Instalación y Configuración

### 📋 Requisitos del Sistema

- **Python:** 3.11 o superior
- **PostgreSQL:** 14+ con extensión `pgvector`
- **n8n:** Instancia configurada y accesible
- **Docker:** (Opcional) Para containerización
- **mxbai:** Servicio de embeddings

### 🔧 Instalación Local

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd arcatierra-webapp/api

# 2. Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Linux/macOS:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 5. Ejecutar servidor de desarrollo
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 🐳 Instalación con Docker

```bash
# Construcción básica
docker build -t arca-tierra-api .

# Construcción optimizada para n8n
docker build -f Dockerfile.n8n-integration -t arca-tierra-api:n8n .

# Ejecutar contenedor
docker run -d \
  --name arca-api \
  -p 8000:8000 \
  --env-file .env \
  arca-tierra-api
```

---

## 🔑 Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
# =================================================================
# CONFIGURACIÓN DE BASE DE DATOS
# =================================================================
DATABASE_URL=postgresql://username:password@localhost:5432/arcatierra
# Ejemplo: postgresql://arcauser:mypass123@postgres:5432/arcatierra_db

# =================================================================
# INTEGRACIÓN CON N8N
# =================================================================
N8N_WEBHOOK_URL=http://n8n:5678/webhook
N8N_API_URL=http://n8n:5678
# Para desarrollo local: http://localhost:5678

# =================================================================
# SERVICIO DE EMBEDDINGS (mxbai)
# =================================================================
MXBAI_ENDPOINT=http://mxbai-embed-large:8080
# Para desarrollo local: http://localhost:8080

# =================================================================
# MERCADO PAGO - CONFIGURACIÓN
# =================================================================
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-your_access_token_here
MERCADO_PAGO_PUBLIC_KEY=APP_USR-your_public_key_here
MERCADO_PAGO_WEBHOOK_SECRET=your_webhook_secret_here
MERCADO_PAGO_ENVIRONMENT=sandbox  # sandbox o production

# =================================================================
# SEGURIDAD Y AUTENTICACIÓN
# =================================================================
SECRET_KEY=your_super_secret_key_change_this_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# =================================================================
# CONFIGURACIÓN DE CORS
# =================================================================
ALLOWED_ORIGINS=["https://arcatierra.dabychos.com", "https://arcatierra.com", "http://localhost:3000"]

# =================================================================
# CONFIGURACIÓN DE LOGS
# =================================================================
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_FILE=/app/logs/api.log

# =================================================================
# CONFIGURACIÓN DE EMAIL (Opcional)
# =================================================================
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

---

## 📁 Estructura del Proyecto

```
api/
├── main.py                     # 🐍 Aplicación principal FastAPI
├── requirements.txt            # 📦 Dependencias Python
├── Dockerfile                  # 🐳 Containerización básica
├── Dockerfile.n8n-integration # 🐳 Containerización optimizada
├── .env                        # 🔑 Variables de entorno
├── .env.example               # 📋 Plantilla de variables
├── docs/                      # 📚 Documentación
│   ├── API_OVERVIEW.md        # Este archivo
│   ├── API_ENDPOINTS.md       # Documentación de endpoints
│   ├── MERCADO_PAGO_INTEGRATION.md
│   └── DEPLOYMENT_GUIDE.md
├── tests/                     # 🧪 Tests automatizados
├── logs/                      # 📝 Archivos de log
└── uploads/                   # 📁 Archivos subidos
```

---

## 🏗️ Modelos de Datos

### 📝 Formulario de Contacto
```python
class ContactForm(BaseModel):
    name: str                    # Nombre completo (requerido)
    email: EmailStr             # Email válido (requerido)
    phone: Optional[str] = None # Teléfono (opcional)
    message: str                # Mensaje (requerido)
    type: str = "general"       # Tipo: general, experiencia, tienda, catering
```

### 📧 Suscripción Newsletter
```python
class NewsletterSubscription(BaseModel):
    email: EmailStr                          # Email válido (requerido)
    name: Optional[str] = None              # Nombre (opcional)
    preferences: Optional[Dict[str, Any]] = None  # Preferencias (opcional)
```

### 🛍️ Consulta de Producto
```python
class ProductInquiry(BaseModel):
    product_id: Optional[str] = None    # ID del producto (opcional)
    product_name: str                   # Nombre del producto (requerido)
    customer_email: EmailStr           # Email del cliente (requerido)
    customer_name: str                 # Nombre del cliente (requerido)
    quantity: Optional[int] = 1        # Cantidad (default: 1)
    message: Optional[str] = None      # Mensaje adicional (opcional)
```

### 🎯 Reserva de Experiencia
```python
class ExperienceBooking(BaseModel):
    experience_id: str                      # ID de la experiencia (requerido)
    customer_name: str                     # Nombre del cliente (requerido)
    customer_email: EmailStr              # Email del cliente (requerido)
    customer_phone: Optional[str] = None  # Teléfono (opcional)
    participants: int                      # Número de participantes (requerido)
    preferred_date: Optional[str] = None  # Fecha preferida (opcional)
    message: Optional[str] = None         # Mensaje adicional (opcional)
```

### 🔍 Consulta de Búsqueda
```python
class SearchQuery(BaseModel):
    query: str                          # Término de búsqueda (requerido)
    limit: Optional[int] = 10          # Límite de resultados (default: 10)
    category: Optional[str] = None     # Categoría específica (opcional)
```

---

## 🔧 Configuraciones Adicionales

### 🌐 CORS (Cross-Origin Resource Sharing)
```python
origins = [
    "https://arcatierra.dabychos.com",  # Dominio de producción
    "https://arcatierra.com",           # Dominio principal
    "http://localhost:3000",            # Desarrollo local NextJS
    "http://localhost:3001"             # Desarrollo alternativo
]
```

### 📊 Logging Configuración
```python
# Niveles de log disponibles:
# DEBUG: Información detallada de debugging
# INFO: Información general del funcionamiento
# WARNING: Advertencias que no impiden el funcionamiento
# ERROR: Errores que pueden afectar funcionalidad
# CRITICAL: Errores críticos que pueden detener el sistema
```

---

## 📚 Próximos Pasos

1. **📖 Revisar API_ENDPOINTS.md** - Documentación completa de todos los endpoints
2. **💳 Consultar MERCADO_PAGO_INTEGRATION.md** - Integración con sistema de pagos
3. **🚀 Ver DEPLOYMENT_GUIDE.md** - Guía de despliegue en producción

---

*📝 Documentación generada para Arca Tierra API v1.0.0*
*🕒 Última actualización: Enero 2025*
