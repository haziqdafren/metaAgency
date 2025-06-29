import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, TrendingUp, Heart } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import Button from '../../components/common/Button';

const AboutPage = () => {
  const stats = [
    { icon: Users, value: '800+', label: 'Active Creators', color: 'text-meta-blue' },
    { icon: TrendingUp, value: '₹2.5B+', label: 'Monthly Revenue', color: 'text-green-500' },
    { icon: Award, value: '95%', label: 'Success Rate', color: 'text-yellow-500' },
    { icon: Heart, value: '50M+', label: 'Total Followers', color: 'text-red-500' },
  ];

  const { theme } = useThemeStore();

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      {/* Hero Section */}
      <section className={`relative py-20 overflow-hidden transition-colors duration-500`}>
        <div className="absolute inset-0 bg-gradient-to-b from-meta-blue/20 to-transparent" />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 left-10 w-40 h-40 bg-meta-blue rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-500 rounded-full blur-3xl opacity-30"
        />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Tentang Meta Agency</h1>
            <p className={`text-xl transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>Partner resmi TikTok untuk mengelola dan mengembangkan creator Indonesia</p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900/50' : 'bg-meta-gray-100/80'}`}>
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.7, delay: index * 0.1, type: 'spring', bounce: 0.4 }}
                  className="text-center relative"
                >
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-meta-blue/30 to-cyan-500/20 blur-2xl opacity-60" />
                  <Icon className={`w-12 h-12 ${stat.color} mx-auto mb-4 relative z-10`} />
                  <div className={`text-3xl font-bold mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{stat.value}</div>
                  <div className={`${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={`py-20 transition-colors duration-500`}>
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={`text-3xl font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Misi Kami</h2>
              <p className={`transition-colors duration-500 mb-6 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>Meta Agency berkomitmen untuk membantu creator Indonesia mencapai potensi maksimal mereka di platform TikTok. Kami menyediakan dukungan komprehensif dalam manajemen talent, edukasi creator, dan fasilitasi endorsement.</p>
              <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>Dengan pengalaman kami sebagai partner resmi TikTok, kami memahami betul bagaimana mengoptimalkan performa creator dan membantu mereka mencapai kesuksesan dalam karir konten mereka.</p>
            </motion.div>

            <motion.div>
              <div
                className="mx-auto flex items-center justify-center rounded-xl overflow-hidden bg-transparent transition-all duration-500 max-w-[180px] 
                sm:max-w-[200px] md:max-w-[240px] lg:max-w-[280px] shadow-[0_0_40px_15px_rgba(34,197,246,0.4)]"
              >
                <img
                  src={theme === 'dark' ? '/meta.webp' : '/meta.svg'}
                  alt="Logo Meta Agency"
                  className="w-full h-auto object-contain"
                />
              </div>

            </motion.div>



          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={`py-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900/50' : 'bg-meta-gray-100/80'}`}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Layanan Kami</h2>
            <p className={`max-w-2xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>Kami menyediakan berbagai layanan untuk membantu creator berkembang dan sukses di platform TikTok</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Manajemen Talent',
                description: 'Pengelolaan profesional untuk creator, termasuk strategi konten, jadwal posting, dan analisis performa.',
              },
              {
                title: 'Edukasi Creator',
                description: 'Pelatihan dan workshop untuk meningkatkan skill content creation dan memahami algoritma TikTok.',
              },
              {
                title: 'Fasilitasi Endorsement',
                description: 'Menghubungkan creator dengan brand yang sesuai dan mengelola kolaborasi secara profesional.',
              },
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.06, boxShadow: '0 8px 32px 0 rgba(34,197,246,0.10)' }}
                whileTap={{ scale: 0.97 }}
                className={`rounded-xl p-6 transition-colors duration-500 shadow-lg border ${theme === 'dark' ? 'bg-meta-gray-800/50 border-meta-gray-700' : 'bg-white border-meta-gray-200'}`}
              >
                <h3 className={`text-xl font-bold mb-4 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{service.title}</h3>
                <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900/50' : 'bg-meta-gray-100/80'}`}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className={`text-3xl font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Bergabunglah Bersama Kami</h2>
            <Button
              as="a"
              href="/join"
              size="lg"
              variant="primary"
              className="rounded-full px-8 py-4 text-lg"
            >
              Daftar Sekarang
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
