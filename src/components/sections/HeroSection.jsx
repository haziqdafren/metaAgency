import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import useThemeStore from '../../store/themeStore';

const HeroSection = () => {
  const { theme } = useThemeStore();

  const stats = [
    { icon: Users, label: 'Creator Aktif', value: '120+', color: 'text-meta-blue' },
    { icon: TrendingUp, label: 'Diamonds / Bulan', value: '500K+', color: 'text-green-500' },
    { icon: Award, label: 'Bergabung Sejak', value: '2024', color: 'text-yellow-500' },
  ];

  // SVG background as a string
  const svgBg = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-black' : 'bg-white'}`}>
      {/* Background Video/Image Placeholder */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-b from-black via-black/50 to-black' : 'bg-gradient-to-b from-white via-meta-gray-100/80 to-white'}`} />
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: svgBg }}
        />
      </div>

      {/* Subtle background accent */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 bg-meta-blue rounded-full blur-3xl ${theme === 'dark' ? 'opacity-10' : 'opacity-5'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500 rounded-full blur-3xl ${theme === 'dark' ? 'opacity-10' : 'opacity-5'}`} />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`inline-flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-white/10' : 'bg-meta-gray-100/80'} backdrop-blur-sm rounded-full mb-8`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-meta-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-meta-blue"></span>
            </span>
            <span className={`text-sm ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}>Official TikTok Partner Agency</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-5xl md:text-7xl font-display font-black mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}
          >
            Wujudkan Potensi
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-meta-blue to-cyan-500">
              Creator TikTok Anda
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}
          >
            Kami membantu creator TikTok tumbuh secara konsisten — dari manajemen akun, strategi LIVE, hingga pembayaran bonus yang transparan.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12"
          >
            <Link 
              to="/join" 
              className="group btn btn-primary px-8 py-4 text-lg flex items-center space-x-2"
            >
              <span>Daftar Sekarang</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            {/* <button className="group btn btn-secondary px-8 py-4 text-lg flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Lihat Video</span>
            </button> */}
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className={`rounded-xl p-6 border transition-colors duration-300 ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white border-gray-200 shadow-sm'
                  }`}
                >
                  <Icon className={`w-7 h-7 ${stat.color} mb-3 mx-auto`} />
                  <h3 className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                    {stat.value}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-meta-gray-600 rounded-full flex justify-center"
        >
          <div className="w-1 h-3 bg-meta-gray-600 rounded-full mt-2" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection; 