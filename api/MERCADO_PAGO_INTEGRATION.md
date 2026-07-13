# 💳 Mercado Pago Integration - Arca Tierra API

## 📋 Tabla de Contenido
1. [Configuración Inicial](#-configuración-inicial)
2. [Estructura de Pagos](#-estructura-de-pagos)
3. [Endpoints de Pagos](#-endpoints-de-pagos)
4. [Webhooks de Mercado Pago](#-webhooks-de-mercado-pago)
5. [Manejo de Estados](#-manejo-de-estados)
6. [Testing y Sandbox](#-testing-y-sandbox)
7. [Seguridad](#-seguridad)
8. [Casos de Uso](#-casos-de-uso)

---

## 🔧 Configuración Inicial

### 📝 Variables de Entorno Necesarias

```bash
# Credenciales de Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-1234567890-123456-1234567890abcdef-123456789
MERCADO_PAGO_PUBLIC_KEY=APP_USR-1234567890-123456-1234567890abcdef
MERCADO_PAGO_WEBHOOK_SECRET=your_webhook_secret_here

# Configuración de entorno
MERCADO_PAGO_ENVIRONMENT=sandbox  # sandbox | production
MERCADO_PAGO_NOTIFICATION_URL=https://api.arcatierra.com/webhook/mercadopago

# URLs de retorno
MERCADO_PAGO_SUCCESS_URL=https://arcatierra.com/payment/success
MERCADO_PAGO_FAILURE_URL=https://arcatierra.com/payment/failure
MERCADO_PAGO_PENDING_URL=https://arcatierra.com/payment/pending
```

### 🔗 Dependencias Adicionales

Agregar al `requirements.txt`:
```txt
mercadopago==2.2.1
cryptography==41.0.7
```

### 🚀 Inicialización del SDK

```python
import mercadopago
import os

# Inicializar SDK
mp = mercadopago.SDK(os.getenv("MERCADO_PAGO_ACCESS_TOKEN"))

# Configurar entorno
if os.getenv("MERCADO_PAGO_ENVIRONMENT") == "sandbox":
    mp.sandbox_mode(True)
```

---

## 🏗️ Estructura de Pagos

### 💰 Modelos de Datos para Pagos

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from decimal import Decimal
from enum import Enum

class PaymentMethod(str, Enum):
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    BANK_TRANSFER = "bank_transfer"
    CASH = "ticket"
    MERCADO_CREDITO = "account_money"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    AUTHORIZED = "authorized"
    IN_PROCESS = "in_process"
    IN_MEDIATION = "in_mediation"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    CHARGED_BACK = "charged_back"

class PaymentItem(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    picture_url: Optional[str] = None
    category_id: str
    quantity: int = Field(ge=1)
    unit_price: Decimal = Field(gt=0)
    currency_id: str = "ARS"

class PayerInfo(BaseModel):
    name: str
    surname: str
    email: str
    phone: Optional[Dict[str, str]] = None
    identification: Optional[Dict[str, str]] = None
    address: Optional[Dict[str, Any]] = None

class PaymentPreference(BaseModel):
    items: List[PaymentItem]
    payer: PayerInfo
    external_reference: str
    notification_url: Optional[str] = None
    back_urls: Optional[Dict[str, str]] = None
    auto_return: Optional[str] = "approved"
    payment_methods: Optional[Dict[str, Any]] = None
    shipments: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

class PaymentNotification(BaseModel):
    action: str
    api_version: str
    data: Dict[str, Any]
    date_created: str
    id: int
    live_mode: bool
    type: str
    user_id: str
```

---

## 🛒 Endpoints de Pagos

### `POST /payments/create-preference`
**Descripción:** Crear preferencia de pago para productos/experiencias

**URL:** `http://localhost:8000/payments/create-preference`

**Cuerpo de la Solicitud:**
```json
{
  "items": [
    {
      "id": "prod_001",
      "title": "Miel Orgánica de Montaña",
      "description": "Miel pura extraída de colmenas en la montaña",
      "picture_url": "https://cdn.arcatierra.com/products/miel_001.jpg",
      "category_id": "organicos",
      "quantity": 2,
      "unit_price": 2500.00,
      "currency_id": "ARS"
    },
    {
      "id": "prod_003",
      "title": "Kit de Hierbas Aromáticas",
      "description": "Selección de hierbas frescas de temporada",
      "picture_url": "https://cdn.arcatierra.com/products/hierbas_002.jpg",
      "category_id": "hierbas",
      "quantity": 1,
      "unit_price": 1800.00,
      "currency_id": "ARS"
    }
  ],
  "payer": {
    "name": "María",
    "surname": "González",
    "email": "maria.gonzalez@email.com",
    "phone": {
      "area_code": "11",
      "number": "12345678"
    },
    "identification": {
      "type": "DNI",
      "number": "12345678"
    },
    "address": {
      "street_name": "Av. Corrientes",
      "street_number": 1234,
      "zip_code": "1043"
    }
  },
  "external_reference": "ARCA_ORDER_20250118_001",
  "metadata": {
    "customer_id": "cust_12345",
    "order_type": "products",
    "source": "webapp"
  }
}
```

**Implementación del Endpoint:**
```python
@app.post("/payments/create-preference")
async def create_payment_preference(preference_data: PaymentPreference):
    try:
        # Construir preferencia para Mercado Pago
        preference = {
            "items": [
                {
                    "id": item.id,
                    "title": item.title,
                    "description": item.description,
                    "picture_url": item.picture_url,
                    "category_id": item.category_id,
                    "quantity": item.quantity,
                    "unit_price": float(item.unit_price),
                    "currency_id": item.currency_id
                }
                for item in preference_data.items
            ],
            "payer": {
                "name": preference_data.payer.name,
                "surname": preference_data.payer.surname,
                "email": preference_data.payer.email,
                "phone": preference_data.payer.phone,
                "identification": preference_data.payer.identification,
                "address": preference_data.payer.address
            },
            "external_reference": preference_data.external_reference,
            "notification_url": os.getenv("MERCADO_PAGO_NOTIFICATION_URL"),
            "back_urls": {
                "success": os.getenv("MERCADO_PAGO_SUCCESS_URL"),
                "failure": os.getenv("MERCADO_PAGO_FAILURE_URL"),
                "pending": os.getenv("MERCADO_PAGO_PENDING_URL")
            },
            "auto_return": "approved",
            "payment_methods": {
                "excluded_payment_methods": [
                    {"id": "master"}  # Ejemplo: excluir Mastercard si es necesario
                ],
                "excluded_payment_types": [
                    {"id": "atm"}  # Ejemplo: excluir cajeros automáticos
                ],
                "installments": 12  # Máximo 12 cuotas
            },
            "metadata": preference_data.metadata
        }
        
        # Crear preferencia en Mercado Pago
        preference_response = mp.preference().create(preference)
        
        if preference_response["status"] == 201:
            preference_id = preference_response["response"]["id"]
            init_point = preference_response["response"]["init_point"]
            
            # Guardar en base de datos
            conn = await get_db_connection()
            await conn.execute("""
                INSERT INTO payment_preferences 
                (preference_id, external_reference, status, items, payer_info, created_at)
                VALUES ($1, $2, $3, $4, $5, $6)
            """, 
            preference_id, 
            preference_data.external_reference,
            "created",
            json.dumps([item.dict() for item in preference_data.items]),
            preference_data.payer.dict(),
            datetime.utcnow())
            await conn.close()
            
            return {
                "success": True,
                "preference_id": preference_id,
                "init_point": init_point,
                "sandbox_init_point": preference_response["response"].get("sandbox_init_point"),
                "external_reference": preference_data.external_reference
            }
        else:
            raise HTTPException(status_code=400, detail="Error creando preferencia de pago")
            
    except Exception as e:
        logger.error(f"Error creando preferencia de pago: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "preference_id": "123456789-12345678-1234-1234-123456789012",
  "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789-12345678-1234-1234-123456789012",
  "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789-12345678-1234-1234-123456789012",
  "external_reference": "ARCA_ORDER_20250118_001"
}
```

---

### `GET /payments/status/{payment_id}`
**Descripción:** Consultar estado de un pago

**URL:** `http://localhost:8000/payments/status/{payment_id}`

**Implementación:**
```python
@app.get("/payments/status/{payment_id}")
async def get_payment_status(payment_id: str):
    try:
        # Consultar pago en Mercado Pago
        payment_response = mp.payment().get(payment_id)
        
        if payment_response["status"] == 200:
            payment_data = payment_response["response"]
            
            # Actualizar en base de datos
            conn = await get_db_connection()
            await conn.execute("""
                UPDATE payments 
                SET status = $1, status_detail = $2, updated_at = $3
                WHERE payment_id = $4
            """, 
            payment_data["status"],
            payment_data["status_detail"],
            datetime.utcnow(),
            payment_id)
            await conn.close()
            
            return {
                "payment_id": payment_id,
                "status": payment_data["status"],
                "status_detail": payment_data["status_detail"],
                "transaction_amount": payment_data["transaction_amount"],
                "external_reference": payment_data["external_reference"],
                "payment_method": payment_data["payment_method_id"],
                "date_created": payment_data["date_created"],
                "date_approved": payment_data.get("date_approved")
            }
        else:
            raise HTTPException(status_code=404, detail="Pago no encontrado")
            
    except Exception as e:
        logger.error(f"Error consultando estado del pago: {e}")
        raise HTTPException(status_code=500, detail="Error consultando pago")
```

---

## 🔔 Webhooks de Mercado Pago

### `POST /webhook/mercadopago`
**Descripción:** Recibir notificaciones de Mercado Pago

**Implementación Completa:**
```python
import hashlib
import hmac

@app.post("/webhook/mercadopago")
async def mercadopago_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_signature: str = Header(alias="X-Signature"),
    x_request_id: str = Header(alias="X-Request-Id")
):
    try:
        # Obtener el cuerpo de la solicitud
        body = await request.body()
        
        # Verificar signature (seguridad)
        webhook_secret = os.getenv("MERCADO_PAGO_WEBHOOK_SECRET")
        if webhook_secret:
            expected_signature = hmac.new(
                webhook_secret.encode(),
                body,
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(x_signature, f"v1={expected_signature}"):
                raise HTTPException(status_code=403, detail="Signature inválida")
        
        # Parsear datos
        notification_data = json.loads(body)
        
        # Procesar según tipo de notificación
        if notification_data.get("type") == "payment":
            background_tasks.add_task(
                process_payment_notification, 
                notification_data["data"]["id"]
            )
        elif notification_data.get("type") == "merchant_order":
            background_tasks.add_task(
                process_merchant_order_notification,
                notification_data["data"]["id"]
            )
        
        # Log para monitoreo
        logger.info(f"Webhook MP recibido: {notification_data}")
        
        return {"status": "received"}
        
    except Exception as e:
        logger.error(f"Error procesando webhook MP: {e}")
        raise HTTPException(status_code=500, detail="Error procesando webhook")

async def process_payment_notification(payment_id: str):
    """Procesar notificación de pago"""
    try:
        # Consultar pago actualizado
        payment_response = mp.payment().get(payment_id)
        
        if payment_response["status"] == 200:
            payment_data = payment_response["response"]
            
            # Actualizar base de datos
            conn = await get_db_connection()
            
            # Insertar o actualizar pago
            await conn.execute("""
                INSERT INTO payments 
                (payment_id, preference_id, external_reference, status, status_detail, 
                 payment_method_id, transaction_amount, currency_id, payer_email,
                 date_created, date_approved, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                ON CONFLICT (payment_id) DO UPDATE SET
                    status = EXCLUDED.status,
                    status_detail = EXCLUDED.status_detail,
                    date_approved = EXCLUDED.date_approved,
                    updated_at = EXCLUDED.updated_at
            """,
            payment_data["id"],
            payment_data.get("additional_info", {}).get("preference_id"),
            payment_data["external_reference"],
            payment_data["status"],
            payment_data["status_detail"],
            payment_data["payment_method_id"],
            payment_data["transaction_amount"],
            payment_data["currency_id"],
            payment_data["payer"]["email"],
            payment_data["date_created"],
            payment_data.get("date_approved"),
            datetime.utcnow(),
            datetime.utcnow())
            
            # Procesar según estado
            if payment_data["status"] == "approved":
                await process_approved_payment(conn, payment_data)
            elif payment_data["status"] == "rejected":
                await process_rejected_payment(conn, payment_data)
            
            await conn.close()
            
            # Enviar a n8n para procesamiento adicional
            webhook_data = {
                "type": "payment_update",
                "data": payment_data,
                "timestamp": datetime.utcnow().isoformat()
            }
            await send_to_n8n("arca-tierra/payment-update", webhook_data)
            
    except Exception as e:
        logger.error(f"Error procesando notificación de pago {payment_id}: {e}")

async def process_approved_payment(conn, payment_data):
    """Procesar pago aprobado"""
    # Actualizar estado del pedido
    await conn.execute("""
        UPDATE orders 
        SET status = 'paid', payment_confirmed_at = $1
        WHERE external_reference = $2
    """, datetime.utcnow(), payment_data["external_reference"])
    
    # Log de pago exitoso
    logger.info(f"Pago aprobado: {payment_data['id']} - {payment_data['external_reference']}")

async def process_rejected_payment(conn, payment_data):
    """Procesar pago rechazado"""
    # Actualizar estado del pedido
    await conn.execute("""
        UPDATE orders 
        SET status = 'payment_failed', payment_failed_at = $1
        WHERE external_reference = $2
    """, datetime.utcnow(), payment_data["external_reference"])
    
    logger.warning(f"Pago rechazado: {payment_data['id']} - {payment_data['status_detail']}")
```

---

## 📊 Manejo de Estados

### 🔄 Estados de Pago y Acciones

| Estado MP | Descripción | Acción en Arca Tierra |
|-----------|-------------|------------------------|
| `pending` | Pago pendiente | Mantener pedido en espera |
| `approved` | Pago aprobado | Confirmar pedido, enviar email |
| `authorized` | Pago autorizado | Procesar como aprobado |
| `in_process` | En procesamiento | Mantener en espera |
| `in_mediation` | En mediación | Notificar al equipo |
| `rejected` | Pago rechazado | Cancelar pedido, notificar |
| `cancelled` | Pago cancelado | Cancelar pedido |
| `refunded` | Pago reembolsado | Procesar reembolso |
| `charged_back` | Contracargo | Alertar al equipo |

### 🎯 Casos Especiales

```python
async def handle_special_payment_cases(payment_data):
    """Manejar casos especiales de pago"""
    
    status = payment_data["status"]
    external_ref = payment_data["external_reference"]
    
    if status == "in_mediation":
        # Notificar al equipo de atención al cliente
        await send_to_n8n("arca-tierra/payment-mediation", {
            "payment_id": payment_data["id"],
            "external_reference": external_ref,
            "amount": payment_data["transaction_amount"],
            "reason": payment_data.get("status_detail")
        })
    
    elif status == "charged_back":
        # Alerta crítica de contracargo
        await send_to_n8n("arca-tierra/chargeback-alert", {
            "payment_id": payment_data["id"],
            "external_reference": external_ref,
            "amount": payment_data["transaction_amount"],
            "payer_email": payment_data["payer"]["email"]
        })
```

---

## 🧪 Testing y Sandbox

### 🔧 Configuración de Testing

```python
# Configuración para ambiente de testing
MERCADO_PAGO_TEST_CARDS = {
    "VISA_APPROVED": {
        "card_number": "4170068810108020",
        "cvv": "123",
        "expiration_month": "12",
        "expiration_year": "2025"
    },
    "MASTERCARD_REJECTED": {
        "card_number": "5031433215406351", 
        "cvv": "123",
        "expiration_month": "12",
        "expiration_year": "2025"
    }
}

# Usuarios de prueba
TEST_USERS = {
    "buyer": {
        "email": "test_user_123@testuser.com",
        "password": "qatest123"
    },
    "seller": {
        "email": "test_user_456@testuser.com", 
        "password": "qatest123"
    }
}
```

### 🧪 Scripts de Testing

```python
import requests
import json

async def test_payment_flow():
    """Test completo del flujo de pago"""
    
    # 1. Crear preferencia
    preference_data = {
        "items": [{
            "id": "test_prod_001",
            "title": "Producto de Prueba",
            "quantity": 1,
            "unit_price": 100.00,
            "currency_id": "ARS"
        }],
        "payer": {
            "name": "Test",
            "surname": "User",
            "email": "test@example.com"
        },
        "external_reference": f"TEST_{datetime.utcnow().timestamp()}"
    }
    
    response = requests.post(
        "http://localhost:8000/payments/create-preference",
        json=preference_data
    )
    
    assert response.status_code == 200
    data = response.json()
    print(f"✅ Preferencia creada: {data['preference_id']}")
    
    # 2. Simular webhook de pago aprobado
    webhook_data = {
        "action": "payment.updated",
        "data": {"id": "123456789"},
        "type": "payment"
    }
    
    webhook_response = requests.post(
        "http://localhost:8000/webhook/mercadopago",
        json=webhook_data,
        headers={"X-Signature": "test_signature"}
    )
    
    assert webhook_response.status_code == 200
    print("✅ Webhook procesado correctamente")
```

---

## 🔒 Seguridad

### 🛡️ Validación de Webhooks

```python
def validate_mercadopago_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Validar firma de webhook de Mercado Pago"""
    
    if not secret:
        logger.warning("MERCADO_PAGO_WEBHOOK_SECRET no configurado")
        return False
    
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    # Formato: v1=signature
    expected_full_signature = f"v1={expected_signature}"
    
    return hmac.compare_digest(signature, expected_full_signature)
```

### 🔐 Rate Limiting

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

@app.post("/payments/create-preference")
@limiter.limit("10/minute")  # Máximo 10 preferencias por minuto por IP
async def create_payment_preference_with_limit(request: Request, ...):
    # Implementación del endpoint
    pass
```

---

## 💼 Casos de Uso Completos

### 🛒 E-commerce: Compra de Productos

```javascript
// Frontend (NextJS)
const handlePurchase = async (cartItems, customerInfo) => {
  try {
    // Crear preferencia de pago
    const response = await fetch('/api/payments/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems.map(item => ({
          id: item.id,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: 'ARS'
        })),
        payer: customerInfo,
        external_reference: `ORDER_${Date.now()}`
      })
    });
    
    const data = await response.json();
    
    // Redirigir a Mercado Pago
    window.location.href = data.init_point;
    
  } catch (error) {
    console.error('Error creando pago:', error);
  }
};
```

### 🎯 Experiencias: Reserva y Pago

```python
@app.post("/experiences/book-and-pay")
async def book_experience_with_payment(
    experience_id: str,
    customer_data: dict,
    participants: int
):
    """Reservar experiencia y generar pago"""
    
    # 1. Verificar disponibilidad
    conn = await get_db_connection()
    experience = await conn.fetchrow(
        "SELECT * FROM experiences WHERE id = $1 AND available = true",
        experience_id
    )
    
    if not experience:
        raise HTTPException(status_code=404, detail="Experiencia no disponible")
    
    # 2. Crear reserva temporal
    booking_id = f"BOOKING_{datetime.utcnow().timestamp()}"
    await conn.execute("""
        INSERT INTO bookings 
        (id, experience_id, customer_email, participants, status, created_at)
        VALUES ($1, $2, $3, $4, 'pending_payment', $5)
    """, booking_id, experience_id, customer_data["email"], participants, datetime.utcnow())
    
    # 3. Crear preferencia de pago
    preference_data = {
        "items": [{
            "id": experience_id,
            "title": experience["title"],
            "description": experience["description"],
            "quantity": participants,
            "unit_price": float(experience["price"]),
            "currency_id": "ARS"
        }],
        "payer": customer_data,
        "external_reference": booking_id
    }
    
    # Crear preferencia en MP
    preference_response = mp.preference().create(preference_data)
    
    await conn.close()
    
    return {
        "booking_id": booking_id,
        "payment_url": preference_response["response"]["init_point"],
        "total_amount": float(experience["price"]) * participants
    }
```

---

*📝 Documentación de Mercado Pago Integration v1.0*
*💳 Última actualización: Enero 2025*
*🔗 Para más información: [Documentación Oficial de Mercado Pago](https://www.mercadopago.com.ar/developers)*
