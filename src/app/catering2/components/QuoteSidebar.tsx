'use client'

import { useEffect } from 'react'
import { X, Plus, Minus, FileText, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuoteCart, type QuoteMenuItem, type QuoteServiceItem } from '../context/QuoteCartContext'

interface QuoteSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function QuoteSidebar({ isOpen, onClose }: QuoteSidebarProps) {
  const { 
    items, 
    updateItemQuantity, 
    updateMenuPersons, 
    removeItem, 
    itemCount, 
    totalEstimate,
    clearCart
  } = useQuoteCart();

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Función para formatear el precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  // Función para enviar la cotización (simulada)
  const handleSubmitQuote = () => {
    // Aquí enviaríamos los datos a n8n en una implementación real
    console.log('Enviando solicitud de cotización:', items);
    
    // Simulación de envío exitoso
    setTimeout(() => {
      alert('Tu solicitud de cotización ha sido enviada. Nos pondremos en contacto contigo pronto.');
      clearCart();
      onClose();
    }, 1000);
  };

  return (
    <>
      {/* Overlay de fondo */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-xl 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Encabezado */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-verde-tipografia flex items-center gap-2">
            <FileText size={24} />
            Mi cotización
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Contenido del carrito */}
        <div className="flex flex-col h-[calc(100%-160px)] overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-gray-500">
              <FileText size={64} className="mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">Tu cotización está vacía</p>
              <p className="text-center mb-4">Añade menús y servicios para solicitar una cotización personalizada.</p>
              <Button 
                variant="outline"
                className="mt-2 border-terracota-principal text-terracota-principal"
                onClick={onClose}
              >
                Explorar opciones
              </Button>
            </div>
          ) : (
            <div className="p-4 divide-y">
              {/* Menús */}
              {items
                .filter(item => item.type === 'menu')
                .map((item) => {
                  const menuItem = item as QuoteMenuItem;
                  return (
                    <div key={menuItem.id} className="py-4">
                      <div className="flex justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-verde-tipografia">{menuItem.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{menuItem.description}</p>
                        </div>
                        <button 
                          onClick={() => removeItem(menuItem.id)}
                          className="ml-2 text-gray-400 hover:text-terracota-principal"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-gray-500">
                          <span className="font-semibold text-terracota-principal">
                            {formatPrice(menuItem.price)}
                          </span> por persona
                        </div>
                        
                        {/* Control de personas */}
                        <div className="flex items-center border rounded-md">
                          <button 
                            onClick={() => updateMenuPersons(menuItem.id, menuItem.persons - 1)}
                            className="px-2 py-1 text-gray-600 hover:text-terracota-principal disabled:opacity-50"
                            disabled={menuItem.persons <= menuItem.minPersons}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-2 min-w-[40px] text-center">
                            {menuItem.persons} <span className="text-xs">pers.</span>
                          </span>
                          <button 
                            onClick={() => updateMenuPersons(menuItem.id, menuItem.persons + 1)}
                            className="px-2 py-1 text-gray-600 hover:text-terracota-principal"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-1 text-right text-sm">
                        <span className="font-semibold">
                          Subtotal: {formatPrice(menuItem.price * menuItem.persons)}
                        </span>
                      </div>
                    </div>
                  );
                })
              }
              
              {/* Servicios adicionales */}
              {items
                .filter(item => item.type === 'service')
                .map((item) => {
                  const serviceItem = item as QuoteServiceItem;
                  return (
                    <div key={serviceItem.id} className="py-4">
                      <div className="flex justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-verde-tipografia">{serviceItem.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{serviceItem.description}</p>
                        </div>
                        <button 
                          onClick={() => removeItem(serviceItem.id)}
                          className="ml-2 text-gray-400 hover:text-terracota-principal"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-gray-500">
                          <span className="font-semibold text-terracota-principal">
                            {formatPrice(serviceItem.price)}
                          </span> {serviceItem.unit}
                        </div>
                        
                        {/* Control de cantidad */}
                        <div className="flex items-center border rounded-md">
                          <button 
                            onClick={() => updateItemQuantity(serviceItem.id, serviceItem.quantity - 1)}
                            className="px-2 py-1 text-gray-600 hover:text-terracota-principal"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-2 min-w-[30px] text-center">
                            {serviceItem.quantity}
                          </span>
                          <button 
                            onClick={() => updateItemQuantity(serviceItem.id, serviceItem.quantity + 1)}
                            className="px-2 py-1 text-gray-600 hover:text-terracota-principal"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-1 text-right text-sm">
                        <span className="font-semibold">
                          Subtotal: {formatPrice(serviceItem.price * serviceItem.quantity)}
                        </span>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          )}
        </div>
        
        {/* Footer con totales y botón de checkout */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4">
          {items.length > 0 && (
            <>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total estimado:</span>
                <span className="font-bold text-verde-tipografia">{formatPrice(totalEstimate)}</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                *Este es un precio estimado. El precio final puede variar según tus necesidades específicas.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="border-terracota-principal text-terracota-principal hover:bg-terracota-principal/10"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que deseas vaciar tu cotización?')) {
                      clearCart();
                    }
                  }}
                >
                  Vaciar
                </Button>
                <Button 
                  className="bg-terracota-principal hover:bg-terracota-oscuro text-white"
                  onClick={handleSubmitQuote}
                >
                  Solicitar cotización
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Botón flotante para abrir carrito (visible cuando está cerrado) */}
      {!isOpen && (
        <button 
          onClick={() => window.dispatchEvent(new Event('toggleQuoteCart'))}
          className="fixed bottom-6 right-6 z-30 bg-terracota-principal text-white rounded-full p-3 shadow-lg hover:bg-terracota-oscuro transition-colors duration-300 group"
        >
          <div className="relative">
            <FileText size={24} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-verde-principal text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
        </button>
      )}
    </>
  );
}
