'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Users, 
  Star, 
  Heart, 
  ShoppingCart, 
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Copy,
  ChefHat,
  Utensils,
  MessageCircle,
  ThumbsUp,
  Send,
  Check,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Recipe, RecipeComment, UserRating } from '@/data/recetas';
import { productos, Product } from '@/data/productos';
import { useToast } from '@/components/ui/Toast';

interface RecipeDetailClientProps {
  recipe: Recipe;
}

export default function RecipeDetailClient({ recipe }: RecipeDetailClientProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Usar comentarios reales de la receta o comentarios vacíos si no existen
    const recipeComments = recipe.comments || [];
    
    const sampleRatings: UserRating[] = [
      {
        id: "r1",
        recipeId: recipe.id,
        userId: "u1",
        userName: "Ana Martínez",
        rating: 5,
        comment: "¡Excelente receta! Los niños la adoraron y es súper fácil de hacer.",
        date: "2024-03-15"
      }
    ];
    
    setComments(recipeComments);
    setRatings(sampleRatings.filter((r: UserRating) => r.recipeId === recipe.id));
    
    // Cargar favoritos desde localStorage - USAR EL MISMO SISTEMA QUE PRODUCTOS
    const favorites = JSON.parse(localStorage.getItem('arcaTierraFavoritos') || '[]');
    // Para recetas, usamos IDs con prefijo 'recipe-' para diferenciar de productos
    setIsFavorite(favorites.includes(`recipe-${recipe.id}`));
  }, [recipe.id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('arcaTierraFavoritos') || '[]');
    const recipeId = `recipe-${recipe.id}`;
    let updatedFavorites;
    
    if (isFavorite) {
      updatedFavorites = favorites.filter((id: string) => id !== recipeId);
    } else {
      updatedFavorites = [...favorites, recipeId];
    }
    
    localStorage.setItem('arcaTierraFavoritos', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
    
    // Notificar cambio en localStorage para actualizar otras pestañas
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'arcaTierraFavoritos',
      newValue: JSON.stringify(updatedFavorites)
    }));
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
    // Aquí implementarías la lógica para enviar el rating al backend
    console.log(`Rating ${rating} for recipe ${recipe.id}`);
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    
    const newCommentObj: RecipeComment = {
      id: `c${Date.now()}`,
      recipeId: recipe.id,
      userId: 'current-user',
      userName: 'Usuario Actual',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      comment: newComment,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };

    setComments([newCommentObj, ...comments]);
    setNewComment('');
  };

  const shareRecipe = async (platform: string) => {
    const recipeUrl = `${window.location.origin}/receta/${recipe.id}`;
    const shareText = `¡Mira esta deliciosa receta: ${recipe.title}!`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(recipeUrl)}`, '_blank');
        break;
      case 'instagram':
        // Instagram no permite compartir directo, copiamos el enlace
        await navigator.clipboard.writeText(`${shareText} ${recipeUrl}`);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
        break;
      case 'copy':
        await navigator.clipboard.writeText(recipeUrl);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
        break;
    }
    
    setShowShareMenu(false);
  };

  // Función para agregar todos los ingredientes de la receta al carrito
  const addIngredientsToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem('arcaTierraCart') || '[]');
    let exactMatches: string[] = [];
    let notFoundIngredients: string[] = [];

    // Mapear ingredientes de receta a productos disponibles (SOLO COINCIDENCIAS EXACTAS)
    recipe.ingredients.forEach(ingredient => {
      // Buscar productos con coincidencia exacta únicamente
      const matchedProduct = productos.find(product => {
        const ingredientLower = ingredient.toLowerCase().trim();
        const productNameLower = product.nombre.toLowerCase().trim();
        
        // Coincidencia exacta: el nombre del producto debe contener exactamente el ingrediente
        // o el ingrediente debe contener exactamente el nombre del producto
        return productNameLower === ingredientLower || 
               productNameLower.includes(ingredientLower) ||
               ingredientLower.includes(productNameLower);
      });

      if (matchedProduct) {
        // Verificar si el producto ya está en el carrito
        const existingItemIndex = existingCart.findIndex((item: any) => item.id === matchedProduct.id);
        
        if (existingItemIndex >= 0) {
          existingCart[existingItemIndex].quantity += 1;
        } else {
          const cartItem = {
            id: matchedProduct.id,
            name: matchedProduct.nombre,
            price: matchedProduct.precio,
            quantity: 1,
            image: matchedProduct.imagen,
            unit: matchedProduct.unidad
          };
          existingCart.push(cartItem);
        }
        
        exactMatches.push(matchedProduct.nombre);
      } else {
        notFoundIngredients.push(ingredient);
      }
    });

    // Guardar carrito actualizado
    localStorage.setItem('arcaTierraCart', JSON.stringify(existingCart));
    
    // Notificar actualización del carrito
    window.dispatchEvent(new Event('cartUpdated'));

    // Mostrar feedback al usuario
    if (exactMatches.length > 0) {
      const message = `✅ ${exactMatches.length} ingrediente${exactMatches.length > 1 ? 's agregados' : ' agregado'}: ${exactMatches.join(', ')}`;
      
      toast.cart(message, {
        title: '🛒 ¡Ingredientes agregados al carrito!',
        action: {
          label: 'Ver carrito',
          onClick: () => window.dispatchEvent(new Event('toggleCartSidebar'))
        }
      });
    }

    if (notFoundIngredients.length > 0) {
      setTimeout(() => {
        toast.error(`❌ Ingredientes no disponibles en tienda: ${notFoundIngredients.join(', ')}`, {
          title: 'Ingredientes no encontrados'
        });
      }, 1000);
    }

    if (exactMatches.length === 0) {
      toast.error('Ningún ingrediente de esta receta está disponible en la tienda actualmente', {
        title: 'Sin ingredientes disponibles'
      });
    }
  };

  const totalTime = recipe.steps?.reduce((acc, step) => acc + (step.duration || 0), 0) || recipe.cookTime;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F2E8' }}>
      {/* Botón volver posicionado debajo del logo, no ocupando todo el ancho */}
      <div className="absolute top-16 left-6 z-10">
        <Link 
          href="/recetas"
          className="inline-flex items-center gap-2 bg-white bg-opacity-95 hover:bg-opacity-100 px-4 py-2 rounded-lg shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver</span>
        </Link>
      </div>

      {/* Header con imagen y información básica */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />

        {/* Acciones en header */}
        <div className="absolute top-6 right-6 flex gap-3">
          <button
            onClick={toggleFavorite}
            className={`p-3 rounded-full transition-all duration-200 ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white bg-opacity-90 hover:bg-opacity-100'
            }`}
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-all duration-200"
            >
              <Share2 className="w-6 h-6" style={{ color: '#33503E' }} />
            </button>
            
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-16 right-0 bg-white rounded-lg shadow-lg p-4 z-10"
                >
                  <div className="flex flex-col gap-2 min-w-48">
                    <button
                      onClick={() => shareRecipe('facebook')}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-left"
                    >
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <span>Facebook</span>
                    </button>
                    <button
                      onClick={() => shareRecipe('twitter')}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-left"
                    >
                      <Twitter className="w-5 h-5 text-blue-400" />
                      <span>Twitter</span>
                    </button>
                    <button
                      onClick={() => shareRecipe('instagram')}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-left"
                    >
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <span>Instagram</span>
                    </button>
                    <button
                      onClick={() => shareRecipe('copy')}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-left"
                    >
                      {copiedToClipboard ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                      <span>{copiedToClipboard ? '¡Copiado!' : 'Copiar enlace'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Encabezado de la receta - Título e información meta */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#33503E' }}>{recipe.title}</h1>
          
          {/* Información del autor/chef */}
          {recipe.author && (
            <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white">
                  <ChefHat className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">Chef: {recipe.author.name}</div>
                  {recipe.author.bio && (
                    <div className="text-sm text-gray-600">{recipe.author.bio}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: '#B15543' }} />
              <span className="font-medium">{totalTime} min</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" style={{ color: '#B15543' }} />
              <span className="font-medium">{recipe.difficulty}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: '#B15543' }} />
              <span className="font-medium">4 personas</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-current text-yellow-400" />
              <span className="font-medium">{recipe.rating} ({recipe.reviews} reseñas)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Columna principal - Descripción e ingredientes */}
          <div className="md:col-span-2">
            {/* Descripción */}
            <div className="mb-8">
              <p className="text-lg text-gray-700 leading-relaxed">{recipe.description}</p>
            </div>

            {/* Beneficios */}
            {recipe.beneficios && recipe.beneficios.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm mb-8 border border-green-100">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#33503E' }}>
                  🌿 Beneficios para la Salud
                </h2>
                <ul className="space-y-3">
                  {recipe.beneficios.map((beneficio, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <div 
                        className="w-2 h-2 rounded-full mr-4 mt-2 flex-shrink-0"
                        style={{ backgroundColor: '#16a34a' }}
                      />
                      <span className="leading-relaxed">{beneficio}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ingredientes */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#33503E' }}>
                <Utensils className="inline-block w-6 h-6 mr-3" />
                Ingredientes
              </h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <div 
                      className="w-2 h-2 rounded-full mr-4 flex-shrink-0"
                      style={{ backgroundColor: '#B15543' }}
                    />
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pasos */}
            {recipe.steps && (
              <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#33503E' }}>
                  Preparación paso a paso
                </h2>
                <div className="space-y-6">
                  {recipe.steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      className={`p-4 rounded-lg border-l-4 transition-all duration-200 cursor-pointer ${
                        activeStep === step.id 
                          ? 'border-l-4' 
                          : 'border-l-gray-200 hover:border-l-4'
                      }`}
                      style={{
                        borderLeftColor: activeStep === step.id ? '#B15543' : undefined,
                        backgroundColor: activeStep === step.id ? '#FFF5F5' : '#F9F9F9'
                      }}
                      onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: '#B15543' }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2" style={{ color: '#33503E' }}>
                            {step.title}
                          </h3>
                          <p className="text-gray-700 mb-2">{step.description}</p>
                          {step.duration && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{step.duration} minutos</span>
                            </div>
                          )}
                          
                          {/* Tips expandibles */}
                          <AnimatePresence>
                            {activeStep === step.id && step.tips && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-gray-200"
                              >
                                <h4 className="font-medium text-sm mb-2" style={{ color: '#B15543' }}>
                                  💡 Tips del chef:
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {step.tips.map((tip, tipIndex) => (
                                    <li key={tipIndex} className="flex items-start gap-2">
                                      <span>•</span>
                                      <span>{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Sección de comentarios */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#33503E' }}>
                <MessageCircle className="inline-block w-6 h-6 mr-3" />
                Comentarios ({comments.length})
              </h2>

              {/* Agregar comentario */}
              <div className="mb-8">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Comparte tu experiencia con esta receta..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleComment}
                    className="px-6 py-2 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    style={{ backgroundColor: '#B15543' }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#975543'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B15543'}
                  >
                    <Send className="w-4 h-4" />
                    Comentar
                  </button>
                </div>
              </div>

              {/* Lista de comentarios */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <img
                      src={comment.userAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                      alt={comment.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium" style={{ color: '#33503E' }}>
                          {comment.userName}
                        </span>
                        <span className="text-sm text-gray-500">{comment.date}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.comment}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{comment.likes}</span>
                        </button>
                        <button className="hover:text-blue-600 transition-colors">
                          Responder
                        </button>
                      </div>

                      {/* Respuestas */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 pl-6 border-l-2 border-gray-100 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <img
                                src={reply.userAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
                                alt={reply.userName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm" style={{ color: '#33503E' }}>
                                    {reply.userName}
                                  </span>
                                  <span className="text-xs text-gray-500">{reply.date}</span>
                                </div>
                                <p className="text-sm text-gray-700">{reply.comment}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Barra lateral */}
          <div className="space-y-8">
            {/* Sistema de calificación */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#33503E' }}>
                Califica esta receta
              </h3>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`p-1 transition-colors ${
                      star <= userRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
              {userRating > 0 && (
                <p className="text-sm text-gray-600">
                  Has calificado esta receta con {userRating} estrella{userRating !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Información nutricional */}
            {recipe.nutritionInfo && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <button
                  onClick={() => setShowNutrition(!showNutrition)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-xl font-bold" style={{ color: '#33503E' }}>
                    Información Nutricional
                  </h3>
                  <motion.div
                    animate={{ rotate: showNutrition ? 180 : 0 }}
                    className="text-gray-400"
                  >
                    ▼
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {showNutrition && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      <div className="flex justify-between">
                        <span className="text-gray-600">Calorías</span>
                        <span className="font-medium">{recipe.nutritionInfo.calories} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Proteínas</span>
                        <span className="font-medium">{recipe.nutritionInfo.protein}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Carbohidratos</span>
                        <span className="font-medium">{recipe.nutritionInfo.carbs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Grasas</span>
                        <span className="font-medium">{recipe.nutritionInfo.fat}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fibra</span>
                        <span className="font-medium">{recipe.nutritionInfo.fiber}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* CTA para comprar ingredientes */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#33503E' }}>
                Compra los ingredientes
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Consigue todos los ingredientes frescos directamente de nuestros agricultores.
              </p>
              <Link
                href="/tienda"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 mb-3"
              >
                <ShoppingCart className="w-5 h-5" />
                Ir a la Tienda
              </Link>
              
              <button
                onClick={addIngredientsToCart}
                className="w-full text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg transform hover:-translate-y-0.5"
                style={{ backgroundColor: '#B15543' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#975543'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B15543'}
              >
                <ShoppingCart className="w-5 h-5" />
                Agregar Ingredientes al Carrito
              </button>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#33503E' }}>Tags</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm rounded-full text-white"
                    style={{ backgroundColor: '#CCBB9A' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
