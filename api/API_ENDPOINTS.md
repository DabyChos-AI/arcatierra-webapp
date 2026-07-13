# 🔌 Arca Tierra API - Endpoints Documentation

## 📋 Tabla de Contenido
1. [Health Check Endpoints](#-health-check-endpoints)
2. [Formularios y Contacto](#-formularios-y-contacto)
3. [Gestión de Productos](#️-gestión-de-productos)
4. [Experiencias y Reservas](#-experiencias-y-reservas)
5. [Búsquedas Semánticas](#-búsquedas-semánticas)
6. [Webhooks y Integraciones](#-webhooks-y-integraciones)
7. [Códigos de Respuesta](#-códigos-de-respuesta)

---

## 🏥 Health Check Endpoints

### `GET /health`
**Descripción:** Verificación básica del estado del servicio

**URL:** `http://localhost:8000/health`

**Respuesta Exitosa:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-18T19:35:07Z",
  "service": "arca-tierra-api",
  "version": "1.0.0"
}
```

**Ejemplo de uso (curl):**
```bash
curl -X GET "http://localhost:8000/health" \
  -H "Content-Type: application/json"
```

---

### `GET /health/detailed`
**Descripción:** Verificación detallada del sistema y servicios dependientes

**URL:** `http://localhost:8000/health/detailed`

**Respuesta Exitosa:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-18T19:35:07Z",
  "services": {
    "database": "healthy",
    "n8n": "healthy",
    "mxbai": "healthy"
  }
}
```

**Respuesta con Degradación:**
```json
{
  "status": "degraded",
  "timestamp": "2025-01-18T19:35:07Z",
  "services": {
    "database": "healthy",
    "n8n": "unhealthy: Connection timeout",
    "mxbai": "healthy"
  }
}
```

---

## 📝 Formularios y Contacto

### `POST /contact`
**Descripción:** Procesar formularios de contacto desde la web

**URL:** `http://localhost:8000/contact`

**Headers Requeridos:**
```
Content-Type: application/json
```

**Cuerpo de la Solicitud:**
```json
{
  "name": "Juan Pérez",
  "email": "juan.perez@email.com",
  "phone": "+54911234567",
  "message": "Me interesa conocer más sobre sus productos orgánicos",
  "type": "tienda"
}
```

**Campos:**
- `name` (string, requerido): Nombre completo
- `email` (string, requerido): Email válido
- `phone` (string, opcional): Número de teléfono
- `message` (string, requerido): Mensaje del usuario
- `type` (string, opcional): Tipo de consulta
  - `"general"` - Consulta general
  - `"experiencia"` - Consulta sobre experiencias
  - `"tienda"` - Consulta sobre productos
  - `"catering"` - Consulta sobre catering

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Formulario enviado correctamente",
  "id": "contact_1705684507_abc123"
}
```

**Ejemplo de uso (JavaScript):**
```javascript
const response = await fetch('http://localhost:8000/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'María García',
    email: 'maria@email.com',
    phone: '+54911234567',
    message: '¿Tienen talleres de agricultura urbana?',
    type: 'experiencia'
  })
});

const data = await response.json();
console.log(data);
```

---

### `POST /newsletter`
**Descripción:** Suscripción al newsletter de Arca Tierra

**URL:** `http://localhost:8000/newsletter`

**Cuerpo de la Solicitud:**
```json
{
  "email": "usuario@email.com",
  "name": "Ana López",
  "preferences": {
    "frequency": "weekly",
    "categories": ["productos", "experiencias", "tips"]
  }
}
```

**Campos:**
- `email` (string, requerido): Email válido
- `name` (string, opcional): Nombre del suscriptor
- `preferences` (object, opcional): Preferencias de suscripción

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Suscripción exitosa al newsletter"
}
```

---

## 🛍️ Gestión de Productos

### `GET /products`
**Descripción:** Obtener lista de productos disponibles

**URL:** `http://localhost:8000/products`

**Parámetros de Consulta:**
- `category` (string, opcional): Filtrar por categoría
- `seasonal` (boolean, opcional): Filtrar productos estacionales

**Ejemplos de URLs:**
```
GET /products
GET /products?category=organicos
GET /products?seasonal=true
GET /products?category=conservas&seasonal=false
```

**Respuesta Exitosa:**
```json
{
  "products": [
    {
      "id": "prod_001",
      "name": "Miel Orgánica de Montaña",
      "description": "Miel pura extraída de colmenas en la montaña",
      "category": "organicos",
      "price": 2500.00,
      "currency": "ARS",
      "seasonal": false,
      "available": true,
      "stock": 25,
      "images": [
        "https://cdn.arcatierra.com/products/miel_001.jpg"
      ],
      "created_at": "2024-12-01T10:00:00Z",
      "updated_at": "2025-01-15T14:30:00Z"
    },
    {
      "id": "prod_002", 
      "name": "Kit de Hierbas Aromáticas",
      "description": "Selección de hierbas frescas de temporada",
      "category": "hierbas",
      "price": 1800.00,
      "currency": "ARS",
      "seasonal": true,
      "available": true,
      "stock": 12,
      "images": [
        "https://cdn.arcatierra.com/products/hierbas_002.jpg"
      ],
      "created_at": "2024-11-15T09:00:00Z",
      "updated_at": "2025-01-10T16:45:00Z"
    }
  ]
}
```

---

### `POST /products/inquiry`
**Descripción:** Enviar consulta sobre un producto específico

**URL:** `http://localhost:8000/products/inquiry`

**Cuerpo de la Solicitud:**
```json
{
  "product_id": "prod_001",
  "product_name": "Miel Orgánica de Montaña",
  "customer_email": "cliente@email.com",
  "customer_name": "Roberto Silva",
  "quantity": 3,
  "message": "¿Tienen descuentos por cantidad? Me interesan 3 frascos."
}
```

**Campos:**
- `product_id` (string, opcional): ID del producto
- `product_name` (string, requerido): Nombre del producto
- `customer_email` (string, requerido): Email del cliente
- `customer_name` (string, requerido): Nombre del cliente
- `quantity` (integer, opcional): Cantidad deseada (default: 1)
- `message` (string, opcional): Mensaje adicional

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Consulta enviada correctamente",
  "inquiry_id": "inq_1705684507_xyz789"
}
```

---

## 🎯 Experiencias y Reservas

### `GET /experiences`
**Descripción:** Obtener lista de experiencias disponibles

**URL:** `http://localhost:8000/experiences`

**Parámetros de Consulta:**
- `available` (boolean, opcional): Filtrar por disponibilidad (default: true)

**Respuesta Exitosa:**
```json
{
  "experiences": [
    {
      "id": "exp_001",
      "title": "Taller de Agricultura Urbana",
      "description": "Aprende a crear tu propio huerto en casa",
      "duration": "4 horas",
      "max_participants": 12,
      "price": 8500.00,
      "currency": "ARS",
      "available": true,
      "location": "Vivero Arca Tierra",
      "includes": [
        "Materiales para el huerto",
        "Semillas orgánicas",
        "Manual de cultivo",
        "Refrigerio saludable"
      ],
      "schedule": [
        {
          "date": "2025-02-15",
          "time": "10:00-14:00",
          "available_spots": 8
        },
        {
          "date": "2025-02-22", 
          "time": "10:00-14:00",
          "available_spots": 12
        }
      ],
      "images": [
        "https://cdn.arcatierra.com/experiences/taller_agricultura_001.jpg"
      ]
    }
  ]
}
```

---

### `POST /experiences/booking`
**Descripción:** Realizar reserva para una experiencia

**URL:** `http://localhost:8000/experiences/booking`

**Cuerpo de la Solicitud:**
```json
{
  "experience_id": "exp_001",
  "customer_name": "Laura Martínez",
  "customer_email": "laura.martinez@email.com",
  "customer_phone": "+54911555666",
  "participants": 2,
  "preferred_date": "2025-02-15",
  "message": "Somos principiantes, ¿el taller es adecuado para nosotros?"
}
```

**Campos:**
- `experience_id` (string, requerido): ID de la experiencia
- `customer_name` (string, requerido): Nombre del cliente
- `customer_email` (string, requerido): Email del cliente
- `customer_phone` (string, opcional): Teléfono de contacto
- `participants` (integer, requerido): Número de participantes
- `preferred_date` (string, opcional): Fecha preferida (YYYY-MM-DD)
- `message` (string, opcional): Mensaje o consulta adicional

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Reserva enviada correctamente",
  "booking_id": "book_1705684507_def456",
  "status": "pending_confirmation"
}
```

---

## 🔍 Búsquedas Semánticas

### `POST /search`
**Descripción:** Búsqueda inteligente usando embeddings e IA

**URL:** `http://localhost:8000/search`

**Cuerpo de la Solicitud:**
```json
{
  "query": "productos orgánicos para el desayuno",
  "limit": 5,
  "category": "alimentos"
}
```

**Campos:**
- `query` (string, requerido): Término o frase de búsqueda
- `limit` (integer, opcional): Máximo número de resultados (default: 10)
- `category` (string, opcional): Filtrar por categoría específica

**Respuesta Exitosa:**
```json
{
  "query": "productos orgánicos para el desayuno",
  "results": {
    "products": [
      {
        "id": "prod_001",
        "name": "Miel Orgánica de Montaña",
        "description": "Miel pura extraída de colmenas en la montaña",
        "category": "organicos",
        "price": 2500.00,
        "distance": 0.15,
        "relevance_score": 0.92
      },
      {
        "id": "prod_003",
        "name": "Mermelada de Frutos Rojos",
        "description": "Mermelada artesanal sin conservantes",
        "category": "conservas",
        "price": 1900.00,
        "distance": 0.23,
        "relevance_score": 0.87
      }
    ],
    "experiences": [
      {
        "id": "exp_002",
        "title": "Taller de Conservas Caseras",
        "description": "Aprende a hacer mermeladas y conservas naturales",
        "price": 6500.00,
        "distance": 0.31,
        "relevance_score": 0.78
      }
    ]
  },
  "total_results": 3,
  "search_time_ms": 45
}
```

**Ejemplo de uso (Python):**
```python
import requests

response = requests.post('http://localhost:8000/search', 
  json={
    "query": "talleres de cocina saludable",
    "limit": 8,
    "category": "experiencias"
  }
)

results = response.json()
print(f"Encontrados {results['total_results']} resultados")
for exp in results['results']['experiences']:
    print(f"- {exp['title']} (relevancia: {exp['relevance_score']})")
```

---

## 🔗 Webhooks y Integraciones

### `POST /webhook/n8n`
**Descripción:** Recibir webhooks desde n8n workflows

**URL:** `http://localhost:8000/webhook/n8n`

**Headers Requeridos:**
```
Content-Type: application/json
X-N8N-Signature: <firma_webhook>
```

**Tipos de Webhooks Soportados:**

#### 1. Confirmación de Pedido
```json
{
  "type": "order_confirmation",
  "data": {
    "order_id": "ORD_12345",
    "customer_email": "cliente@email.com",
    "status": "confirmed",
    "payment_status": "approved",
    "items": [
      {
        "product_id": "prod_001",
        "quantity": 2,
        "price": 2500.00
      }
    ],
    "total": 5000.00
  },
  "timestamp": "2025-01-18T19:35:07Z"
}
```

#### 2. Confirmación de Experiencia
```json
{
  "type": "experience_confirmation", 
  "data": {
    "booking_id": "book_67890",
    "experience_id": "exp_001",
    "customer_email": "cliente@email.com",
    "status": "confirmed",
    "date": "2025-02-15",
    "participants": 2
  },
  "timestamp": "2025-01-18T19:35:07Z"
}
```

#### 3. Bienvenida Newsletter
```json
{
  "type": "newsletter_welcome",
  "data": {
    "email": "nuevo@email.com",
    "name": "Nuevo Suscriptor",
    "subscription_date": "2025-01-18T19:35:07Z",
    "welcome_email_sent": true
  },
  "timestamp": "2025-01-18T19:35:07Z"
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Webhook procesado correctamente",
  "processed_at": "2025-01-18T19:35:07Z"
}
```

---

## 📊 Códigos de Respuesta

### ✅ Códigos de Éxito

| Código | Descripción |
|--------|-------------|
| `200` | OK - Solicitud exitosa |
| `201` | Created - Recurso creado exitosamente |
| `202` | Accepted - Solicitud aceptada para procesamiento |

### ⚠️ Códigos de Error del Cliente

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| `400` | Bad Request - Datos inválidos | Email mal formateado |
| `401` | Unauthorized - No autenticado | Token JWT inválido |
| `403` | Forbidden - Sin permisos | Acceso denegado |
| `404` | Not Found - Recurso no encontrado | Producto inexistente |
| `422` | Unprocessable Entity - Error de validación | Campos requeridos faltantes |
| `429` | Too Many Requests - Rate limit excedido | Muchas solicitudes |

### 🚨 Códigos de Error del Servidor

| Código | Descripción | Acción |
|--------|-------------|--------|
| `500` | Internal Server Error | Contactar soporte |
| `502` | Bad Gateway | Revisar servicios externos |
| `503` | Service Unavailable | Servicio temporalmente no disponible |
| `504` | Gateway Timeout | Timeout en servicios externos |

### 📝 Formato de Error Estándar

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email address is required",
    "details": {
      "field": "email",
      "type": "missing_field"
    }
  },
  "timestamp": "2025-01-18T19:35:07Z",
  "request_id": "req_abc123xyz789"
}
```

---

## 🛠️ Herramientas de Testing

### 📡 Postman Collection
Para facilitar el testing, puedes importar esta colección básica:

```json
{
  "info": {
    "name": "Arca Tierra API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/health"
      }
    },
    {
      "name": "Contact Form",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/contact",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@email.com\",\n  \"message\": \"Test message\",\n  \"type\": \"general\"\n}"
        }
      }
    }
  ]
}
```

---

*📝 Para más información, consultar:*
- *💳 MERCADO_PAGO_INTEGRATION.md - Integración con pagos*
- *🚀 DEPLOYMENT_GUIDE.md - Guía de despliegue*
- *📖 API_OVERVIEW.md - Vista general del sistema*
