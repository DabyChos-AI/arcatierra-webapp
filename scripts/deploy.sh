#!/bin/bash

# Script de Despliegue Automatizado - Arca Tierra
# Autor: Manus AI
# Versión: 1.0

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Variables de configuración
APP_NAME="arcatierra"
APP_DIR="/home/arcatierra/app"
BACKUP_DIR="/home/arcatierra/backups"
LOG_DIR="/home/arcatierra/logs"
COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"

# Función para verificar prerrequisitos
check_prerequisites() {
    log "Verificando prerrequisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado"
    fi
    
    # Verificar Docker Compose
    if ! docker compose version &> /dev/null; then
        error "Docker Compose no está instalado"
    fi
    
    # Verificar permisos
    if ! docker ps &> /dev/null; then
        error "Usuario actual no tiene permisos para Docker"
    fi
    
    # Verificar archivos necesarios
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        error "Archivo $COMPOSE_FILE no encontrado"
    fi
    
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Archivo $ENV_FILE no encontrado"
    fi
    
    log "✓ Prerrequisitos verificados"
}

# Función para crear directorios necesarios
create_directories() {
    log "Creando directorios necesarios..."
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$LOG_DIR"
    mkdir -p "$APP_DIR/database/init"
    mkdir -p "$APP_DIR/database/backups"
    mkdir -p "$APP_DIR/nginx/sites"
    mkdir -p "$APP_DIR/ssl"
    mkdir -p "$APP_DIR/uploads"
    mkdir -p "$APP_DIR/scripts"
    
    log "✓ Directorios creados"
}

# Función para configurar variables de entorno
setup_environment() {
    log "Configurando variables de entorno..."
    
    # Verificar si las contraseñas por defecto han sido cambiadas
    if grep -q "CHANGE_THIS" "$ENV_FILE"; then
        warn "Se encontraron contraseñas por defecto en $ENV_FILE"
        warn "Por favor, actualiza todas las contraseñas antes de continuar"
        
        read -p "¿Deseas continuar de todos modos? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Despliegue cancelado por el usuario"
        fi
    fi
    
    # Generar secretos si no existen
    if ! grep -q "NEXTAUTH_SECRET=" "$ENV_FILE" || grep -q "CHANGE_THIS_SUPER_SECURE_SECRET" "$ENV_FILE"; then
        log "Generando NEXTAUTH_SECRET..."
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        sed -i "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=$NEXTAUTH_SECRET/" "$ENV_FILE"
    fi
    
    if ! grep -q "JWT_SECRET=" "$ENV_FILE" || grep -q "CHANGE_THIS_JWT_SECRET" "$ENV_FILE"; then
        log "Generando JWT_SECRET..."
        JWT_SECRET=$(openssl rand -base64 32)
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" "$ENV_FILE"
    fi
    
    log "✓ Variables de entorno configuradas"
}

# Función para configurar la red Docker
setup_docker_network() {
    log "Configurando red Docker..."
    
    if ! docker network ls | grep -q "vps-net"; then
        log "Creando red vps-net..."
        docker network create vps-net --driver bridge --subnet=172.20.0.0/16
    else
        log "Red vps-net ya existe"
    fi
    
    log "✓ Red Docker configurada"
}

# Función para construir imágenes
build_images() {
    log "Construyendo imágenes Docker..."
    
    # Limpiar imágenes antiguas
    docker system prune -f
    
    # Construir imagen de la aplicación
    docker compose -f "$COMPOSE_FILE" build --no-cache arcatierra-app
    
    log "✓ Imágenes construidas"
}

# Función para inicializar base de datos
init_database() {
    log "Inicializando base de datos..."
    
    # Crear archivo de inicialización si no existe
    if [[ ! -f "database/init/01-init.sql" ]]; then
        cat > database/init/01-init.sql << 'EOF'
-- Inicialización de base de datos Arca Tierra
-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de usuarios (para futuras funcionalidades)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    category VARCHAR(100),
    in_stock BOOLEAN DEFAULT true,
    seasonal BOOLEAN DEFAULT false,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de experiencias
CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    duration INTEGER, -- en minutos
    max_participants INTEGER,
    location VARCHAR(255),
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de contactos
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT,
    type VARCHAR(50) DEFAULT 'general',
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_seasonal ON products(seasonal);
CREATE INDEX IF NOT EXISTS idx_experiences_available ON experiences(available);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Datos de ejemplo (opcional)
INSERT INTO products (name, description, price, category, seasonal) VALUES
('Canasta Familiar', 'Canasta con productos de temporada para familia de 4 personas', 450.00, 'canastas', true),
('Canasta Individual', 'Canasta personal con productos frescos de temporada', 180.00, 'canastas', true),
('Experiencia Chinampas', 'Tour guiado por las chinampas de Xochimilco', 350.00, 'experiencias', false)
ON CONFLICT DO NOTHING;

EOF
    fi
    
    log "✓ Base de datos inicializada"
}

# Función para crear backup antes del despliegue
create_backup() {
    log "Creando backup antes del despliegue..."
    
    BACKUP_FILE="$BACKUP_DIR/pre-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # Backup de la aplicación actual si existe
    if docker ps | grep -q "arcatierra-app"; then
        log "Creando backup de contenedores..."
        docker compose -f "$COMPOSE_FILE" exec -T arca-postgres pg_dump -U arcatierra arcatierra_db > "$BACKUP_DIR/db-pre-deploy-$(date +%Y%m%d-%H%M%S).sql"
    fi
    
    # Backup de archivos de configuración
    tar -czf "$BACKUP_FILE" -C "$APP_DIR" . 2>/dev/null || true
    
    log "✓ Backup creado: $BACKUP_FILE"
}

# Función para desplegar la aplicación
deploy_application() {
    log "Desplegando aplicación..."
    
    # Detener servicios existentes
    if docker compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        log "Deteniendo servicios existentes..."
        docker compose -f "$COMPOSE_FILE" down
    fi
    
    # Iniciar servicios
    log "Iniciando servicios..."
    docker compose -f "$COMPOSE_FILE" up -d
    
    # Esperar a que los servicios estén listos
    log "Esperando a que los servicios estén listos..."
    sleep 30
    
    # Verificar estado de los servicios
    if ! docker compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        error "Error al iniciar los servicios"
    fi
    
    log "✓ Aplicación desplegada"
}

# Función para verificar el despliegue
verify_deployment() {
    log "Verificando despliegue..."
    
    # Verificar que los contenedores estén corriendo
    if ! docker compose -f "$COMPOSE_FILE" ps | grep -q "arcatierra-app.*Up"; then
        error "Contenedor de aplicación no está corriendo"
    fi
    
    if ! docker compose -f "$COMPOSE_FILE" ps | grep -q "arca-postgres.*Up"; then
        error "Contenedor de base de datos no está corriendo"
    fi
    
    # Verificar conectividad de la aplicación
    sleep 10
    if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
        warn "La aplicación no responde en el puerto 3000"
        warn "Verificando logs..."
        docker compose -f "$COMPOSE_FILE" logs arcatierra-app | tail -20
    else
        log "✓ Aplicación respondiendo correctamente"
    fi
    
    # Verificar base de datos
    if docker compose -f "$COMPOSE_FILE" exec -T arca-postgres pg_isready -U arcatierra > /dev/null 2>&1; then
        log "✓ Base de datos funcionando correctamente"
    else
        warn "Base de datos no responde correctamente"
    fi
    
    log "✓ Verificación completada"
}

# Función para mostrar información post-despliegue
show_deployment_info() {
    log "Información del despliegue:"
    echo
    echo -e "${BLUE}=== ARCA TIERRA - DESPLIEGUE COMPLETADO ===${NC}"
    echo
    echo "🌐 Aplicación: http://localhost:3000"
    echo "🗄️  Base de datos: localhost:5432"
    echo "🔧 Adminer: http://localhost:8080"
    echo
    echo "📁 Directorios importantes:"
    echo "   - Aplicación: $APP_DIR"
    echo "   - Logs: $LOG_DIR"
    echo "   - Backups: $BACKUP_DIR"
    echo
    echo "🐳 Comandos útiles:"
    echo "   - Ver logs: docker compose -f $COMPOSE_FILE logs -f"
    echo "   - Reiniciar: docker compose -f $COMPOSE_FILE restart"
    echo "   - Detener: docker compose -f $COMPOSE_FILE down"
    echo "   - Estado: docker compose -f $COMPOSE_FILE ps"
    echo
    echo -e "${GREEN}✅ Despliegue completado exitosamente${NC}"
    echo
}

# Función principal
main() {
    log "Iniciando despliegue de Arca Tierra..."
    
    check_prerequisites
    create_directories
    setup_environment
    setup_docker_network
    init_database
    create_backup
    build_images
    deploy_application
    verify_deployment
    show_deployment_info
    
    log "🎉 Despliegue completado exitosamente!"
}

# Manejo de argumentos
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "backup")
        create_backup
        ;;
    "verify")
        verify_deployment
        ;;
    "logs")
        docker compose -f "$COMPOSE_FILE" logs -f "${2:-}"
        ;;
    "restart")
        docker compose -f "$COMPOSE_FILE" restart "${2:-}"
        ;;
    "stop")
        docker compose -f "$COMPOSE_FILE" down
        ;;
    "status")
        docker compose -f "$COMPOSE_FILE" ps
        ;;
    *)
        echo "Uso: $0 {deploy|backup|verify|logs|restart|stop|status}"
        echo
        echo "Comandos disponibles:"
        echo "  deploy  - Desplegar la aplicación (por defecto)"
        echo "  backup  - Crear backup de la aplicación actual"
        echo "  verify  - Verificar el estado del despliegue"
        echo "  logs    - Mostrar logs de los servicios"
        echo "  restart - Reiniciar servicios"
        echo "  stop    - Detener todos los servicios"
        echo "  status  - Mostrar estado de los servicios"
        exit 1
        ;;
esac

