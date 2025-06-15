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
    <section className={`py-24 relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-black' : 'bg-white'}`}>
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`text-4xl md:text-5xl font-display font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}
            >
              Layanan Kami
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-meta-blue to-cyan-500">
                Untuk Creator
              </span>
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

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-meta-blue/20 to-cyan-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                  <div className={`relative backdrop-blur-sm rounded-xl p-8 h-full border transition-colors duration-500 ${theme === 'dark' ? 'bg-black/50 border-meta-gray-800' : 'bg-white border-meta-gray-200'}`}>
                    <div className={`${service.color} mb-6`}>
                      <Icon className="w-12 h-12" />
                    </div>
                    <h3 className={`text-xl font-bold mb-4 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{service.title}</h3>
                    <p className={`${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>{service.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

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
            <a
              href="/join"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-meta-blue to-cyan-500 text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              <span>Daftar Sekarang</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection; 