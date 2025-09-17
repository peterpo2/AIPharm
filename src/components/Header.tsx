import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, Phone, LogOut, Settings, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import LoginModal from './auth/LoginModal';
import RegisterModal from './auth/RegisterModal';
import AIPharmLogo from './Logo';

interface HeaderProps {
  onSearch: (term: string) => void;
  searchTerm: string;
}

const Header: React.FC<HeaderProps> = ({ onSearch, searchTerm }) => {
  const { state, dispatch } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="hidden md:flex items-center justify-between py-2 text-sm text-gray-600 border-b border-gray-50">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">{t('header.phone')}</span>
            </div>
            <span className="text-emerald-600 font-medium">{t('header.freeDelivery')}</span>
          </div>
          <div className="flex items-center space-x-6">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <span className="text-emerald-600 font-medium">
                {t('header.hello')}, {user?.fullName || user?.email}
                {isAdmin && <Shield className="inline w-4 h-4 ml-1 text-amber-500" />}
              </span>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="hover:text-emerald-600 transition-colors font-medium"
              >
                {t('header.myProfile')}
              </button>
            )}
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <AIPharmLogo className="h-12" />
          </div>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('header.search')}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="relative p-3 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-all duration-200 group"
            >
              <ShoppingCart className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform duration-200" />
              {state.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {state.itemCount}
                </span>
              )}
            </button>

            {/* User */}
            <div className="relative">
              <button 
                onClick={() => isAuthenticated ? setShowUserMenu(!showUserMenu) : setShowLoginModal(true)}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isAuthenticated 
                    ? 'bg-blue-50 hover:bg-blue-100 text-blue-600' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <User className="w-6 h-6" />
                {isAdmin && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                    <Shield className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </button>

              {/* User Dropdown */}
              {showUserMenu && isAuthenticated && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user?.fullName || 'Потребител'}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    {isAdmin && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-1">
                        <Shield className="w-3 h-3 mr-1" />
                        {t('header.administrator')}
                      </span>
                    )}
                  </div>
                  <div className="py-1">
                    <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>{t('header.settings')}</span>
                    </button>
                    {isAdmin && (
                      <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>{t('header.adminPanel')}</span>
                      </button>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('header.logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <button
              className="md:hidden p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('header.search')}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white transition-all duration-200"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-3">
          <button className="block w-full text-left py-2 text-gray-700 hover:text-emerald-600 transition-colors">
            {t('categories.title')}
          </button>
          <button className="block w-full text-left py-2 text-gray-700 hover:text-emerald-600 transition-colors">
            {t('footer.promotions')}
          </button>
          <button className="block w-full text-left py-2 text-gray-700 hover:text-emerald-600 transition-colors">
            {t('footer.aboutUs')}
          </button>
          <button className="block w-full text-left py-2 text-gray-700 hover:text-emerald-600 transition-colors">
            {t('footer.contacts')}
          </button>
          {!isAuthenticated && (
            <>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="block w-full text-left py-2 text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
              >
                {t('header.login')}
              </button>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="block w-full text-left py-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                {t('header.register')}
              </button>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </header>
  );
};

export default Header;