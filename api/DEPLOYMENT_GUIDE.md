# 🚀 Deployment Guide - Arca Tierra API

## 📋 Tabla de Contenido
1. [Arquitectura de Despliegue](#-arquitectura-de-despliegue)
2. [Preparación del Ambiente](#-preparación-del-ambiente)
3. [Despliegue con Docker](#-despliegue-con-docker)
4. [Despliegue en VPS](#-despliegue-en-vps)
5. [Configuración de Nginx](#-configuración-de-nginx)
6. [Monitoreo y Logs](#-monitoreo-y-logs)
7. [Backup y Mantenimiento](#-backup-y-mantenimiento)
8. [Troubleshooting](#-troubleshooting)

---

## 🏗️ Arquitectura de Despliegue

### 🌐 Topología del Sistema

```
Internet
    │
    ▼
┌─────────────────┐
│  Cloudflare/    │ ◄─── SSL/TLS Termination
│  Load Balancer  │      DDoS Protection
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Nginx Proxy    │ ◄─── Reverse Proxy
│  (VPS)          │      Rate Limiting
└─────────────────┘
    │
    ├─────────────────────────────────────┐
    ▼                                     ▼
┌─────────────────┐                 ┌─────────────────┐
│   NextJS App    │                 │  Arca Tierra    │
│  (Frontend)     │                 │     API         │
│  Port: 3000     │                 │  Port: 8000     │
└─────────────────┘                 └─────────────────┘
                                           │
                                           ▼
                                    ┌─────────────────┐
                                    │   PostgreSQL    │
                                    │   + pgvector    │
                                    │  Port: 5432     │
                                    └─────────────────┘
                                           │
                                           ▼
                                    ┌─────────────────┐
                                    │      n8n        │
                                    │ Workflows + DB  │
                                    │  Port: 5678     │
                                    └─────────────────┘
```

---

## 🔧 Preparación del Ambiente

### 📦 Requisitos del Servidor

**Especificaciones Mínimas:**
- **CPU:** 2 vCPUs
- **RAM:** 4GB 
- **Storage:** 50GB SSD
- **OS:** Ubuntu 20.04 LTS o superior
- **Network:** 100Mbps

**Especificaciones Recomendadas (Producción):**
- **CPU:** 4 vCPUs
- **RAM:** 8GB
- **Storage:** 100GB SSD
- **OS:** Ubuntu 22.04 LTS
- **Network:** 1Gbps

### 🔐 Configuración Inicial del Servidor

```bash
# 1. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependencias básicas
sudo apt install -y curl wget git nginx postgresql postgresql-contrib \
    python3 python3-pip python3-venv software-properties-common \
    certbot python3-certbot-nginx ufw fail2ban htop

# 3. Configurar firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# 4. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 5. Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 6. Configurar PostgreSQL con pgvector
sudo -u postgres psql
```

```sql
-- En PostgreSQL
CREATE DATABASE arcatierra_db;
CREATE USER arcauser WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE arcatierra_db TO arcauser;

-- Conectar a la DB
\c arcatierra_db

-- Instalar extensiones
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;

-- Crear esquema básico
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'ARS',
    seasonal BOOLEAN DEFAULT false,
    available BOOLEAN DEFAULT true,
    stock INTEGER DEFAULT 0,
    images JSONB,
    embedding vector(768), -- Para mxbai embeddings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experiences (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration VARCHAR(100),
    max_participants INTEGER,
    price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'ARS',
    available BOOLEAN DEFAULT true,
    location VARCHAR(255),
    includes JSONB,
    schedule JSONB,
    images JSONB,
    embedding vector(768),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas vectoriales
CREATE INDEX ON products USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON experiences USING ivfflat (embedding vector_cosine_ops);

\q
```

---

## 🐳 Despliegue con Docker

### 📄 docker-compose.yml Principal

```yaml
version: '3.8'

networks:
  arca-network:
    driver: bridge

volumes:
  postgres_data:
  n8n_data:
  api_logs:

services:
  # PostgreSQL Database
  postgres:
    image: pgvector/pgvector:pg15
    container_name: arca-postgres
    environment:
      POSTGRES_DB: arcatierra_db
      POSTGRES_USER: arcauser
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=es_AR.UTF-8 --lc-ctype=es_AR.UTF-8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - arca-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U arcauser -d arcatierra_db"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis for n8n and caching
  redis:
    image: redis:7-alpine
    container_name: arca-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    networks:
      - arca-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # n8n Workflow Automation
  n8n:
    image: n8nio/n8n:latest
    container_name: arca-n8n
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8nuser
      - DB_POSTGRESDB_PASSWORD=${N8N_DB_PASSWORD}
      - REDIS_HOST=redis
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}
      - WEBHOOK_URL=https://api.arcatierra.com/webhook/
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - arca-network
    restart: unless-stopped
    depends_on:
      - postgres
      - redis

  # mxbai Embeddings Service
  mxbai:
    image: mixedbread/mxbai-embed-large:latest
    container_name: arca-mxbai
    ports:
      - "8080:8080"
    environment:
      - MODEL_ID=mixedbread-ai/mxbai-embed-large-v1
      - MAX_BATCH_SIZE=32
    networks:
      - arca-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G

  # Arca Tierra API
  api:
    build:
      context: ./api
      dockerfile: Dockerfile.n8n-integration
    container_name: arca-api
    environment:
      - DATABASE_URL=postgresql://arcauser:${POSTGRES_PASSWORD}@postgres:5432/arcatierra_db
      - N8N_WEBHOOK_URL=http://n8n:5678/webhook
      - N8N_API_URL=http://n8n:5678
      - MXBAI_ENDPOINT=http://mxbai:8080
      - REDIS_URL=redis://redis:6379
      - MERCADO_PAGO_ACCESS_TOKEN=${MERCADO_PAGO_ACCESS_TOKEN}
      - MERCADO_PAGO_PUBLIC_KEY=${MERCADO_PAGO_PUBLIC_KEY}
      - MERCADO_PAGO_WEBHOOK_SECRET=${MERCADO_PAGO_WEBHOOK_SECRET}
      - SECRET_KEY=${API_SECRET_KEY}
    ports:
      - "8000:8000"
    volumes:
      - api_logs:/app/logs
    networks:
      - arca-network
    restart: unless-stopped
    depends_on:
      - postgres
      - redis
      - n8n
      - mxbai
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # NextJS Frontend (opcional, si se despliega en el mismo servidor)
  frontend:
    build:
      context: ../
      dockerfile: Dockerfile
    container_name: arca-frontend
    environment:
      - NEXT_PUBLIC_API_URL=https://api.arcatierra.com
      - NEXTAUTH_URL=https://arcatierra.com
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    ports:
      - "3000:3000"
    networks:
      - arca-network
    restart: unless-stopped
    depends_on:
      - api
```

### 🔐 Archivo .env de Producción

```bash
# =================================================================
# CONFIGURACIÓN DE PRODUCCIÓN - ARCA TIERRA
# =================================================================

# Base de datos
POSTGRES_PASSWORD=your_super_secure_postgres_password_here
N8N_DB_PASSWORD=your_n8n_database_password_here

# Redis
REDIS_PASSWORD=your_redis_password_here

# n8n Authentication
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_n8n_admin_password

# API Security
API_SECRET_KEY=your_super_long_secret_key_for_jwt_tokens_minimum_32_chars
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Mercado Pago (PRODUCCIÓN)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-your_production_access_token
MERCADO_PAGO_PUBLIC_KEY=APP_USR-your_production_public_key
MERCADO_PAGO_WEBHOOK_SECRET=your_production_webhook_secret
MERCADO_PAGO_ENVIRONMENT=production

# Email/SMTP
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=noreply@arcatierra.com
SMTP_PASSWORD=your_app_specific_password

# Logging
LOG_LEVEL=INFO
```

### 🚀 Comandos de Despliegue

```bash
# 1. Preparar directorios
mkdir -p /opt/arcatierra/{api,sql,nginx,logs,backups}
cd /opt/arcatierra

# 2. Clonar repositorio
git clone <your-repo-url> .

# 3. Configurar variables de entorno
cp .env.example .env
nano .env  # Configurar variables

# 4. Crear archivo de inicialización SQL
cat > sql/init.sql << 'EOF'
-- Crear usuario y base para n8n
CREATE USER n8nuser WITH ENCRYPTED PASSWORD 'your_n8n_db_password';
CREATE DATABASE n8n OWNER n8nuser;
GRANT ALL PRIVILEGES ON DATABASE n8n TO n8nuser;
EOF

# 5. Construir y levantar servicios
docker-compose up -d --build

# 6. Verificar estado
docker-compose ps
docker-compose logs -f api  # Ver logs de la API
```

---

## 🌐 Configuración de Nginx

### 📄 /etc/nginx/sites-available/arcatierra-api

```nginx
# Configuración Nginx para Arca Tierra API
server {
    listen 80;
    server_name api.arcatierra.com;
    
    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.arcatierra.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.arcatierra.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.arcatierra.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=webhook_limit:10m rate=1000r/m;
    
    # Logging
    access_log /var/log/nginx/api.arcatierra.com.access.log;
    error_log /var/log/nginx/api.arcatierra.com.error.log;

    # Main API
    location / {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # Webhooks (higher rate limit)
    location /webhook/ {
        limit_req zone=webhook_limit burst=50 nodelay;
        
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts más largos para webhooks
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # Health checks (sin rate limit)
    location /health {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        access_log off;
    }

    # Documentación
    location /docs {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Configuración para n8n (opcional)
server {
    listen 443 ssl http2;
    server_name n8n.arcatierra.com;

    ssl_certificate /etc/letsencrypt/live/n8n.arcatierra.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/n8n.arcatierra.com/privkey.pem;

    # Restricción de acceso por IP (recomendado)
    allow 192.168.1.0/24;  # Tu red local
    allow YOUR_OFFICE_IP;   # IP de tu oficina
    deny all;

    location / {
        proxy_pass http://127.0.0.1:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support for n8n
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 🔧 Activar Configuración

```bash
# 1. Crear enlaces simbólicos
sudo ln -s /etc/nginx/sites-available/arcatierra-api /etc/nginx/sites-enabled/

# 2. Probar configuración
sudo nginx -t

# 3. Obtener certificados SSL
sudo certbot --nginx -d api.arcatierra.com -d n8n.arcatierra.com

# 4. Reiniciar Nginx
sudo systemctl restart nginx

# 5. Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 Monitoreo y Logs

### 📝 Configuración de Logs

```bash
# 1. Crear directorio de logs
sudo mkdir -p /opt/arcatierra/logs/{api,nginx,postgres,n8n}

# 2. Configurar logrotate
sudo cat > /etc/logrotate.d/arcatierra << 'EOF'
/opt/arcatierra/logs/*/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        systemctl reload nginx
        docker-compose -f /opt/arcatierra/docker-compose.yml restart api
    endscript
}
EOF
```

### 📈 Script de Monitoreo

```bash
#!/bin/bash
# /opt/arcatierra/scripts/monitor.sh

echo "=== ARCA TIERRA SYSTEM STATUS ==="
echo "Fecha: $(date)"
echo

# Docker containers
echo "--- Docker Containers ---"
docker-compose -f /opt/arcatierra/docker-compose.yml ps

# Disk usage
echo -e "\n--- Disk Usage ---"
df -h | grep -E '/$|/opt'

# Memory usage
echo -e "\n--- Memory Usage ---"
free -h

# API Health
echo -e "\n--- API Health ---"
curl -s http://localhost:8000/health || echo "API no responde"

# Database connections
echo -e "\n--- Database Connections ---"
docker exec arca-postgres psql -U arcauser -d arcatierra_db -c "SELECT count(*) as active_connections FROM pg_stat_activity;"

# Recent errors in logs
echo -e "\n--- Recent API Errors ---"
tail -n 10 /opt/arcatierra/logs/api/error.log | grep ERROR

echo -e "\n=== END STATUS ==="
```

### 🔔 Alertas y Notificaciones

```python
# /opt/arcatierra/scripts/health_check.py
import requests
import smtplib
from email.mime.text import MIMEText
import os

def check_api_health():
    try:
        response = requests.get('http://localhost:8000/health/detailed', timeout=10)
        return response.status_code == 200 and response.json().get('status') == 'healthy'
    except:
        return False

def send_alert(message):
    msg = MIMEText(message)
    msg['Subject'] = 'ALERT: Arca Tierra API'
    msg['From'] = 'alerts@arcatierra.com'
    msg['To'] = 'admin@arcatierra.com'
    
    smtp = smtplib.SMTP('localhost')
    smtp.send_message(msg)
    smtp.quit()

if __name__ == "__main__":
    if not check_api_health():
        send_alert("La API de Arca Tierra no está respondiendo correctamente.")
        exit(1)
    else:
        print("API funcionando correctamente")
```

---

## 💾 Backup y Mantenimiento

### 🗄️ Script de Backup

```bash
#!/bin/bash
# /opt/arcatierra/scripts/backup.sh

BACKUP_DIR="/opt/arcatierra/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio de backup
mkdir -p $BACKUP_DIR/$DATE

# Backup de la base de datos
echo "Backing up database..."
docker exec arca-postgres pg_dump -U arcauser arcatierra_db | gzip > $BACKUP_DIR/$DATE/database.sql.gz

# Backup de volúmenes de Docker
echo "Backing up Docker volumes..."
docker run --rm -v arca_postgres_data:/data -v $BACKUP_DIR/$DATE:/backup alpine tar czf /backup/postgres_data.tar.gz -C /data .
docker run --rm -v arca_n8n_data:/data -v $BACKUP_DIR/$DATE:/backup alpine tar czf /backup/n8n_data.tar.gz -C /data .

# Backup de configuraciones
echo "Backing up configurations..."
cp -r /opt/arcatierra/{docker-compose.yml,.env,nginx} $BACKUP_DIR/$DATE/

# Limpieza de backups antiguos (mantener 7 días)
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR/$DATE"
```

### 🔄 Script de Mantenimiento

```bash
#!/bin/bash
# /opt/arcatierra/scripts/maintenance.sh

echo "=== MAINTENANCE ROUTINE ==="

# Limpieza de logs
echo "Cleaning logs..."
find /opt/arcatierra/logs -name "*.log" -size +100M -exec truncate -s 50M {} \;

# Limpieza de Docker
echo "Cleaning Docker..."
docker system prune -f
docker volume prune -f

# Actualización de imágenes
echo "Updating Docker images..."
cd /opt/arcatierra
docker-compose pull

# Reinicio de servicios si es necesario
if [ "$1" = "--restart" ]; then
    echo "Restarting services..."
    docker-compose down
    docker-compose up -d
fi

# Verificación de salud
echo "Health check..."
sleep 30
curl -f http://localhost:8000/health || echo "WARNING: API health check failed"

echo "Maintenance completed"
```

### 📅 Crontab para Automatización

```bash
# Editar crontab
sudo crontab -e

# Agregar tareas automatizadas
# Backup diario a las 2 AM
0 2 * * * /opt/arcatierra/scripts/backup.sh

# Monitoreo cada 5 minutos
*/5 * * * * /opt/arcatierra/scripts/monitor.sh >> /opt/arcatierra/logs/monitor.log

# Mantenimiento semanal (domingos a las 3 AM)
0 3 * * 0 /opt/arcatierra/scripts/maintenance.sh

# Health check cada minuto
* * * * * python3 /opt/arcatierra/scripts/health_check.py
```

---

## 🚨 Troubleshooting

### 🔍 Problemas Comunes

#### 1. API no responde
```bash
# Verificar estado del contenedor
docker-compose ps api

# Ver logs
docker-compose logs api --tail=50

# Reiniciar API
docker-compose restart api

# Verificar conexión a base de datos
docker exec arca-api python -c "
import asyncpg
import asyncio
async def test():
    try:
        conn = await asyncpg.connect('postgresql://arcauser:password@postgres:5432/arcatierra_db')
        result = await conn.fetchval('SELECT 1')
        print('DB connection OK')
        await conn.close()
    except Exception as e:
        print(f'DB connection failed: {e}')
asyncio.run(test())
"
```

#### 2. Error de conexión a PostgreSQL
```bash
# Verificar estado de PostgreSQL
docker-compose ps postgres

# Verificar logs de PostgreSQL
docker-compose logs postgres

# Conectar manualmente para diagnosticar
docker exec -it arca-postgres psql -U arcauser -d arcatierra_db

# Verificar extensiones
SELECT * FROM pg_extension WHERE extname IN ('vector', 'uuid-ossp');
```

#### 3. Problemas con n8n
```bash
# Reiniciar n8n
docker-compose restart n8n

# Verificar configuración
docker exec arca-n8n cat /home/node/.n8n/config

# Limpiar caché de n8n
docker-compose down n8n
docker volume rm arca_n8n_data
docker-compose up -d n8n
```

#### 4. Certificados SSL expirados
```bash
# Verificar estado de certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew --force-renewal

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 📋 Checklist de Diagnóstico

- [ ] **Contenedores Docker**: `docker-compose ps`
- [ ] **Logs de aplicación**: `docker-compose logs api`
- [ ] **Conectividad de red**: `curl http://localhost:8000/health`
- [ ] **Base de datos**: Conexión y consultas básicas
- [ ] **Espacio en disco**: `df -h`
- [ ] **Memoria disponible**: `free -h`
- [ ] **Certificados SSL**: `sudo certbot certificates`
- [ ] **Nginx status**: `sudo systemctl status nginx`
- [ ] **Firewall**: `sudo ufw status`

### 🆘 Recuperación de Emergencia

```bash
#!/bin/bash
# /opt/arcatierra/scripts/emergency_recovery.sh

echo "=== EMERGENCY RECOVERY ==="

# 1. Detener todos los servicios
docker-compose down

# 2. Restaurar desde backup más reciente
LATEST_BACKUP=$(ls -t /opt/arcatierra/backups | head -1)
echo "Restoring from: $LATEST_BACKUP"

# 3. Restaurar base de datos
gunzip -c /opt/arcatierra/backups/$LATEST_BACKUP/database.sql.gz | \
docker exec -i arca-postgres psql -U arcauser -d arcatierra_db

# 4. Restaurar volúmenes
docker run --rm -v arca_postgres_data:/data -v /opt/arcatierra/backups/$LATEST_BACKUP:/backup alpine \
  tar xzf /backup/postgres_data.tar.gz -C /data

# 5. Reiniciar servicios
docker-compose up -d

# 6. Verificar salud
sleep 60
curl -f http://localhost:8000/health && echo "Recovery successful" || echo "Recovery failed"
```

---

## 📞 Contacto y Soporte

**🔧 Información Técnica:**
- **API Version:** 1.0.0
- **Python Version:** 3.11+
- **FastAPI Version:** 0.104.1+
- **PostgreSQL Version:** 15+

**📧 Contacto de Soporte:**
- **Email técnico:** tech@arcatierra.com
- **Emergencias:** +54 911-XXX-XXXX
- **Documentación:** https://docs.arcatierra.com

---

*🚀 Documentación de Deployment v1.0*
*🕒 Última actualización: Enero 2025*
*📝 Para actualizaciones: git pull && docker-compose up -d --build*
