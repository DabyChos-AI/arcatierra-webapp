#!/bin/bash

# Script de Despliegue para Integración con Infraestructura Existente
# Arca Tierra - Optimizado para entorno Docker existente
# Autor: Manus AI

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PROJECT_NAME="arca-tierra"
COMPOSE_FILE="docker-compose.integration.yml"
ENV_FILE=".env.integration"
DOMAIN="arcatierra.dabychos.com"

# Funciones de utilidad
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar prerrequisitos
check_prerequisites() {
    log_info "Verificando prerrequisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado"
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose no está instalado"
        exit 1
    fi
    
    # Verificar red vps-net
    if ! docker network inspect vps-net &> /dev/null; then
        log_error "La red vps-net no existe. Crear primero la red Docker."
        exit 1
    fi
    
    # Verificar servicios existentes
    log_info "Verificando servicios existentes..."
    
    if ! docker ps | grep -q "arca-postgres"; then
        log_warning "El contenedor arca-postgres no está ejecutándose"
    else
        log_success "arca-postgres está ejecutándose"
    fi
    
    if ! docker ps | grep -q "n8n"; then
        log_warning "El contenedor n8n no está ejecutándose"
    else
        log_success "n8n está ejecutándose"
    fi
    
    if ! docker ps | grep -q "traefik"; then
        log_warning "El contenedor traefik no está ejecutándose"
    else
        log_success "traefik está ejecutándose"
    fi
    
    if ! docker ps | grep -q "mxbai"; then
        log_warning "El contenedor mxbai-embed-large no está ejecutándose"
    else
        log_success "mxbai-embed-large está ejecutándose"
    fi
}

# Verificar conectividad de base de datos
check_database() {
    log_info "Verificando conectividad de base de datos..."
    
    if docker exec arca-postgres psql -U arca_user -d arca_tierra_db -c "SELECT version();" &> /dev/null; then
        log_success "Conexión a base de datos exitosa"
    else
        log_error "No se puede conectar a la base de datos arca_tierra_db"
        log_info "Intentando crear la base de datos..."
        
        if docker exec arca-postgres psql -U arca_user -c "CREATE DATABASE arca_tierra_db;" &> /dev/null; then
            log_success "Base de datos arca_tierra_db creada"
        else
            log_warning "La base de datos ya existe o hay un problema de permisos"
        fi
    fi
}

# Configurar variables de entorno
setup_environment() {
    log_info "Configurando variables de entorno..."
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Archivo $ENV_FILE no encontrado"
        exit 1
    fi
    
    # Copiar archivo de entorno
    cp "$ENV_FILE" .env
    
    # Generar secretos si no existen
    if grep -q "CHANGE_THIS" .env; then
        log_info "Generando secretos seguros..."
        
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        JWT_SECRET=$(openssl rand -base64 32)
        
        sed -i "s/CHANGE_THIS_SUPER_SECURE_SECRET_AT_LEAST_32_CHARS/$NEXTAUTH_SECRET/g" .env
        sed -i "s/CHANGE_THIS_JWT_SECRET_ALSO_32_CHARS_MIN/$JWT_SECRET/g" .env
        
        log_success "Secretos generados y configurados"
    fi
}

# Crear directorios necesarios
create_directories() {
    log_info "Creando directorios necesarios..."
    
    mkdir -p uploads
    mkdir -p logs
    mkdir -p api/logs
    
    # Configurar permisos
    chmod 755 uploads logs
    chmod 755 api/logs
    
    log_success "Directorios creados"
}

# Construir imágenes
build_images() {
    log_info "Construyendo imágenes Docker..."
    
    # Construir imagen de la aplicación principal
    log_info "Construyendo imagen de la aplicación web..."
    docker compose -f "$COMPOSE_FILE" build arcatierra-webapp
    
    # Construir imagen de la API
    log_info "Construyendo imagen de la API..."
    docker compose -f "$COMPOSE_FILE" build arcatierra-api
    
    log_success "Imágenes construidas exitosamente"
}

# Inicializar base de datos
init_database() {
    log_info "Inicializando esquema de base de datos..."
    
    # Crear tablas básicas si no existen
    docker exec arca-postgres psql -U arca_user -d arca_tierra_db << 'EOF'
-- Crear extensión pgvector si no existe
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2),
    seasonal BOOLEAN DEFAULT false,
    available BOOLEAN DEFAULT true,
    image_url VARCHAR(500),
    cooperative_id INTEGER,
    embedding vector(1536),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de experiencias
CREATE TABLE IF NOT EXISTS experiences (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER, -- en minutos
    max_participants INTEGER,
    price DECIMAL(10,2),
    location VARCHAR(255),
    available BOOLEAN DEFAULT true,
    image_url VARCHAR(500),
    embedding vector(1536),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de contactos
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT,
    type VARCHAR(50) DEFAULT 'general',
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cooperativas
CREATE TABLE IF NOT EXISTS cooperatives (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'customer',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsqueda vectorial
CREATE INDEX IF NOT EXISTS products_embedding_idx ON products USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS experiences_embedding_idx ON experiences USING ivfflat (embedding vector_cosine_ops);

-- Índices para búsqueda tradicional
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_available_idx ON products(available);
CREATE INDEX IF NOT EXISTS experiences_available_idx ON experiences(available);
CREATE INDEX IF NOT EXISTS contacts_status_idx ON contacts(status);
CREATE INDEX IF NOT EXISTS contacts_type_idx ON contacts(type);

EOF

    log_success "Esquema de base de datos inicializado"
}

# Desplegar servicios
deploy_services() {
    log_info "Desplegando servicios..."
    
    # Iniciar API primero
    log_info "Iniciando API..."
    docker compose -f "$COMPOSE_FILE" up -d arcatierra-api
    
    # Esperar que la API esté lista
    log_info "Esperando que la API esté lista..."
    sleep 30
    
    # Verificar API
    if curl -f http://localhost:8000/health &> /dev/null; then
        log_success "API está funcionando"
    else
        log_warning "API no responde en puerto 8000"
    fi
    
    # Iniciar aplicación web
    log_info "Iniciando aplicación web..."
    docker compose -f "$COMPOSE_FILE" up -d arcatierra-webapp
    
    # Esperar que la aplicación esté lista
    log_info "Esperando que la aplicación esté lista..."
    sleep 30
    
    log_success "Servicios desplegados"
}

# Verificar despliegue
verify_deployment() {
    log_info "Verificando despliegue..."
    
    # Verificar estado de contenedores
    log_info "Estado de contenedores:"
    docker compose -f "$COMPOSE_FILE" ps
    
    # Verificar conectividad local
    log_info "Verificando conectividad local..."
    
    if curl -f http://localhost:3000 &> /dev/null; then
        log_success "Aplicación web responde localmente"
    else
        log_error "Aplicación web no responde en puerto 3000"
    fi
    
    if curl -f http://localhost:8000/health &> /dev/null; then
        log_success "API responde localmente"
    else
        log_error "API no responde en puerto 8000"
    fi
    
    # Verificar conectividad externa (si traefik está configurado)
    log_info "Verificando conectividad externa..."
    
    if curl -f "https://$DOMAIN" &> /dev/null; then
        log_success "Aplicación accesible externamente en https://$DOMAIN"
    else
        log_warning "Aplicación no accesible externamente. Verificar configuración de Traefik."
    fi
    
    if curl -f "https://$DOMAIN/api/health" &> /dev/null; then
        log_success "API accesible externamente"
    else
        log_warning "API no accesible externamente"
    fi
}

# Mostrar información post-despliegue
show_info() {
    log_info "=== INFORMACIÓN DE DESPLIEGUE ==="
    echo
    log_success "Arca Tierra desplegado exitosamente!"
    echo
    echo "URLs de acceso:"
    echo "  - Aplicación web: https://$DOMAIN"
    echo "  - API: https://$DOMAIN/api"
    echo "  - Documentación API: https://$DOMAIN/api/docs"
    echo "  - Health check: https://$DOMAIN/api/health"
    echo
    echo "Servicios locales:"
    echo "  - Aplicación web: http://localhost:3000"
    echo "  - API: http://localhost:8000"
    echo
    echo "Comandos útiles:"
    echo "  - Ver logs: docker compose -f $COMPOSE_FILE logs -f"
    echo "  - Reiniciar: docker compose -f $COMPOSE_FILE restart"
    echo "  - Detener: docker compose -f $COMPOSE_FILE down"
    echo "  - Estado: docker compose -f $COMPOSE_FILE ps"
    echo
    log_info "Para configurar webhooks en n8n, usar las siguientes URLs:"
    echo "  - Contacto: http://n8n:5678/webhook/arca-tierra/contact"
    echo "  - Newsletter: http://n8n:5678/webhook/arca-tierra/newsletter"
    echo "  - Productos: http://n8n:5678/webhook/arca-tierra/product-inquiry"
    echo "  - Experiencias: http://n8n:5678/webhook/arca-tierra/experience-booking"
}

# Función principal
main() {
    log_info "=== INICIANDO DESPLIEGUE DE ARCA TIERRA ==="
    log_info "Integración con infraestructura Docker existente"
    echo
    
    check_prerequisites
    check_database
    setup_environment
    create_directories
    build_images
    init_database
    deploy_services
    verify_deployment
    show_info
    
    echo
    log_success "=== DESPLIEGUE COMPLETADO ==="
}

# Manejo de argumentos
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "verify")
        verify_deployment
        ;;
    "info")
        show_info
        ;;
    "logs")
        docker compose -f "$COMPOSE_FILE" logs -f
        ;;
    "restart")
        log_info "Reiniciando servicios..."
        docker compose -f "$COMPOSE_FILE" restart
        log_success "Servicios reiniciados"
        ;;
    "stop")
        log_info "Deteniendo servicios..."
        docker compose -f "$COMPOSE_FILE" down
        log_success "Servicios detenidos"
        ;;
    "status")
        docker compose -f "$COMPOSE_FILE" ps
        ;;
    *)
        echo "Uso: $0 {deploy|verify|info|logs|restart|stop|status}"
        echo
        echo "Comandos:"
        echo "  deploy  - Despliegue completo (por defecto)"
        echo "  verify  - Verificar estado del despliegue"
        echo "  info    - Mostrar información de acceso"
        echo "  logs    - Mostrar logs en tiempo real"
        echo "  restart - Reiniciar servicios"
        echo "  stop    - Detener servicios"
        echo "  status  - Mostrar estado de contenedores"
        exit 1
        ;;
esac

