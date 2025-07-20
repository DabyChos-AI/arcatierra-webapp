# Z-Index Hierarchy - ArcaTierra

## 🎯 Objetivo
Asegurar que los headers siempre estén visibles y nunca se sobrepongan con otros componentes.

## 📊 Jerarquía Oficial

### Nivel 1000+ - Headers y Navegación (MÁXIMA PRIORIDAD)
- `z-[1000-1100]` - Headers principales
  - TransparentHeader: `z-1000`
  - Header normal: `z-1050` 
  - Header dropdowns: `z-1001`

### Nivel 900-999 - Modales y Overlays Críticos
- `z-[900-999]` - Modales principales, overlays de sistema
  - Modales de productos: `z-950`
  - Overlays de autenticación: `z-940`
  - Notificaciones de sistema: `z-930`

### Nivel 800-899 - Elementos Flotantes
- `z-[800-899]` - Tooltips, dropdowns, sugerencias
  - Tooltips: `z-850`
  - Dropdowns de búsqueda: `z-840`
  - Sugerencias: `z-830`

### Nivel 700-799 - Chat y Soporte
- `z-[700-799]` - WhatsApp chat, soporte
  - WhatsApp chat: `z-750`
  - Chat overlays: `z-740`

### Nivel 600-699 - Notificaciones
- `z-[600-699]` - Toast notifications, alertas
  - Toast notifications: `z-650`
  - Alertas de sistema: `z-640`

### Nivel 0-599 - Contenido Normal
- `z-[0-50]` - Contenido de página, elementos decorativos
- `z-[-10 a -1]` - Elementos de fondo

## 🔧 Componentes a Corregir

### Componentes con z-50 (CONFLICTO con headers):
1. `WhatsAppChat.tsx` - Cambiar a z-750
2. `tooltip.tsx` - Cambiar a z-850  
3. `ToastNotification.tsx` - Cambiar a z-650
4. `SearchSuggestions.tsx` - Cambiar a z-840
5. `ProductQuickView.tsx` - Cambiar a z-950
6. `NotificationSystem.tsx` - Cambiar a z-650
7. `CorporateRequestModal.tsx` - Cambiar a z-950
8. Modales de catering - Cambiar a z-950

## ✅ Regla de Oro
**NUNCA usar z-50 o superior en componentes que no sean headers**

## 🚨 Componentes Críticos (NO TOCAR)
- Headers: Mantener z-1000+
- Mobile menu overlays: z-40 (correcto)
