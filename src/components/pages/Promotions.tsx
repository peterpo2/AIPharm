import React from 'react';
import { Tag, Clock, Gift, Percent, Star, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Promotions: React.FC = () => {
  const { t } = useLanguage();

  const promotions = [
    {
      id: 1,
      title: t('promotions.freeDelivery'),
      description: t('promotions.freeDeliveryDesc'),
      discount: t('promotions.free'),
      icon: Gift,
      color: 'green',
      validUntil: '31.12.2024'
    },
    {
      id: 2,
      title: t('promotions.vitamins20'),
      description: t('promotions.vitamins20Desc'),
      discount: '20%',
      icon: Percent,
      color: 'blue',
      validUntil: '15.01.2025'
    },
    {
      id: 3,
      title: t('promotions.firstOrder'),
      description: t('promotions.firstOrderDesc'),
      discount: '15%',
      icon: Star,
      color: 'purple',
      validUntil: '28.02.2025'
    },
    {
      id: 4,
      title: t('promotions.loyaltyProgram'),
      description: t('promotions.loyaltyProgramDesc'),
      discount: t('promotions.points'),
      icon: Gift,
      color: 'orange',
      validUntil: t('promotions.permanent')
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'from-green-500 to-emerald-500 bg-green-100 text-green-800 border-green-200',
      blue: 'from-blue-500 to-cyan-500 bg-blue-100 text-blue-800 border-blue-200',
      purple: 'from-purple-500 to-pink-500 bg-purple-100 text-purple-800 border-purple-200',
      orange: 'from-orange-500 to-red-500 bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('footer.promotions')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('promotions.description')}
          </p>
        </div>

        {/* Current Promotions */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {promotions.map((promo) => {
            const IconComponent = promo.icon;
            const colorClasses = getColorClasses(promo.color);
            
            return (
              <div key={promo.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className={`bg-gradient-to-r ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{promo.discount}</div>
                      <div className="text-sm opacity-90">{t('promotions.discount')}</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{promo.title}</h3>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 mb-4 leading-relaxed">{promo.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{t('promotions.validUntil')}: {promo.validUntil}</span>
                    </div>
                    <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                      <span>{t('promotions.useNow')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* How to Use */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Tag className="w-6 h-6 mr-3 text-primary-600" />
            {t('promotions.howToUse')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('promotions.step1')}</h3>
              <p className="text-gray-600 text-sm">{t('promotions.step1Desc')}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-secondary-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('promotions.step2')}</h3>
              <p className="text-gray-600 text-sm">{t('promotions.step2Desc')}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('promotions.step3')}</h3>
              <p className="text-gray-600 text-sm">{t('promotions.step3Desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotions;