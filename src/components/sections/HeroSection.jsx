import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Users, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import useThemeStore from '../../store/themeStore';

// 3D illustration asset (replace with your own or use /public/meta.webp)
import meta3D from '../../logo.svg'; // fallback if you want to use a local SVG

const HeroSection = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const { theme } = useThemeStore();

  const stats = [
    { icon: Users, label: 'Active Creators', value: '800+', color: 'text-meta-blue' },
    { icon: TrendingUp, label: 'Monthly Revenue', value: 'Rp. 100M+', color: 'text-green-500' },
    { icon: Award, label: 'Success Rate', value: '95%', color: 'text-yellow-500' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-meta-blue rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"
        />
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
            className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}
          >
            Bergabunglah dengan 800+ creator sukses yang telah mengembangkan karir mereka bersama Meta Agency
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

          {/* Animated Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    scale: currentStat === index ? 1.05 : 1,
                    opacity: currentStat === index ? 1 : 0.7,
                  }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-meta-blue/20 to-cyan-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                  <div className={`relative backdrop-blur-sm rounded-xl p-6 border transition-colors duration-500 ${theme === 'dark' ? 'bg-black/50 border-meta-gray-800' : 'bg-white border-meta-gray-200'}`}>
                    <Icon className={`w-8 h-8 ${stat.color} mb-3 mx-auto`} />
                    <h3 className={`text-3xl font-bold mb-1 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{stat.value}</h3>
                    <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-black'}`}>{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
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