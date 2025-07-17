#!/bin/bash

# Script de Backup Automatizado - Arca Tierra
# Autor: Manus AI
# Versión: 1.0

set -e

# Configuración
BACKUP_DIR="/home/arcatierra/backups"
APP_DIR="/home/arcatierra/app"
COMPOSE_FILE="docker-compose.production.yml"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d-%H%M%S)

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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

# Crear directorio de backup
mkdir -p "$BACKUP_DIR/database"
mkdir -p "$BACKUP_DIR/files"
mkdir -p "$BACKUP_DIR/config"

# Backup de base de datos
backup_database() {
    log "Creando backup de base de datos..."
    
    DB_BACKUP_FILE="$BACKUP_DIR/database/arcatierra_db_$DATE.sql"
    
    if docker compose -f "$APP_DIR/$COMPOSE_FILE" exec -T arca-postgres pg_dump -U arcatierra arcatierra_db > "$DB_BACKUP_FILE"; then
        log "✓ Backup de base de datos creado: $DB_BACKUP_FILE"
        
        # Comprimir backup
        gzip "$DB_BACKUP_FILE"
        log "✓ Backup comprimido: ${DB_BACKUP_FILE}.gz"
    else
        error "Error al crear backup de base de datos"
    fi
}

# Backup de archivos subidos
backup_files() {
    log "Creando backup de archivos..."
    
    FILES_BACKUP="$BACKUP_DIR/files/uploads_$DATE.tar.gz"
    
    if [[ -d "$APP_DIR/uploads" ]]; then
        tar -czf "$FILES_BACKUP" -C "$APP_DIR" uploads/
        log "✓ Backup de archivos creado: $FILES_BACKUP"
    else
        warn "Directorio de uploads no encontrado"
    fi
}

# Backup de configuración
backup_config() {
    log "Creando backup de configuración..."
    
    CONFIG_BACKUP="$BACKUP_DIR/config/config_$DATE.tar.gz"
    
    tar -czf "$CONFIG_BACKUP" -C "$APP_DIR" \
        .env.production \
        docker-compose.production.yml \
        nginx/ \
        scripts/ \
        2>/dev/null || true
    
    log "✓ Backup de configuración creado: $CONFIG_BACKUP"
}

# Limpiar backups antiguos
cleanup_old_backups() {
    log "Limpiando backups antiguos (más de $RETENTION_DAYS días)..."
    
    find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete
    
    log "✓ Backups antiguos eliminados"
}

# Verificar integridad de backups
verify_backups() {
    log "Verificando integridad de backups..."
    
    # Verificar backup de base de datos
    if [[ -f "$BACKUP_DIR/database/arcatierra_db_$DATE.sql.gz" ]]; then
        if gzip -t "$BACKUP_DIR/database/arcatierra_db_$DATE.sql.gz"; then
            log "✓ Backup de base de datos íntegro"
        else
            error "Backup de base de datos corrupto"
        fi
    fi
    
    # Verificar backup de archivos
    if [[ -f "$BACKUP_DIR/files/uploads_$DATE.tar.gz" ]]; then
        if tar -tzf "$BACKUP_DIR/files/uploads_$DATE.tar.gz" > /dev/null; then
            log "✓ Backup de archivos íntegro"
        else
            error "Backup de archivos corrupto"
        fi
    fi
    
    # Verificar backup de configuración
    if [[ -f "$BACKUP_DIR/config/config_$DATE.tar.gz" ]]; then
        if tar -tzf "$BACKUP_DIR/config/config_$DATE.tar.gz" > /dev/null; then
            log "✓ Backup de configuración íntegro"
        else
            error "Backup de configuración corrupto"
        fi
    fi
}

# Función principal
main() {
    log "Iniciando proceso de backup..."
    
    backup_database
    backup_files
    backup_config
    verify_backups
    cleanup_old_backups
    
    log "✅ Proceso de backup completado exitosamente"
    
    # Mostrar resumen
    echo
    echo "📊 Resumen del backup:"
    echo "   Fecha: $(date)"
    echo "   Base de datos: $(ls -lh $BACKUP_DIR/database/arcatierra_db_$DATE.sql.gz 2>/dev/null | awk '{print $5}' || echo 'N/A')"
    echo "   Archivos: $(ls -lh $BACKUP_DIR/files/uploads_$DATE.tar.gz 2>/dev/null | awk '{print $5}' || echo 'N/A')"
    echo "   Configuración: $(ls -lh $BACKUP_DIR/config/config_$DATE.tar.gz 2>/dev/null | awk '{print $5}' || echo 'N/A')"
    echo "   Total de backups: $(find $BACKUP_DIR -name "*.gz" | wc -l)"
    echo
}

# Función de restauración
restore() {
    local backup_date="$1"
    
    if [[ -z "$backup_date" ]]; then
        echo "Uso: $0 restore YYYYMMDD-HHMMSS"
        echo
        echo "Backups disponibles:"
        find "$BACKUP_DIR" -name "*.gz" | grep -o '[0-9]\{8\}-[0-9]\{6\}' | sort -u
        exit 1
    fi
    
    log "Iniciando restauración del backup $backup_date..."
    
    # Confirmar restauración
    read -p "¿Estás seguro de que quieres restaurar el backup $backup_date? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Restauración cancelada"
        exit 0
    fi
    
    # Crear backup actual antes de restaurar
    log "Creando backup de seguridad antes de restaurar..."
    main
    
    # Restaurar base de datos
    if [[ -f "$BACKUP_DIR/database/arcatierra_db_$backup_date.sql.gz" ]]; then
        log "Restaurando base de datos..."
        
        # Detener aplicación
        docker compose -f "$APP_DIR/$COMPOSE_FILE" stop arcatierra-app
        
        # Restaurar base de datos
        gunzip -c "$BACKUP_DIR/database/arcatierra_db_$backup_date.sql.gz" | \
        docker compose -f "$APP_DIR/$COMPOSE_FILE" exec -T arca-postgres psql -U arcatierra -d arcatierra_db
        
        log "✓ Base de datos restaurada"
    else
        warn "Backup de base de datos no encontrado para $backup_date"
    fi
    
    # Restaurar archivos
    if [[ -f "$BACKUP_DIR/files/uploads_$backup_date.tar.gz" ]]; then
        log "Restaurando archivos..."
        
        # Backup de archivos actuales
        if [[ -d "$APP_DIR/uploads" ]]; then
            mv "$APP_DIR/uploads" "$APP_DIR/uploads.backup.$(date +%s)"
        fi
        
        # Restaurar archivos
        tar -xzf "$BACKUP_DIR/files/uploads_$backup_date.tar.gz" -C "$APP_DIR"
        
        log "✓ Archivos restaurados"
    else
        warn "Backup de archivos no encontrado para $backup_date"
    fi
    
    # Reiniciar aplicación
    log "Reiniciando aplicación..."
    docker compose -f "$APP_DIR/$COMPOSE_FILE" up -d
    
    log "✅ Restauración completada"
}

# Manejo de argumentos
case "${1:-backup}" in
    "backup")
        main
        ;;
    "restore")
        restore "$2"
        ;;
    "list")
        echo "Backups disponibles:"
        find "$BACKUP_DIR" -name "*.gz" | grep -o '[0-9]\{8\}-[0-9]\{6\}' | sort -u
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    *)
        echo "Uso: $0 {backup|restore|list|cleanup}"
        echo
        echo "Comandos disponibles:"
        echo "  backup           - Crear backup completo (por defecto)"
        echo "  restore <fecha>  - Restaurar backup específico"
        echo "  list             - Listar backups disponibles"
        echo "  cleanup          - Limpiar backups antiguos"
        exit 1
        ;;
esac

