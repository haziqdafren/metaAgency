import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Users, TrendingUp, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import { 
  MetaLogoMark, 
  IndonesianPattern, 
  CreatorIllustration,
  SuccessMetrics 
} from '../brand/MetaBrandElements';
import { 
  TikTokBounce, 
  TextReveal, 
  CulturalWave,
  CounterAnimation,
  FloatingSuccess 
} from '../brand/MetaAnimations';

const EnhancedHeroSection = () => {
  const [activeMetric, setActiveMetric] = useState(0);
  const { theme } = useThemeStore();
  
  // Real Indonesian creator success data
  const successMetrics = [
    { 
      icon: Users, 
      value: 847, 
      label: 'Creator Aktif', 
      color: 'bg-gradient-to-r from-blue-500 to-purple-600',
      subtitle: 'Dari Sabang sampai Merauke'
    },
    { 
      icon: TrendingUp, 
      value: 2.8, 
      label: 'Miliar Rupiah/Bulan', 
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
      subtitle: 'Total pendapatan creator'
    },
    { 
      icon: Award, 
      value: 94, 
      label: '% Tingkat Kesuksesan', 
      color: 'bg-gradient-to-r from-yellow-500 to-orange-600',
      subtitle: 'Creator yang capai target'
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % successMetrics.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-white via-gray-50 to-white'}`}>
      
      {/* Indonesian Cultural Pattern Background */}
      <CulturalWave>
        <IndonesianPattern className={theme === 'dark' ? 'text-white' : 'text-gray-800'} />
      </CulturalWave>

      {/* Dynamic Background Elements with Indonesian Touch */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Traditional Indonesian colors floating elements */}
        <FloatingSuccess intensity={0.5}>
          <motion.div
            className="absolute top-20 left-20 w-32 h-32 rounded-full"
            style={{ 
              background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </FloatingSuccess>
        
        <FloatingSuccess intensity={0.7}>
          <motion.div
            className="absolute bottom-32 right-32 w-40 h-40 rounded-full"
            style={{ 
              background: 'radial-gradient(circle, rgba(255,107,107,0.2) 0%, transparent 70%)'
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </FloatingSuccess>

        <FloatingSuccess intensity={0.3}>
          <motion.div
            className="absolute top-1/2 right-20 w-24 h-24 rounded-full"
            style={{ 
              background: 'radial-gradient(circle, rgba(78,205,196,0.3) 0%, transparent 70%)'
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </FloatingSuccess>
      </div>

      {/* Main Content */}
      <div className="container-custom relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Indonesian Pride Badge */}
              <TikTokBounce delay={0.2}>
                <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full mb-8 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm border border-yellow-400/30`}>
                  <div className="flex space-x-1">
                    <div className="w-3 h-2 bg-red-500 rounded-sm"></div>
                    <div className="w-3 h-2 bg-white rounded-sm"></div>
                  </div>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    #ProudlyIndonesian Creator Agency
                  </span>
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </div>
              </TikTokBounce>

              {/* Main Headline with Cultural Touch */}
              <TextReveal 
                text="Wujudkan Mimpi Creator Indonesia Mendunia"
                className={`text-4xl md:text-6xl lg:text-7xl font-display font-black mb-6 leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              />
              
              <TikTokBounce delay={0.4}>
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-red-500 to-red-600 text-4xl md:text-6xl lg:text-7xl font-display font-black mb-8">
                  Bersama Meta Agency
                </div>
              </TikTokBounce>

              {/* Indonesian-flavored Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className={`text-xl md:text-2xl mb-10 max-w-2xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} lg:mx-0 mx-auto`}
              >
                Dari Aceh sampai Papua, kami bantu creator Indonesia raih sukses di TikTok dan platform global lainnya. 
                <span className="text-yellow-600 font-semibold"> Bergotong-royong menuju kesuksesan!</span>
              </motion.p>

              {/* Enhanced CTA Buttons */}
              <TikTokBounce delay={0.8}>
                <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
                  <Link 
                    to="/join" 
                    className="group relative px-8 py-4 bg-gradient-to-r from-yellow-500 via-red-500 to-red-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <span>Gabung Sekarang</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  
                  <button className={`group flex items-center space-x-3 px-8 py-4 rounded-full border-2 border-yellow-500 text-lg font-semibold hover:bg-yellow-500 hover:text-white transition-all duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Lihat Success Story</span>
                  </button>
                </div>
              </TikTokBounce>

              {/* Success Metrics with Indonesian Touch */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {successMetrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <TikTokBounce key={metric.label} delay={1 + index * 0.1}>
                      <motion.div
                        className={`relative p-6 rounded-xl border transition-all duration-500 cursor-pointer ${
                          activeMetric === index 
                            ? 'scale-105 shadow-xl border-yellow-400' 
                            : 'hover:scale-102 border-gray-200 dark:border-gray-700'
                        } ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm`}
                        onClick={() => setActiveMetric(index)}
                      >
                        {/* Indonesian decorative corner */}
                        <div className="absolute top-2 right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full opacity-60"></div>
                        
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${metric.color}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <CounterAnimation 
                            to={metric.value} 
                            suffix={index === 1 ? 'B+' : index === 2 ? '%' : '+'} 
                          />
                        </div>
                        
                        <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {metric.label}
                        </div>
                        
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {metric.subtitle}
                        </div>
                      </motion.div>
                    </TikTokBounce>
                  );
                })}
              </div>
            </div>

            {/* Right Content - Enhanced Creator Illustration */}
            <div className="relative lg:block hidden">
              <TikTokBounce delay={1.2}>
                <CreatorIllustration className="mx-auto" />
              </TikTokBounce>
              
              {/* Floating Indonesian elements */}
              <FloatingSuccess>
                <motion.div 
                  className="absolute top-10 right-10 p-3 bg-yellow-500 rounded-full shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <span className="text-white font-bold text-sm">🇮🇩</span>
                </motion.div>
              </FloatingSuccess>
              
              <FloatingSuccess intensity={0.7}>
                <motion.div 
                  className="absolute bottom-20 left-10 p-4 bg-red-500 rounded-xl shadow-lg"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                >
                  <span className="text-white font-bold text-xs">Bangga Jadi Creator Indonesia</span>
                </motion.div>
              </FloatingSuccess>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator with Indonesian Touch */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`w-6 h-10 border-2 rounded-full flex justify-center ${theme === 'dark' ? 'border-yellow-400' : 'border-red-500'}`}
        >
          <motion.div 
            className={`w-1 h-3 rounded-full mt-2 ${theme === 'dark' ? 'bg-yellow-400' : 'bg-red-500'}`}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default EnhancedHeroSection;