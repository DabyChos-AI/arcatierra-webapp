"""
API de Arca Tierra - Integración con n8n y servicios existentes
Autor: Manus AI
Versión: 1.0
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import asyncpg
import os
import logging
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, EmailStr
from datetime import datetime
import json

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuración de la aplicación
app = FastAPI(
    title="Arca Tierra API",
    description="API para integración con n8n y servicios de Arca Tierra",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://arcatierra.dabychos.com",
        "https://arcatierra.com",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variables de entorno
DATABASE_URL = os.getenv("DATABASE_URL")
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")
N8N_API_URL = os.getenv("N8N_API_URL")
MXBAI_ENDPOINT = os.getenv("MXBAI_ENDPOINT")

# Modelos Pydantic
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    type: str = "general"  # general, experiencia, tienda, catering

class NewsletterSubscription(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class ProductInquiry(BaseModel):
    product_id: Optional[str] = None
    product_name: str
    customer_email: EmailStr
    customer_name: str
    quantity: Optional[int] = 1
    message: Optional[str] = None

class ExperienceBooking(BaseModel):
    experience_id: str
    customer_name: str
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    participants: int
    preferred_date: Optional[str] = None
    message: Optional[str] = None

class SearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 10
    category: Optional[str] = None

# Funciones de utilidad
async def get_db_connection():
    """Obtener conexión a la base de datos"""
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        return conn
    except Exception as e:
        logger.error(f"Error conectando a la base de datos: {e}")
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")

async def send_to_n8n(webhook_path: str, data: Dict[str, Any]):
    """Enviar datos a n8n webhook"""
    try:
        webhook_url = f"{N8N_WEBHOOK_URL}/{webhook_path}"
        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json=data)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Error enviando a n8n: {e}")
        raise HTTPException(status_code=500, detail="Error procesando solicitud")

# Endpoints de salud
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "arca-tierra-api",
        "version": "1.0.0"
    }

@app.get("/health/detailed")
async def detailed_health_check():
    """Health check detallado con verificación de servicios"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {}
    }
    
    # Verificar base de datos
    try:
        conn = await get_db_connection()
        await conn.execute("SELECT 1")
        await conn.close()
        health_status["services"]["database"] = "healthy"
    except Exception as e:
        health_status["services"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    # Verificar n8n
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{N8N_API_URL}/health", timeout=5.0)
            if response.status_code == 200:
                health_status["services"]["n8n"] = "healthy"
            else:
                health_status["services"]["n8n"] = f"unhealthy: status {response.status_code}"
                health_status["status"] = "degraded"
    except Exception as e:
        health_status["services"]["n8n"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    return health_status

# Endpoints de formularios
@app.post("/contact")
async def submit_contact_form(contact: ContactForm, background_tasks: BackgroundTasks):
    """Procesar formulario de contacto"""
    try:
        # Guardar en base de datos
        conn = await get_db_connection()
        await conn.execute("""
            INSERT INTO contacts (name, email, phone, message, type, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """, contact.name, contact.email, contact.phone, contact.message, 
            contact.type, "pending", datetime.utcnow())
        await conn.close()
        
        # Enviar a n8n para procesamiento
        webhook_data = {
            "type": "contact_form",
            "data": contact.dict(),
            "timestamp": datetime.utcnow().isoformat(),
            "source": "arca_tierra_webapp"
        }
        
        background_tasks.add_task(send_to_n8n, "arca-tierra/contact", webhook_data)
        
        return {
            "success": True,
            "message": "Formulario enviado correctamente",
            "id": "generated_id"
        }
        
    except Exception as e:
        logger.error(f"Error procesando formulario de contacto: {e}")
        raise HTTPException(status_code=500, detail="Error procesando formulario")

@app.post("/newsletter")
async def subscribe_newsletter(subscription: NewsletterSubscription, background_tasks: BackgroundTasks):
    """Suscripción al newsletter"""
    try:
        # Enviar a n8n para procesamiento
        webhook_data = {
            "type": "newsletter_subscription",
            "data": subscription.dict(),
            "timestamp": datetime.utcnow().isoformat(),
            "source": "arca_tierra_webapp"
        }
        
        background_tasks.add_task(send_to_n8n, "arca-tierra/newsletter", webhook_data)
        
        return {
            "success": True,
            "message": "Suscripción exitosa al newsletter"
        }
        
    except Exception as e:
        logger.error(f"Error en suscripción al newsletter: {e}")
        raise HTTPException(status_code=500, detail="Error en suscripción")

@app.post("/products/inquiry")
async def product_inquiry(inquiry: ProductInquiry, background_tasks: BackgroundTasks):
    """Consulta sobre productos"""
    try:
        # Enviar a n8n para procesamiento
        webhook_data = {
            "type": "product_inquiry",
            "data": inquiry.dict(),
            "timestamp": datetime.utcnow().isoformat(),
            "source": "arca_tierra_webapp"
        }
        
        background_tasks.add_task(send_to_n8n, "arca-tierra/product-inquiry", webhook_data)
        
        return {
            "success": True,
            "message": "Consulta enviada correctamente"
        }
        
    except Exception as e:
        logger.error(f"Error en consulta de producto: {e}")
        raise HTTPException(status_code=500, detail="Error procesando consulta")

@app.post("/experiences/booking")
async def book_experience(booking: ExperienceBooking, background_tasks: BackgroundTasks):
    """Reserva de experiencias"""
    try:
        # Enviar a n8n para procesamiento
        webhook_data = {
            "type": "experience_booking",
            "data": booking.dict(),
            "timestamp": datetime.utcnow().isoformat(),
            "source": "arca_tierra_webapp"
        }
        
        background_tasks.add_task(send_to_n8n, "arca-tierra/experience-booking", webhook_data)
        
        return {
            "success": True,
            "message": "Reserva enviada correctamente",
            "booking_id": "generated_booking_id"
        }
        
    except Exception as e:
        logger.error(f"Error en reserva de experiencia: {e}")
        raise HTTPException(status_code=500, detail="Error procesando reserva")

# Endpoints de datos
@app.get("/products")
async def get_products(category: Optional[str] = None, seasonal: Optional[bool] = None):
    """Obtener productos de la base de datos"""
    try:
        conn = await get_db_connection()
        
        query = "SELECT * FROM products WHERE 1=1"
        params = []
        
        if category:
            query += " AND category = $" + str(len(params) + 1)
            params.append(category)
            
        if seasonal is not None:
            query += " AND seasonal = $" + str(len(params) + 1)
            params.append(seasonal)
            
        query += " ORDER BY created_at DESC"
        
        rows = await conn.fetch(query, *params)
        await conn.close()
        
        products = [dict(row) for row in rows]
        return {"products": products}
        
    except Exception as e:
        logger.error(f"Error obteniendo productos: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo productos")

@app.get("/experiences")
async def get_experiences(available: Optional[bool] = True):
    """Obtener experiencias disponibles"""
    try:
        conn = await get_db_connection()
        
        query = "SELECT * FROM experiences"
        params = []
        
        if available is not None:
            query += " WHERE available = $1"
            params.append(available)
            
        query += " ORDER BY created_at DESC"
        
        rows = await conn.fetch(query, *params)
        await conn.close()
        
        experiences = [dict(row) for row in rows]
        return {"experiences": experiences}
        
    except Exception as e:
        logger.error(f"Error obteniendo experiencias: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo experiencias")

# Endpoint de búsqueda con embeddings
@app.post("/search")
async def search_content(search: SearchQuery):
    """Búsqueda semántica usando embeddings (mxbai + pgvector)"""
    try:
        # Generar embedding de la consulta
        async with httpx.AsyncClient() as client:
            embedding_response = await client.post(
                f"{MXBAI_ENDPOINT}/embed",
                json={"text": search.query}
            )
            embedding = embedding_response.json()["embedding"]
        
        # Buscar en la base de datos usando pgvector
        conn = await get_db_connection()
        
        # Búsqueda en productos
        product_query = """
            SELECT *, embedding <-> $1::vector as distance
            FROM products 
            WHERE embedding IS NOT NULL
            ORDER BY distance
            LIMIT $2
        """
        
        product_results = await conn.fetch(product_query, embedding, search.limit)
        
        # Búsqueda en experiencias
        experience_query = """
            SELECT *, embedding <-> $1::vector as distance
            FROM experiences 
            WHERE embedding IS NOT NULL
            ORDER BY distance
            LIMIT $2
        """
        
        experience_results = await conn.fetch(experience_query, embedding, search.limit)
        
        await conn.close()
        
        return {
            "query": search.query,
            "results": {
                "products": [dict(row) for row in product_results],
                "experiences": [dict(row) for row in experience_results]
            }
        }
        
    except Exception as e:
        logger.error(f"Error en búsqueda: {e}")
        raise HTTPException(status_code=500, detail="Error en búsqueda")

# Endpoint para webhooks de n8n (recibir datos)
@app.post("/webhook/n8n")
async def receive_n8n_webhook(data: Dict[str, Any]):
    """Recibir webhooks de n8n"""
    try:
        logger.info(f"Webhook recibido de n8n: {data}")
        
        # Procesar según el tipo de webhook
        webhook_type = data.get("type")
        
        if webhook_type == "order_confirmation":
            # Procesar confirmación de pedido
            pass
        elif webhook_type == "experience_confirmation":
            # Procesar confirmación de experiencia
            pass
        elif webhook_type == "newsletter_welcome":
            # Procesar bienvenida al newsletter
            pass
        
        return {"success": True, "message": "Webhook procesado"}
        
    except Exception as e:
        logger.error(f"Error procesando webhook de n8n: {e}")
        raise HTTPException(status_code=500, detail="Error procesando webhook")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

