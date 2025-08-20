# 🌱 PLANTILLA PARA NUEVA RECETA - ARCA TIERRA

## 📋 INFORMACIÓN BÁSICA

**ID:** [Próximo número disponible - revisar `src/data/recetas.ts`]

**Título de la receta:**
```
[Nombre de la receta - ejemplo: "Brócoli Completo - Flores y Tallos"]
```

**Descripción corta (SEO):**
```
[Descripción de 120-160 caracteres para SEO y Schema Markup]
[Ejemplo: "Aprovecha cada parte del brócoli en esta receta sustentable que combina flores tiernas y tallos crujientes."]
```

**Imagen principal:**
```
[URL de imagen - preferiblemente de Unsplash relacionada con la receta]
[Ejemplo: "https://images.unsplash.com/photo-1234567890/broccoli?w=400&h=300&fit=crop"]
```

## 👨‍🍳 AUTOR DE LA RECETA

**Nombre del chef/autor:**
```
[Nombre completo del chef o autor de la receta]
[Ejemplo: "Chef María González" | "Ana Rodríguez" | "Equipo Arca Tierra"]
```

**Bio/Descripción corta del autor:**
```
[Breve descripción del chef - máximo 100 caracteres]
[Ejemplo: "Chef especializada en cocina sustentable y aprovechamiento integral"]
```

**Imagen del autor (opcional):**
```
[URL de imagen del chef - opcional]
[Ejemplo: "https://images.unsplash.com/photo-1234567890/chef?w=100&h=100&fit=crop&crop=face"]
```

**Especialidad/Restaurante (opcional):**
```
[Restaurante, especialidad culinaria o afiliación del chef]
[Ejemplo: "Restaurante Baldío" | "Especialista en fermentación" | "Chef de Arca Tierra"]
```

## ⏱️ TIEMPOS Y DIFICULTAD

**Tiempo de cocción (minutos):**
```
[Número entero - ejemplo: 35]
```

**Dificultad:**
```
[Seleccionar una: "Fácil" | "Medio" | "Avanzado"]
```

**Temporada:**
```
[Seleccionar una: "Primavera" | "Verano" | "Otoño" | "Invierno" | "Todo el año"]
```

**Porciones:**
```
[Número de porciones que rinde la receta - ejemplo: 4]
```

## 🏷️ ETIQUETAS Y CATEGORIZACIÓN

**Tags (máximo 4):**
```
[Ejemplo: ["Sin desperdicio", "Crucíferas", "Nutritivo", "Fácil preparación"]]
```

**Categoría principal:**
```
[Ejemplo: "Verduras", "Ensaladas", "Fermentados", "Sopas", etc.]
```

## 🥬 INGREDIENTES

**Lista de ingredientes:**
```
[
  "Cantidad + Producto específico de Arca Tierra + descripción",
  "300g de brócoli fresco con tallos",
  "1 cebolla blanca mediana",
  "2 dientes de ajo orgánico",
  "2 cucharadas de aceite de oliva extra virgen",
  "Sal marina al gusto",
  "1/4 taza de agua filtrada"
]
```

## 👨‍🍳 PASOS DE PREPARACIÓN

### Paso 1
**Título:** [Nombre descriptivo del paso]
**Descripción:** [Instrucciones detalladas paso a paso]
**Duración:** [Minutos que toma este paso]
**Tips opcionales:** [Consejos útiles para este paso]

```
Ejemplo:
Título: "Preparar el brócoli"
Descripción: "Separar las flores del brócoli de los tallos. Cortar los tallos en bastones delgados y las flores en bocados uniformes."
Duración: 8
Tips: ["Los tallos tienen más fibra y necesitan más tiempo de cocción", "Guarda las hojas verdes para agregrar al final"]
```

### Paso 2
**Título:** 
**Descripción:** 
**Duración:** 
**Tips opcionales:** 

### Paso 3
**Título:** 
**Descripción:** 
**Duración:** 
**Tips opcionales:** 

### Paso 4
**Título:** 
**Descripción:** 
**Duración:** 
**Tips opcionales:** 

## 📊 INFORMACIÓN NUTRICIONAL (POR PORCIÓN)

**Calorías:** [Número entero]
**Proteína:** [Ejemplo: "4g"]
**Carbohidratos:** [Ejemplo: "12g"]
**Grasas:** [Ejemplo: "6g"]
**Fibra:** [Ejemplo: "5g"]

```
Ejemplo:
Calorías: 85
Proteína: "4g"
Carbohidratos: "12g"
Grasas: "6g"
Fibra: "5g"
```

## ⭐ SISTEMA DE CALIFICACIÓN

**Rating inicial:** [Número decimal entre 4.0 y 5.0 - ejemplo: 4.7]
**Reviews iniciales:** [Número entero - ejemplo: 156]

## 🔍 PALABRAS CLAVE PARA SEO

**Keywords principales:**
```
[Lista de palabras clave separadas por comas]
[Ejemplo: "brócoli, aprovechamiento integral, verduras crucíferas, cocina sustentable, cero desperdicio"]
```

## 📝 CONEXIONES CON PRODUCTOS ARCA TIERRA

**Productos relacionados:**
```
[IDs de productos de tu catálogo que se relacionan con esta receta]
[Ejemplo: si usas brócoli, buscar el ID del brócoli en productos.ts]
```

## 📖 HISTORIA O CONTEXTO (OPCIONAL)

**Historia de la receta:**
```
[Contexto cultural, origen, o historia personal de la receta]
[Ejemplo: "Esta receta nació de la necesidad de aprovechar completamente el brócoli, incluyendo sus tallos nutritivos que muchas veces se descartan."]
```

---

## 📋 CHECKLIST ANTES DE AGREGAR A recetas.ts

- [ ] ID único asignado
- [ ] Todos los campos obligatorios completados
- [ ] Imagen funcional y accesible
- [ ] Pasos de cocción detallados con duraciones
- [ ] Información nutricional calculada
- [ ] Tags relevantes y categorización correcta
- [ ] Palabras clave para SEO definidas
- [ ] Tiempos y dificultad apropiados
- [ ] Ingredientes específicos con cantidades
- [ ] Conexión con productos del catálogo

## 🚀 EJEMPLO COMPLETO

```javascript
{
  id: 7,
  title: "Brócoli Completo - Flores y Tallos",
  description: "Aprovecha cada parte del brócoli en esta receta sustentable que combina flores tiernas y tallos crujientes.",
  image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=300&fit=crop",
  author: {
    name: "Chef María González",
    bio: "Chef especializada en cocina sustentable y aprovechamiento integral",
    image: "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=100&h=100&fit=crop&crop=face",
    specialty: "Restaurante Baldío"
  },
  cookTime: 20,
  difficulty: "Fácil",
  season: "Invierno",
  tags: ["Sin desperdicio", "Crucíferas", "Nutritivo"],
  ingredients: [
    "300g de brócoli fresco con tallos",
    "1 cebolla blanca mediana",
    "2 dientes de ajo orgánico",
    "2 cucharadas de aceite de oliva extra virgen"
  ],
  rating: 4.7,
  reviews: 156,
  steps: [
    {
      id: 1,
      title: "Preparar el brócoli",
      description: "Separar las flores del brócoli de los tallos. Cortar los tallos en bastones delgados.",
      duration: 8,
      tips: ["Los tallos necesitan más tiempo de cocción", "Las flores se cocinan rápido"]
    },
    {
      id: 2,
      title: "Saltear tallos",
      description: "En una sartén con aceite, saltear los tallos por 8 minutos hasta que estén tiernos.",
      duration: 8
    },
    {
      id: 3,
      title: "Agregar flores",
      description: "Incorporar las flores de brócoli y cocinar 4 minutos más. Condimentar al gusto.",
      duration: 4,
      tips: ["No sobrecocinar las flores para mantener el color verde vibrante"]
    }
  ],
  nutritionInfo: {
    calories: 85,
    protein: "4g",
    carbs: "12g",
    fat: "6g",
    fiber: "5g"
  }
}
```

---

## 📞 INFORMACIÓN ADICIONAL

**Contacto para dudas:** [Tu información de contacto]
**Fecha de creación de plantilla:** Enero 2025
**Versión:** 1.0

**Notas importantes:**
- Todas las recetas deben seguir la filosofía de aprovechamiento integral de Arca Tierra
- Priorizar ingredientes disponibles en el catálogo de productos
- Mantener coherencia con el estilo y tono de las recetas existentes
- Asegurar que las instrucciones sean claras y fáciles de seguir
