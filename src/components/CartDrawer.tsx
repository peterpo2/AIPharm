import React from 'react';
import { X, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer: React.FC = () => {
  const { state, dispatch } = useCart();

  if (!state.isOpen) return null;

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={() => dispatch({ type: 'SET_CART_OPEN', payload: false })}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 animate-slide-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-display font-semibold text-gray-900">
              Количка ({state.itemCount})
            </h2>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_CART_OPEN', payload: false })}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">
                Количката е празна
              </h3>
              <p className="text-gray-600 mb-6">
                Добавете продукти, за да продължите с поръчката
              </p>
              <button
                onClick={() => dispatch({ type: 'SET_CART_OPEN', payload: false })}
                className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
              >
                Продължете пазаруването
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-display font-medium text-gray-900 mb-1">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.product.activeIngredient}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-primary-500 hover:text-primary-600 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium text-gray-900 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-primary-500 hover:text-primary-600 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            €{(item.unitPrice * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-sm text-red-600 hover:text-red-700 transition-colors"
                          >
                            Премахни
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between text-lg font-display font-semibold">
              <span>Общо:</span>
              <span className="text-primary-600">€{state.total.toFixed(2)}</span>
            </div>

            {/* Delivery info */}
            <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
              {state.total >= 25 ? (
                <span className="text-green-700">✓ Безплатна доставка</span>
              ) : (
                <span>
                  Добавете продукти за €{(25 - state.total).toFixed(2)} за безплатна доставка
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Финализиране на поръчка</span>
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_CART_OPEN', payload: false })}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
              >
                Продължете пазаруването
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;