'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/Toast';

// Interfaces para los tipos de productos que pueden añadirse al carrito de cotizaciones
export interface QuoteMenuItem {
  id: string;
  type: 'menu';
  name: string;
  price: number;
  description: string;
  minPersons: number;
  persons: number; // Número de personas para este menú
}

export interface QuoteServiceItem {
  id: string;
  type: 'service';
  name: string;
  price: number;
  description: string;
  unit: string;
  quantity: number;
}

export type QuoteCartItem = QuoteMenuItem | QuoteServiceItem;

interface QuoteCartContextType {
  items: QuoteCartItem[];
  addMenu: (menu: Omit<QuoteMenuItem, 'type'>) => void;
  addService: (service: Omit<QuoteServiceItem, 'type'>) => void;
  updateItemQuantity: (id: string, newQuantity: number) => void;
  updateMenuPersons: (id: string, persons: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  itemCount: number;
  totalEstimate: number;
}

const QuoteCartContext = createContext<QuoteCartContextType | null>(null);

export const useQuoteCart = () => {
  const context = useContext(QuoteCartContext);
  if (!context) {
    throw new Error('useQuoteCart debe ser usado dentro de un QuoteCartProvider');
  }
  return context;
};

interface QuoteCartProviderProps {
  children: ReactNode;
}

const LOCAL_STORAGE_KEY = 'arcaTierraCateringQuote';

export function QuoteCartProvider({ children }: QuoteCartProviderProps) {
  const [items, setItems] = useState<QuoteCartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [totalEstimate, setTotalEstimate] = useState(0);
  const toast = useToast();

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error al cargar el carrito de cotizaciones:', error);
      }
    }
  }, []);

  // Actualizar contadores cuando cambian los items
  useEffect(() => {
    // Actualizar contador de items
    const count = items.reduce((sum, item) => {
      if (item.type === 'service') {
        return sum + item.quantity;
      }
      return sum + 1; // Los menús siempre cuentan como 1 item
    }, 0);
    
    setItemCount(count);
    
    // Calcular el total estimado
    const total = items.reduce((sum, item) => {
      if (item.type === 'menu') {
        return sum + (item.price * item.persons);
      } else {
        return sum + (item.price * item.quantity);
      }
    }, 0);
    
    setTotalEstimate(total);
    
    // Guardar en localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    
    // Disparar evento personalizado para notificar cambios en el carrito
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('quoteCartUpdated', { detail: { items, count: itemCount, total: totalEstimate } }));
    }
  }, [items]);

  const addMenu = (menu: Omit<QuoteMenuItem, 'type'>) => {
    // Verificar si ya existe este menú en el carrito
    const existingIndex = items.findIndex(
      item => item.id === menu.id && item.type === 'menu'
    );

    if (existingIndex >= 0) {
      // Si ya existe, solo incrementamos el número de personas
      const updatedItems = [...items];
      const existingItem = updatedItems[existingIndex] as QuoteMenuItem;
      updatedItems[existingIndex] = {
        ...existingItem,
        persons: existingItem.persons + menu.minPersons
      };
      setItems(updatedItems);
    } else {
      // Si no existe, lo añadimos como nuevo
      setItems([
        ...items,
        {
          ...menu,
          type: 'menu',
          persons: menu.minPersons
        }
      ]);
    }

    toast.cart(`${menu.name}`, {
      title: 'Menú añadido a tu cotización',
      action: {
        label: 'Ver cotización',
        onClick: () => window.dispatchEvent(new Event('toggleQuoteCart'))
      }
    });
  };

  const addService = (service: Omit<QuoteServiceItem, 'type'>) => {
    // Verificar si ya existe este servicio en el carrito
    const existingIndex = items.findIndex(
      item => item.id === service.id && item.type === 'service'
    );

    if (existingIndex >= 0) {
      // Si ya existe, solo incrementamos la cantidad
      const updatedItems = [...items];
      const existingItem = updatedItems[existingIndex] as QuoteServiceItem;
      updatedItems[existingIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + 1
      };
      setItems(updatedItems);
    } else {
      // Si no existe, lo añadimos como nuevo
      setItems([
        ...items,
        {
          ...service,
          type: 'service',
          quantity: 1
        }
      ]);
    }

    toast.cart(`${service.name}`, {
      title: 'Servicio añadido a tu cotización',
      action: {
        label: 'Ver cotización',
        onClick: () => window.dispatchEvent(new Event('toggleQuoteCart'))
      }
    });
  };

  const updateItemQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    const updatedItems = items.map(item => {
      if (item.id === id && item.type === 'service') {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    setItems(updatedItems);
  };

  const updateMenuPersons = (id: string, persons: number) => {
    // Asegurar que no se establezca un número de personas menor al mínimo
    const menuItem = items.find(item => item.id === id && item.type === 'menu') as QuoteMenuItem | undefined;
    
    if (!menuItem) return;
    
    const minPersons = menuItem.minPersons;
    const finalPersons = Math.max(persons, minPersons);
    
    const updatedItems = items.map(item => {
      if (item.id === id && item.type === 'menu') {
        return { ...item, persons: finalPersons };
      }
      return item;
    });

    setItems(updatedItems);
  };

  const removeItem = (id: string) => {
    const itemToRemove = items.find(item => item.id === id);
    if (!itemToRemove) return;
    
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);

    toast.error(`${itemToRemove.name} eliminado de la cotización`, {
      title: 'Elemento eliminado',
      action: {
        label: 'Deshacer',
        onClick: () => {
          setItems([...updatedItems, itemToRemove]);
        }
      }
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <QuoteCartContext.Provider
      value={{
        items,
        addMenu,
        addService,
        updateItemQuantity,
        updateMenuPersons,
        removeItem,
        clearCart,
        itemCount,
        totalEstimate,
      }}
    >
      {children}
    </QuoteCartContext.Provider>
  );
}

export default QuoteCartContext;
