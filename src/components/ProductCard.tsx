import React from 'react';
import { ShoppingCart, Star, MessageCircle, Shield, Heart, Package } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useChat } from '../context/ChatContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { dispatch } = useCart();
  const { askAssistant } = useChat();
  const { language, t } = useLanguage();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    const productName = language === 'bg' ? product.name : product.nameEn;
    const question = language === 'bg' 
      ? `Разкажете ми за ${productName}` 
      : `Tell me about ${productName}`;
    askAssistant(question, product.id);
  };

  const getProductName = () => language === 'bg' ? product.name : product.nameEn;
  const getProductDescription = () => language === 'bg' ? product.description : product.descriptionEn;
  const getActiveIngredient = () => language === 'bg' ? product.activeIngredient : product.activeIngredientEn;
  const getDosage = () => language === 'bg' ? product.dosage : product.dosageEn;
  const getManufacturer = () => language === 'bg' ? product.manufacturer : product.manufacturerEn;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.imageUrl}
          alt={getProductName()}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.requiresPrescription && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>{t('products.prescription')}</span>
          </div>
        )}
        <button className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors duration-200" />
        </button>
        
        {/* Stock indicator */}
        <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
          product.stockQuantity > 10
            ? 'bg-green-100 text-green-800'
            : product.stockQuantity > 0
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          <Package className="w-3 h-3 inline mr-1" />
          {product.stockQuantity > 10 
            ? t('products.inStock')
            : product.stockQuantity > 0
            ? `${product.stockQuantity} ${t('products.pieces')}`
            : t('products.outOfStock')
          }
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating!)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300">
          {getProductName()}
        </h3>

        {/* Details */}
        <div className="space-y-1 mb-4 text-sm text-gray-600">
          {getActiveIngredient() && (
            <p>
              <span className="font-medium">{t('products.activeIngredient')}:</span> {getActiveIngredient()}
            </p>
          )}
          {getDosage() && (
            <p>
              <span className="font-medium">{t('products.dosage')}:</span> {getDosage()}
            </p>
          )}
          {getManufacturer() && (
            <p>
              <span className="font-medium">{t('products.manufacturer')}:</span> {getManufacturer()}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-emerald-600">
            €{product.price.toFixed(2)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group/btn hover:scale-105"
          >
            <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
            <span>{t('products.add')}</span>
          </button>
          
          <button
            onClick={handleAskAI}
            className="p-3 bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;