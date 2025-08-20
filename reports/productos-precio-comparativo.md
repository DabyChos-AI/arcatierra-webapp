# Comparativo: Productos con Precio 0 en productos.ts vs productostienda.csv

**Análisis realizado:** 39 productos con precio = 0 en `productos.ts` comparados con `productostienda.csv`

## ✅ Productos QUE SÍ TIENEN precio en CSV (33 productos)

### Canastas (6)
- **1885** - CANASTA INDIVIDUAL SUSCRIPCIÓN - **$290.00** 
- **1886** - CANASTA MEDIA SUSCRIPCION - **$350.00**
- **1887** - CANASTA COMPLETA SUSCRIPCION - **$510.00**
- **1888** - CANASTA FAMILIAR SUSCRIPCION - **$670.00**
- **1889** - CANASTA BÁSICA INDIVIDUAL SUSCRIPCION - **$447.45**
- **1890** - CANASTA BASICA MEDIA SUSCRIPCION - **$971.85**
- **1891** - CANASTA BASICA FAMILIAR SUSCRIPCION - **$1,413.60**

### Especias y Semillas (10)
- **P-WEB-SEC-006** - CACAHUATE 100 G - **$19.00**
- **P-WEB-SEC-015** - CHIA 100 G - **$30.00**
- **P-WEB-SEC-025** - FRIJOL NEGRO 500 G - **$39.00**
- **P-WEB-SEC-026** - FRIJOL PINTO SALTILLO 500 G - **$40.00**
- **P-WEB-SEC-028** - GARBANZO 500 G - **$38.00**
- **P-WEB-SEC-038** - LENTEJA 500 G - **$39.00**
- **P-WEB-SEC-039** - MACADAMIA 100 G - **$78.00**
- **P-WEB-SEC-055** - NUEZ PECANA 100 G - **$63.00**
- **P-WEB-SEC-058** - PEPITA DE CALABAZA 100 G - **$31.00**
- **P-WEB-SEC-068** - SEMILLA DE CARDAMOMO 50 G - **$98.00**
- **P-WEB-SEC-069** - SEMILLA DE GIRASOL 100 G - **$13.00**
- **P-WEB-SEC-073** - SEMILLA DE AMARANTO - **$40.00**

### Cacao y Café (4)
- **P-WEB-SEC-007** - CACAO EN POLVO 250 G - **$140.00**
- **P-WEB-SEC-008** - CACAO EN POLVO 500 G - **$205.00**
- **P-WEB-SEC-009** - CAFE DE GRANO 500 G - **$130.00**
- **P-WEB-SEC-011** - CAFE MOLIDO 500 G - **$130.00**

### Galletas y Panadería (5)
- **P-WEB-SEC-075** - GALLETAS DE MAIZ Y JENGIBRE 50 G - **$40.00**
- **P-WEB-SEC-076** - GALLETAS DE MAIZ Y NARANJA 50 G - **$40.00**
- **P-WEB-SEC-077** - GALLETAS DE MAIZ, CACAO Y PATLAXTLE 100 G - **$79.00**
- **P-WEB-SEC-084** - GALLETA DE MAIZ Y ANIS 50G - **$40.00**
- **P-WEB-ABA-007** - HOGAZA CAMPESINA - **$130.00**

### Harinas y Granola (4)
- **P-WEB-SEC-029** - GRANOLA ARTESANAL 900 G - **$166.50**
- **P-WEB-SEC-030** - HARINA DE TRIGO INTEGRAL 500 G - **$44.00**
- **P-WEB-SEC-031** - HARINA INTEGRAL DE SORGO 500 G - **$27.00**
- **P-WEB-SEC-032** - HARINA PARA HOT CAKES CON TRIGO Y MACADAMIA 500 G - **$110.00**

### Verduras y Frutas (4)
- **P-WEB-VEG-024** - LIMON AMARILLO 500 G - **No encontrado en CSV**
- **P-WEB-VEG-025** - MANDARINA 500 G - **No encontrado en CSV**
- **P-WEB-VEG-026** - MANGO PETACON 500 G - **No encontrado en CSV**
- **P-WEB-VEG-027** - MANZANA CRIOLLA 500 G - **No encontrado en CSV**
- **P-WEB-VEG-028** - MEZCLA DE ENSALADAS 300 G - **No encontrado en CSV**
- **P-WEB-VEG-006** - BLUEBERRY 250 G - **No encontrado en CSV**

## ❌ Productos SIN precio en CSV (6 productos)

Estos productos NO aparecen en el archivo `productostienda.csv`:

- **P-WEB-VEG-006** - BLUEBERRY 250 G
- **P-WEB-VEG-024** - LIMON AMARILLO 500 G  
- **P-WEB-VEG-025** - MANDARINA 500 G
- **P-WEB-VEG-026** - MANGO PETACON 500 G
- **P-WEB-VEG-027** - MANZANA CRIOLLA 500 G
- **P-WEB-VEG-028** - MEZCLA DE ENSALADAS 300 G

## 📊 Resumen

- **33 productos** tienen precio en CSV y deberían actualizarse en `productos.ts`
- **6 productos** no tienen precio definido en ningún lugar
- **85%** de los productos sin precio SÍ tienen precio disponible en CSV

## 💡 Recomendación

Ejecutar script para sincronizar precios desde `productostienda.csv` hacia `productos.ts` para corregir los 33 productos que ya tienen precio definido.

---
*Comparativo generado automáticamente entre productos.ts y productostienda.csv*
