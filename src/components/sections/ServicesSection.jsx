import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  BarChart2, 
  DollarSign, 
  Target, 
  Shield 
} from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import Button from '../common/Button';

// Animated gradient keyframes
const gradientAnimation = {
  backgroundPosition: [
    '0% 50%',
    '100% 50%',
    '0% 50%'
  ],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: 'linear',
  },
};

// Shimmer animation for gradient text
const shimmerAnimation = {
  backgroundPosition: [
    '0% 50%',
    '100% 50%',
    '0% 50%'
  ],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: 'linear',
  },
};

// Staggered animation for cards
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60, damping: 14 } },
};

const ServicesSection = () => {
  const services = [
    {
      icon: TrendingUp,
      title: 'Growth Strategy',
      description: 'Strategi pertumbuhan yang disesuaikan dengan niche dan target audiens Anda',
      color: 'text-meta-blue',
    },
    {
      icon: Users,
      title: 'Community Building',
      description: 'Membangun dan mengelola komunitas yang loyal dan aktif',
      color: 'text-green-500',
    },
    {
      icon: BarChart2,
      title: 'Analytics & Insights',
      description: 'Analisis data mendalam untuk mengoptimalkan performa konten',
      color: 'text-yellow-500',
    },
    {
      icon: DollarSign,
      title: 'Monetization',
      description: 'Strategi monetisasi yang berkelanjutan dan menguntungkan',
      color: 'text-purple-500',
    },
    {
      icon: Target,
      title: 'Brand Partnerships',
      description: 'Koneksi dengan brand ternama untuk kolaborasi yang menguntungkan',
      color: 'text-red-500',
    },
    {
      icon: Shield,
      title: 'Legal Protection',
      description: 'Perlindungan hukum dan bantuan dalam mengelola kontrak',
      color: 'text-cyan-500',
    },
  ];

  // SVG background as a string
  const svgBg = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  const { theme } = useThemeStore();

  return (
    <section className={`py-24 relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-black' : 'bg-white'}`}
      aria-labelledby="services-heading"
    >
      {/* Animated Floating SVG/Blob with parallax */}
      <motion.div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-[400px] h-[400px] z-0"
        initial={{ scale: 1, rotate: 0, x: 0, y: 0 }}
        animate={{ 
          scale: [1, 1.08, 1], 
          rotate: [0, 8, -8, 0],
          x: [0, 30, -30, 0],
          y: [0, 20, -20, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        style={{ filter: 'blur(32px)', opacity: 0.18 }}
      >
        <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="200" cy="200" rx="180" ry="120" fill="url(#paint0_radial)" />
          <defs>
            <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(200 200) scale(180 120)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22d3ee" />
              <stop offset="1" stopColor="#2563eb" stopOpacity="0.7" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{ backgroundImage: svgBg }}
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.h2
              id="services-heading"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`text-4xl md:text-5xl font-display font-bold mb-6 transition-colors duration-500 inline-block relative ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}
            >
              Layanan Kami
              <motion.span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-meta-blue to-cyan-500 animate-gradient bg-[length:200%_200%]"
                style={{ backgroundPosition: '0% 50%' }}
                animate={shimmerAnimation}
              >
                Untuk Creator
              </motion.span>
              {/* Animated underline */}
              <motion.span
                className="absolute left-1/2 -bottom-2 -translate-x-1/2 h-1 w-32 rounded-full bg-gradient-to-r from-meta-blue to-cyan-400"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                style={{ transformOrigin: 'center' }}
              />
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`text-xl max-w-3xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}
            >
              Kami menyediakan berbagai layanan untuk membantu creator mencapai kesuksesan mereka
            </motion.p>
          </div>

          {/* Services Grid with staggered animation */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  variants={cardVariants}
                  whileHover={{ 
                    scale: 1.08,
                    rotate: 2,
                    boxShadow: "0 12px 32px 0 rgba(34,197,246,0.18)",
                    background: 'linear-gradient(135deg, rgba(34,197,246,0.08) 0%, rgba(14,165,233,0.08) 100%)',
                  }}
                  whileTap={{ scale: 0.97 }}
                  tabIndex={0}
                  aria-label={service.title}
                  role="article"
                  className="relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-meta-blue focus-visible:ring-offset-2"
                  style={{ perspective: 800 }}
                  animate={{ y: [0, -8, 0], boxShadow: [
                    '0 12px 32px 0 rgba(34,197,246,0.10)',
                    '0 24px 48px 0 rgba(34,197,246,0.16)',
                    '0 12px 32px 0 rgba(34,197,246,0.10)'
                  ] }}
                  transition={{ duration: 4.5 + index * 0.2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
                >
                  {/* Enhanced glow behind icon */}
                  <motion.div 
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-meta-blue/40 to-cyan-400/30 blur-2xl z-0"
                    animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className={`relative backdrop-blur-sm rounded-xl p-8 h-full border shadow-lg transition-colors duration-500 ${theme === 'dark' ? 'bg-black/50 border-meta-gray-800' : 'bg-white border-meta-gray-200'}`}>
                    <motion.div 
                      className={`${service.color} mb-6 relative z-10`}
                      animate={{ scale: [1, 1.13, 1], rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
                    >
                      <Icon className="w-12 h-12" />
                    </motion.div>
                    <h3 className={`text-xl font-bold mb-4 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{service.title}</h3>
                    <p className={`${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>{service.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <p className="text-xl text-meta-gray-300 mb-8">
              Siap untuk memulai perjalanan Anda sebagai creator sukses?
            </p>
            <motion.div
              animate={{
                scale: [1, 1.04, 1],
                boxShadow: [
                  '0 0 0 0 rgba(34,197,246,0.10)',
                  '0 0 32px 0 rgba(34,197,246,0.18)',
                  '0 0 0 0 rgba(34,197,246,0.10)'
                ]
              }}
              transition={{ duration: 2.8, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
              className="inline-block"
            >
              <Button
                as="a"
                href="/join"
                size="lg"
                variant="primary"
                className="rounded-full px-8 py-4 text-lg group"
                aria-label="Daftar Sekarang"
              >
                <span className="inline-flex items-center">
                  Daftar Sekarang
                  <motion.svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    initial={{ x: 0 }}
                    whileHover={{ x: 8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </motion.svg>
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection; 