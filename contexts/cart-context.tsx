'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface KeychainItem {
  id: string;
  pngDataUrl: string; // Base64 PNG data
  nametag: string;
  createdAt: Date;
  price: number;
  hasCharm: boolean; // Whether "Sac Viet" charm is added
  hasGiftBox: boolean; // Whether "20.10 Gift Box" is added
  hasExtraItems: boolean; // Whether "Extra Items + Gift Packaging" is added
}

interface CartContextType {
  items: KeychainItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (pngDataUrl: string) => string; // Returns item ID for nametag input
  updateNametag: (itemId: string, nametag: string) => void;
  updateCharm: (itemId: string, hasCharm: boolean) => void;
  updateGiftBox: (itemId: string, hasGiftBox: boolean) => void;
  updateExtraItems: (itemId: string, hasExtraItems: boolean) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

const KEYCHAIN_PRICE = 49000; // Price per keychain in VND
const CHARM_PRICE = 6000; // Price for "Sac Viet" charm in VND
const GIFT_BOX_PRICE = 40000; // Price for "20.10 Gift Box" in VND
const EXTRA_ITEMS_PRICE = 0; // Price for "Extra Items + Gift Packaging" (free with keychain)
const CART_VERSION = '2.3'; // Version to force cart refresh when new items added

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<KeychainItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('pixself-cart');
      const savedVersion = localStorage.getItem('pixself-cart-version');
      
      if (savedCart && savedVersion === CART_VERSION) {
        const parsedCart = JSON.parse(savedCart);
        // Convert date strings back to Date objects and ensure correct price
        const itemsWithDates = parsedCart.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          price: KEYCHAIN_PRICE, // Force update to current price
          hasCharm: item.hasCharm || false, // Ensure hasCharm exists
          hasGiftBox: item.hasGiftBox || false, // Ensure hasGiftBox exists
          hasExtraItems: item.hasExtraItems || false // Ensure hasExtraItems exists
        }));
        setItems(itemsWithDates);
      } else {
        // Clear old cart data if version mismatch
        localStorage.removeItem('pixself-cart');
        localStorage.setItem('pixself-cart-version', CART_VERSION);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem('pixself-cart');
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem('pixself-cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items]);

  const itemCount = items.length;
  const totalPrice = items.reduce((total, item) => {
    return total + KEYCHAIN_PRICE + (item.hasCharm ? CHARM_PRICE : 0) + (item.hasGiftBox ? GIFT_BOX_PRICE : 0) + (item.hasExtraItems && item.hasGiftBox ? 0 : EXTRA_ITEMS_PRICE);
  }, 0);

  const addItem = useCallback((pngDataUrl: string): string => {
    const newItem: KeychainItem = {
      id: `keychain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pngDataUrl,
      nametag: '', // Will be filled by user
      createdAt: new Date(),
      price: KEYCHAIN_PRICE,
      hasCharm: false, // Default to no charm
      hasGiftBox: false, // Default to no gift box
      hasExtraItems: false, // Default to no extra items (will be auto-enabled with gift box)
    };

    setItems(prev => [...prev, newItem]);
    return newItem.id;
  }, []);

  const updateNametag = useCallback((itemId: string, nametag: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, nametag } : item
      )
    );
  }, []);

  const updateCharm = useCallback((itemId: string, hasCharm: boolean) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, hasCharm } : item
      )
    );
  }, []);

  const updateGiftBox = useCallback((itemId: string, hasGiftBox: boolean) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, hasGiftBox, hasExtraItems: hasGiftBox } : item
      )
    );
  }, []);

  const updateExtraItems = useCallback((itemId: string, hasExtraItems: boolean) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, hasExtraItems } : item
      )
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('pixself-cart');
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const contextValue: CartContextType = {
    items,
    itemCount,
    totalPrice,
    addItem,
    updateNametag,
    updateCharm,
    updateGiftBox,
    updateExtraItems,
    removeItem,
    clearCart,
    isCartOpen,
    openCart,
    closeCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}
