'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart, KeychainItem } from '@/contexts/cart-context';
import { PixselfButton } from './pixself-ui-components';
import { Press_Start_2P } from 'next/font/google';

const press2p = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export function CartPopup() {
  const {
    items,
    itemCount,
    totalPrice,
    updateNametag,
    updateCharm,
    updateGiftBox,
    updateExtraItems,
    removeItem,
    clearCart,
    isCartOpen,
    closeCart,
  } = useCart();

  // Debug: Check if updateCharm is a function
  console.log('CartPopup - updateCharm type:', typeof updateCharm);

  const [nametagInputs, setNametagInputs] = useState<Record<string, string>>({});

  const handleNametagChange = (itemId: string, value: string) => {
    // Limit to 15 characters for keychain nametag
    const truncatedValue = value.slice(0, 15);
    setNametagInputs(prev => ({ ...prev, [itemId]: truncatedValue }));
    updateNametag(itemId, truncatedValue);
  };

  const canCheckout = items.length > 0 && items.every(item => item.nametag.trim().length > 0);

  const handleCheckout = () => {
    if (canCheckout) {
      console.log('Proceeding to checkout with items:', items);
      // Navigate to checkout page
      window.location.href = '/checkout';
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={closeCart}
          />

          {/* Cart Modal */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className={`text-base font-bold text-gray-900 ${press2p.className}`}>
                    KEYCHAIN CART
                  </h2>
                  <p className="text-xs text-gray-600">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Create and download a PNG to add your first keychain!
                  </p>
                  <PixselfButton onClick={closeCart} variant="secondary" size="sm">
                    Continue Creating
                  </PixselfButton>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {items.map((item, index) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      onNametagChange={handleNametagChange}
                      onCharmChange={updateCharm}
                      onGiftBoxChange={updateGiftBox}
                      onExtraItemsChange={updateExtraItems}
                      onRemove={removeItem}
                      currentNametag={nametagInputs[item.id] || item.nametag}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="space-y-4">
                  {/* Price Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({itemCount} keychains)</span>
                      <span>{totalPrice.toLocaleString('vi-VN')} VND</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span>{totalPrice.toLocaleString('vi-VN')} VND</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {!canCheckout && (
                      <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        ⚠️ Please add nametags to all keychains before checkout
                      </div>
                    )}
                    
                    <PixselfButton
                      onClick={handleCheckout}
                      disabled={!canCheckout}
                      variant="accent"
                      size="lg"
                      icon={<CreditCard className="h-4 w-4" />}
                      className="w-full"
                    >
                      CHECKOUT {totalPrice.toLocaleString('vi-VN')} VND
                    </PixselfButton>

                    <div className="flex gap-2">
                      <PixselfButton
                        onClick={closeCart}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                      >
                        Continue Creating
                      </PixselfButton>
                      <PixselfButton
                        onClick={clearCart}
                        variant="secondary"
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                        className="px-3"
                      >
                        Clear
                      </PixselfButton>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface CartItemCardProps {
  item: KeychainItem;
  index: number;
  onNametagChange: (itemId: string, value: string) => void;
  onCharmChange: (itemId: string, hasCharm: boolean) => void;
  onGiftBoxChange: (itemId: string, hasGiftBox: boolean) => void;
  onExtraItemsChange: (itemId: string, hasExtraItems: boolean) => void;
  onRemove: (itemId: string) => void;
  currentNametag: string;
}

function CartItemCard({
  item,
  index,
  onNametagChange,
  onCharmChange,
  onGiftBoxChange,
  onExtraItemsChange,
  onRemove,
  currentNametag
}: CartItemCardProps) {
  const itemPrice = 49000 + (item.hasCharm ? 6000 : 0) + (item.hasGiftBox ? 40000 : 0) + (item.hasExtraItems ? 0 : 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4">
        {/* PNG Preview */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={item.pngDataUrl}
              alt="Keychain Preview"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Item Details */}
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Pixself Keychain #{index + 1}</h4>
              <p className="text-xs text-gray-500">
                Created {item.createdAt.toLocaleDateString()}
              </p>
              <div className="text-sm">
                <p className="font-bold text-purple-600">{itemPrice.toLocaleString('vi-VN')} VND</p>
                <div className="text-xs text-gray-500">
                  <div>Base: 49,000 VND</div>
                  {item.hasCharm && <div>+ Charm: 6,000 VND</div>}
                  {item.hasGiftBox && <div>+ Gift Box: 40,000 VND</div>}
                  {item.hasExtraItems && <div>+ Extra Items: Free</div>}
                </div>
              </div>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700 transition-colors"
              title="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Nametag Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Keychain Nametag *
            </label>
            <input
              type="text"
              value={currentNametag}
              onChange={(e) => onNametagChange(item.id, e.target.value)}
              placeholder="Enter your custom text..."
              maxLength={15}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
            />
            <div className="text-xs text-gray-500 flex justify-between">
              <span>This will be engraved on your keychain</span>
              <span>{currentNametag.length}/15</span>
            </div>
          </div>

          {/* Charm Add-on */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={item.hasCharm || false}
                onChange={(e) => {
                  console.log('Charm checkbox changed:', item.id, e.target.checked, typeof onCharmChange);
                  if (typeof onCharmChange === 'function') {
                    onCharmChange(item.id, e.target.checked);
                  } else {
                    console.error('onCharmChange is not a function:', onCharmChange);
                  }
                }}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <div className="text-xs">
                <span className="font-medium text-gray-700">Add "Sac Viet" Charm</span>
                <span className="text-purple-600 font-bold ml-1">+6,000 VND</span>
              </div>
            </label>
            <p className="text-xs text-gray-500 ml-6">Beautiful charm to complement your keychain</p>
          </div>

          {/* Gift Box Add-on */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={item.hasGiftBox || false}
                onChange={(e) => {
                  console.log('Gift box checkbox changed:', item.id, e.target.checked);
                  if (typeof onGiftBoxChange === 'function') {
                    onGiftBoxChange(item.id, e.target.checked);
                  } else {
                    console.error('onGiftBoxChange is not a function:', onGiftBoxChange);
                  }
                }}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <div className="text-xs">
                <span className="font-medium text-gray-700">Add 20.10 Gift Box</span>
                <span className="text-purple-600 font-bold ml-1">+40,000 VND</span>
              </div>
            </label>
            <p className="text-xs text-gray-500 ml-6">Special packaging for Vietnamese Women's Day</p>
          </div>

          {/* Extra Items Add-on */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={item.hasExtraItems || false}
                onChange={(e) => {
                  console.log('Extra items checkbox changed:', item.id, e.target.checked);
                  if (typeof onExtraItemsChange === 'function') {
                    onExtraItemsChange(item.id, e.target.checked);
                  } else {
                    console.error('onExtraItemsChange is not a function:', onExtraItemsChange);
                  }
                }}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <div className="text-xs">
                <span className="font-medium text-gray-700">Extra Items + Gift Packaging</span>
                <span className="text-green-600 font-bold ml-1">Free</span>
              </div>
            </label>
            <p className="text-xs text-gray-500 ml-6">Complementary gift packaging with this keychain</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
