import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Award, Star } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

const AboutSection = () => {
  const features = [
    {
      icon: Users,
      title: 'Komunitas Besar',
      description: 'Bergabung dengan 800+ creator aktif yang saling mendukung dan berkolaborasi',
      color: 'text-meta-blue',
    },
    {
      icon: TrendingUp,
      title: 'Pertumbuhan Cepat',
      description: 'Program pelatihan dan mentoring yang terbukti meningkatkan performa creator',
      color: 'text-green-500',
    },
    {
      icon: Award,
      title: 'Partner Resmi',
      description: 'Status sebagai TikTok Partner Agency yang diakui secara resmi',
      color: 'text-yellow-500',
    },
    {
      icon: Star,
      title: 'Dukungan Penuh',
      description: 'Tim profesional yang siap membantu 24/7 untuk kesuksesan creator',
      color: 'text-purple-500',
    },
  ];

  // Stats for AboutSection
  const stats = [
    { icon: Users, value: '800+', label: 'Active Creators', color: 'text-meta-blue' },
    { icon: TrendingUp, value: 'Rp.100M+', label: 'Monthly Revenue', color: 'text-green-500' },
    { icon: Award, value: '95%', label: 'Success Rate', color: 'text-yellow-500' },
  ];

  // SVG background as a string
  const svgBg = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  const { theme } = useThemeStore();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className={`py-24 relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-black' : 'bg-white'}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
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
        <div
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{ backgroundImage: svgBg }}
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2
              variants={itemVariants}
              className={`text-4xl md:text-5xl font-display font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}
            >
              Mengapa Memilih
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-meta-blue to-cyan-500"
              >
                Meta Agency?
              </motion.span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className={`text-xl max-w-3xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}
            >
              Kami adalah partner resmi TikTok yang telah membantu ratusan creator mencapai kesuksesan mereka
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.08,
                    boxShadow: "0 12px 32px 0 rgba(34,197,246,0.18)",
                    background: 'linear-gradient(135deg, rgba(34,197,246,0.08) 0%, rgba(14,165,233,0.08) 100%)',
                    transition: { duration: 0.25 }
                  }}
                  whileTap={{ scale: 0.97 }}
                  tabIndex={0}
                  className="relative group perspective-1000 focus:outline-none focus-visible:ring-2 focus-visible:ring-meta-blue focus-visible:ring-offset-2"
                >
                  {/* Soft glow behind icon */}
                  <motion.div 
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-meta-blue/30 to-cyan-500/20 blur-2xl z-0"
                  />
                  <div className={`relative backdrop-blur-sm rounded-xl p-8 h-full border shadow-lg transition-colors duration-500 transform-gpu ${theme === 'dark' ? 'bg-black/50 border-meta-gray-800' : 'bg-white border-meta-gray-200'}`}>
                    <motion.div 
                      className={`${feature.color} mb-6 relative z-10`}
                      whileHover={{ scale: 1.18, rotate: 8 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 12 }}
                    >
                      <Icon className="w-12 h-12" />
                    </motion.div>
                    <motion.h3 
                      className={`text-xl font-bold mb-4 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <motion.p 
                      className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-black'}`}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {feature.description}
                    </motion.p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Stats Section - entrance animation */}
          <motion.div
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`flex flex-col items-center justify-center rounded-xl p-8 shadow-md border transition-colors duration-500 ${theme === 'dark' ? 'bg-black/40 border-meta-gray-800' : 'bg-white border-meta-gray-200'}`}
                >
                  <Icon className={`w-10 h-10 mb-3 ${stat.color}`} />
                  <span className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{stat.value}</span>
                  <span className={`text-lg ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-black'}`}>{stat.label}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection; 