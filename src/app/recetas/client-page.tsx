'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Heart, 
  Clock, 
  ChefHat, 
  ShoppingCart, 
  Filter,
  X,
  ChevronDown,
  Leaf,
  Users,
  ArrowDown,
  Star,
  BookOpen,
  Lightbulb,
  Camera,
  Play
} from 'lucide-react';
import { recipesData, tipsData, communityStories, Recipe } from '@/data/recetas';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';

export default function ClientRecetasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [maxCookTime, setMaxCookTime] = useState(60);
  const [showFilters, setShowFilters] = useState(false);
  const [likedRecipes, setLikedRecipes] = useState<number[]>([]);
  const [activeView, setActiveView] = useState<'recetas' | 'consejos' | 'comunidad'>('recetas');
  const toast = useToast();

  // Cargar favoritos desde localStorage - USAR EL MISMO SISTEMA QUE PRODUCTOS
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('arcaTierraFavoritos') || '[]');
    // Extraer solo los IDs de recetas (con prefijo 'recipe-')
    const recipeFavorites = favorites
      .filter((id: string) => id.startsWith('recipe-'))
      .map((id: string) => parseInt(id.replace('recipe-', '')));
    setLikedRecipes(recipeFavorites);
  }, []);

  // Toggle like functionality - USAR EL MISMO SISTEMA QUE PRODUCTOS
  const toggleLike = (recipeId: number) => {
    const favorites = JSON.parse(localStorage.getItem('arcaTierraFavoritos') || '[]');
    const recipeIdWithPrefix = `recipe-${recipeId}`;
    const isCurrentlyLiked = favorites.includes(recipeIdWithPrefix);
    
    let updatedFavorites;
    if (isCurrentlyLiked) {
      updatedFavorites = favorites.filter((id: string) => id !== recipeIdWithPrefix);
    } else {
      updatedFavorites = [...favorites, recipeIdWithPrefix];
    }
    
    localStorage.setItem('arcaTierraFavoritos', JSON.stringify(updatedFavorites));
    
    // Actualizar estado local
    const newLikedRecipes = isCurrentlyLiked
      ? likedRecipes.filter(id => id !== recipeId)
      : [...likedRecipes, recipeId];
    setLikedRecipes(newLikedRecipes);
    
    // Notificar cambio en localStorage para actualizar otras pestañas
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'arcaTierraFavoritos',
      newValue: JSON.stringify(updatedFavorites)
    }));

    // Toast notification con undo
    const recipe = recipesData.find(r => r.id === recipeId);
    if (recipe) {
      if (isCurrentlyLiked) {
        toast.favorite(`${recipe.title} eliminada de favoritos`, {
          title: 'Receta eliminada de favoritos',
          action: {
            label: 'Deshacer',
            onClick: () => {
              const currentFavorites = JSON.parse(localStorage.getItem('arcaTierraFavoritos') || '[]');
              const restoredFavorites = [...currentFavorites, recipeIdWithPrefix];
              localStorage.setItem('arcaTierraFavoritos', JSON.stringify(restoredFavorites));
              setLikedRecipes([...likedRecipes, recipeId]);
              toast.success(`${recipe.title} restaurada a favoritos`);
            }
          }
        });
      } else {
        toast.favorite(`${recipe.title} añadida a favoritos`, {
          title: 'Receta añadida a favoritos'
        });
      }
    }
  };

  // Función para agregar ingredientes de una receta al carrito
  const addIngredientsToCart = async (recipe: any) => {
    try {
      // Importar datos de productos desde el archivo
      const productModule = await import('@/data/productos');
      const productData = productModule.productos;
      
      const matchedProducts: any[] = [];
      const notFoundIngredients: string[] = [];
      
      recipe.ingredients.forEach((ingredient: string) => {
        // Limpiar el ingrediente removiendo cantidades y medidas para buscar solo el nombre del producto
        const cleanIngredient = ingredient
          .replace(/^\d+(\.\d+)?\s*(g|gramos?|kg|kilogramos?|ml|mililitros?|l|litros?|cucharadas?|cucharaditas?|tazas?|manojos?|dientes?|unidades?)\s+(de\s+)?/gi, '')
          .replace(/^\d+\s+(de\s+)?/gi, '')
          .replace(/\s*(mediana?s?|grande?s?|pequeña?s?|fresco?s?|orgánico?s?|extra\s+virgen|en\s+polvo|rallado?s?)\s*/gi, ' ')
          .replace(/jugo\s+de\s+/gi, '')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase();
        
        // Buscar producto con coincidencia ESTRICTA - solo productos vegetarianos relevantes
        const matchingProduct = productData.find((product: any) => {
          const productName = product.nombre.toLowerCase();
          
          // Coincidencia exacta
          if (productName === cleanIngredient) return true;
          
          // Lista de coincidencias específicas y estrictas para evitar agregar carnes
          const specificMatches: { [key: string]: string[] } = {
            'acelgas': ['acelgas'],
            'kale': ['kale'],
            'hojas verdes': ['hojas', 'lechuga', 'espinacas', 'rugula', 'arugula'],
            'mix de hojas': ['hojas', 'lechuga', 'espinacas', 'rugula', 'arugula'],
            'tomates cherry': ['tomates', 'cherry'],
            'tomates': ['tomates'],
            'pepino': ['pepino', 'pepinos'],
            'zanahorias': ['zanahoria', 'zanahorias'],
            'rábanos': ['rábano', 'rábanos'],
            'cebolla': ['cebolla', 'cebollas'],
            'cebolla morada': ['cebolla'],
            'ajo': ['ajo', 'ajos'],
            'jengibre': ['jengibre'],
            'cúrcuma': ['cúrcuma'],
            'aceite de oliva': ['aceite', 'oliva'],
            'limón': ['limón', 'limones'],
            'sal marina': ['sal'],
            'especias': ['especias', 'condimentos'],
            'hierbas frescas': ['hierbas', 'perejil', 'cilantro', 'albahaca']
          };
          
          // Buscar coincidencia específica
          for (const [ingredient, validProducts] of Object.entries(specificMatches)) {
            if (cleanIngredient.includes(ingredient)) {
              return validProducts.some(validProduct => productName.includes(validProduct));
            }
          }
          
          // Si no hay coincidencia específica, solo permitir coincidencia exacta
          return false;
        });
        
        if (matchingProduct) {
          matchedProducts.push({
            id: matchingProduct.id,
            name: matchingProduct.nombre,
            price: matchingProduct.precio,
            quantity: 1,
            image: matchingProduct.imagen,
            unit: matchingProduct.unidad,
            originalIngredient: ingredient
          });
        } else {
          notFoundIngredients.push(ingredient);
        }
      });
      
      // Agregar productos encontrados al carrito
      if (matchedProducts.length > 0) {
        const existingCart = JSON.parse(localStorage.getItem('arcaTierraCart') || '[]');
        
        matchedProducts.forEach(item => {
          const existingItemIndex = existingCart.findIndex((cartItem: any) => cartItem.id === item.id);
          if (existingItemIndex >= 0) {
            existingCart[existingItemIndex].quantity += item.quantity;
          } else {
            existingCart.push(item);
          }
        });
        
        localStorage.setItem('arcaTierraCart', JSON.stringify(existingCart));
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Toast de éxito
        const addedCount = matchedProducts.length;
        const totalIngredients = recipe.ingredients.length;
        
        toast.cart(`${addedCount} de ${totalIngredients} ingredientes agregados al carrito`, {
          title: `Ingredientes de "${recipe.title}"`,
          action: {
            label: 'Ver carrito',
            onClick: () => window.dispatchEvent(new Event('toggleCartSidebar'))
          }
        });
        
        // Si hay ingredientes no encontrados, mostrar toast informativo
        if (notFoundIngredients.length > 0) {
          setTimeout(() => {
            toast.warning(`${notFoundIngredients.length} ingredientes no disponibles en tienda: ${notFoundIngredients.join(', ')}`, {
              title: 'Algunos ingredientes no encontrados'
            });
          }, 1500);
        }
      } else {
        // No se encontraron productos
        toast.warning('No se encontraron productos disponibles para esta receta', {
          title: 'Ingredientes no disponibles'
        });
      }
    } catch (error) {
      console.error('Error al agregar ingredientes al carrito:', error);
      toast.error('Error al agregar ingredientes al carrito');
    }
  };

  // Filter toggle functionality
  const toggleFilter = (category: 'difficulty' | 'season' | 'tags', value: string) => {
    switch (category) {
      case 'difficulty':
        setSelectedDifficulty(prev => 
          prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
        break;
      case 'season':
        setSelectedSeason(prev => 
          prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
        break;
      case 'tags':
        setSelectedTags(prev => 
          prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
        break;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedDifficulty([]);
    setSelectedSeason([]);
    setSelectedTags([]);
    setMaxCookTime(60);
    setSearchTerm('');
  };

  // Get unique values for filters
  const allTags = [...new Set(recipesData.flatMap(recipe => recipe.tags))];
  const difficulties = ['Fácil', 'Medio', 'Avanzado'];
  const seasons = ['Primavera', 'Verano', 'Otoño', 'Invierno', 'Todo el año'];

  // Filter recipes
  const filteredRecipes = recipesData.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = selectedDifficulty.length === 0 || selectedDifficulty.includes(recipe.difficulty);
    const matchesSeason = selectedSeason.length === 0 || selectedSeason.includes(recipe.season);
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => recipe.tags.includes(tag));
    const matchesTime = recipe.cookTime <= maxCookTime;

    return matchesSearch && matchesDifficulty && matchesSeason && matchesTags && matchesTime;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F2E8' }}>
      {/* Hero Section */}
      <section className="py-20" style={{ backgroundColor: '#33503E' }}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Recetas Agroecológicas
            </h1>
            <p className="text-xl text-white text-center mb-8 max-w-4xl mx-auto leading-relaxed">
              Descubre el sabor auténtico de la tierra con recetas que celebran cada parte de los ingredientes agroecológicos
            </p>

            {/* Sección Filosófica */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
                <div className="grid md:grid-cols-2 gap-8 text-white">
                  <div>
                    <p className="text-lg leading-relaxed text-left">
                      👩‍🍳🌿 Queremos que tu cocina se llene de <strong>frescura, colores y texturas de temporada</strong>. Cada semana cambia lo que cosechamos, y eso nos inspira a comer distinto, probar nuevos ingredientes y reconectar con la diversidad de nuestra tierra. 🌱
                    </p>
                  </div>
                  <div>
                    <p className="text-lg leading-relaxed text-left">
                      📊 Aunque existen entre <strong>6,000 y 30,000 plantas comestibles</strong>, hoy en día solo cuatro <span className="inline-flex items-center gap-1">(🌽 maíz, 🌾 trigo, 🍚 arroz y 🥔 papa)</span> representan más del 60% de las calorías que consume la humanidad.
                    </p>
                    <p className="text-lg leading-relaxed text-left mt-3">
                      🎯♻️ Aquí hacemos lo contrario: <strong>celebramos la variedad, lo local y lo agroecológico.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Busca recetas, ingredientes, técnicas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg bg-white border-0 rounded-xl shadow-lg focus:ring-2 focus:ring-white focus:ring-opacity-50 text-black placeholder:text-gray-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-4 justify-center">
          {[
            { key: 'recetas', label: 'Recetas', icon: ChefHat },
            { key: 'consejos', label: 'Consejos', icon: Lightbulb },
            { key: 'comunidad', label: 'Comunidad', icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeView === key
                  ? 'text-white'
                  : 'text-gray-700 hover:text-white hover:shadow-lg'
              }`}
              style={{
                backgroundColor: activeView === key ? '#B15543' : 'white',
                ...(activeView !== key && {
                  ':hover': { backgroundColor: '#B15543' }
                })
              }}
              onMouseEnter={(e) => {
                if (activeView !== key) {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#B15543';
                  target.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== key) {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = 'white';
                  target.style.color = '#374151';
                }
              }}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        {/* RECETAS SECTION */}
        {activeView === 'recetas' && (
          <motion.section
            key="recetas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto px-6 pb-20"
          >
            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm"
              >
                <Filter className="w-5 h-5" />
                Filtros
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <div className={`lg:block ${showFilters ? 'block' : 'hidden'} w-full lg:w-80 space-y-6`}>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="font-semibold text-lg mb-4" style={{ color: '#33503E' }}>
                    Filtros
                  </h3>

                  {/* Difficulty Filter */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Dificultad</h4>
                    <div className="flex flex-wrap gap-2">
                      {difficulties.map(diff => (
                        <button
                          key={diff}
                          onClick={() => toggleFilter('difficulty', diff)}
                          className={`px-3 py-1 text-sm rounded-full transition-all ${
                            selectedDifficulty.includes(diff)
                              ? 'text-white'
                              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                          }`}
                          style={{
                            backgroundColor: selectedDifficulty.includes(diff) ? '#B15543' : undefined
                          }}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Season Filter */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Temporada</h4>
                    <div className="flex flex-wrap gap-2">
                      {seasons.map(season => (
                        <button
                          key={season}
                          onClick={() => toggleFilter('season', season)}
                          className={`px-3 py-1 text-sm rounded-full transition-all ${
                            selectedSeason.includes(season)
                              ? 'text-white'
                              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                          }`}
                          style={{
                            backgroundColor: selectedSeason.includes(season) ? '#B15543' : undefined
                          }}
                        >
                          {season}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Filter */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Tiempo máximo: {maxCookTime} min</h4>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      value={maxCookTime}
                      onChange={(e) => setMaxCookTime(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Tags Filter */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Etiquetas</h4>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleFilter('tags', tag)}
                          className={`px-3 py-1 text-sm rounded-full transition-all ${
                            selectedTags.includes(tag)
                              ? 'text-white'
                              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                          }`}
                          style={{
                            backgroundColor: selectedTags.includes(tag) ? '#B15543' : undefined
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={clearFilters}
                    className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 border rounded-lg hover:bg-gray-50"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>

              {/* Recipes Grid */}
              <div className="flex-1">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold" style={{ color: '#33503E' }}>
                    {filteredRecipes.length} recetas encontradas
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredRecipes.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative group">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        
                        {/* Ingredients Hover Overlay */}
                        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-4">
                          <div className="text-white text-center max-w-full overflow-hidden">
                            <h4 className="text-sm font-semibold mb-3 text-yellow-300">🥘 Ingredientes:</h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
                              {recipe.ingredients.map((ingredient, idx) => (
                                <div key={idx} className="text-xs bg-white/20 rounded-full px-2 py-1 backdrop-blur-sm">
                                  • {ingredient}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleLike(recipe.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full transition-all z-10 ${
                            likedRecipes.includes(recipe.id)
                              ? 'bg-red-100 text-red-600'
                              : 'bg-white/80 text-gray-600 hover:text-red-600'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${likedRecipes.includes(recipe.id) ? 'fill-current' : ''}`} />
                        </button>
                        <div className="absolute bottom-3 left-3 flex gap-2 z-10">
                          <span className="px-2 py-1 bg-white/90 rounded-full text-xs font-medium" style={{ color: '#33503E' }}>
                            {recipe.difficulty}
                          </span>
                          <span className="px-2 py-1 bg-white/90 rounded-full text-xs font-medium" style={{ color: '#33503E' }}>
                            {recipe.season}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2" style={{ color: '#33503E' }}>
                          {recipe.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {recipe.description}
                        </p>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{recipe.cookTime} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{recipe.rating}</span>
                            <span className="text-sm text-gray-400">({recipe.reviews})</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {recipe.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs rounded-full"
                              style={{ backgroundColor: '#CCBB9A', color: '#33503E' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/receta/${recipe.id}`} className="flex-1">
                            <button className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                              Ver Receta
                            </button>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addIngredientsToCart(recipe);
                            }}
                            className="py-2 px-4 text-white rounded-lg hover:shadow-lg transition-all"
                            style={{ backgroundColor: '#B15543' }}
                            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#975543'}
                            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B15543'}
                            title="Agregar ingredientes al carrito"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* CONSEJOS SECTION */}
        {activeView === 'consejos' && (
          <motion.section
            key="consejos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto px-6 pb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#33503E' }}>
                Consejos de Cocina Sustentable
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Aprende técnicas ancestrales y modernas para aprovechar al máximo cada ingrediente
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tipsData.map((tip, index) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{tip.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold" style={{ color: '#33503E' }}>
                          {tip.title}
                        </h3>
                        <span
                          className="px-3 py-1 text-sm rounded-full"
                          style={{ backgroundColor: '#CCBB9A', color: '#33503E' }}
                        >
                          {tip.category}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* COMUNIDAD SECTION */}
        {activeView === 'comunidad' && (
          <motion.section
            key="comunidad"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto px-6 pb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#33503E' }}>
                Historias de Nuestra Comunidad
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Conoce las experiencias de agricultores y familias que forman parte de la red Arca Tierra
              </p>
            </div>

            <div className="space-y-8">
              {communityStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-2xl shadow-sm"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={story.image}
                      alt={story.author}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg" style={{ color: '#33503E' }}>
                        {story.author}
                      </h3>
                      <p className="text-sm mb-3" style={{ color: '#748880' }}>
                        {story.location}
                      </p>
                      <p className="text-base leading-relaxed mb-4" style={{ color: '#475A52' }}>
                        "{story.story}"
                      </p>
                      <div
                        className="inline-block px-3 py-1 rounded-full text-sm text-white"
                        style={{ backgroundColor: '#B15543' }}
                      >
                        {story.recipe}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <button 
                className="px-8 py-4 text-lg text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                style={{ backgroundColor: '#B15543' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#975543'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B15543'}
              >
                Comparte tu Receta
              </button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* CTA SECTION */}
      <section className="py-20" style={{ backgroundColor: '#CCBB9A' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold" style={{ color: '#3A4741' }}>
              ¿Listo para cocinar con ingredientes de temporada?
            </h2>
            <p className="text-xl" style={{ color: '#475A52' }}>
              Descubre todos los ingredientes frescos y orgánicos disponibles en nuestra tienda.
              Cada producto viene directo de nuestros productores agroecológicos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tienda">
                <button 
                  className="px-8 py-4 text-lg text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                  style={{ backgroundColor: '#B15543' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#975543'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B15543'}
                >
                  Ver Productos Disponibles
                </button>
              </Link>
              <Link href="/suscripciones">
                <button 
                  className="px-8 py-4 text-lg rounded-xl font-semibold border-2 transition-all duration-300 hover:shadow-lg"
                  style={{ 
                    borderColor: '#33503E', 
                    color: '#33503E',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = '#33503E';
                    target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = 'transparent';
                    target.style.color = '#33503E';
                  }}
                >
                  Suscribirse a la Canasta
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
