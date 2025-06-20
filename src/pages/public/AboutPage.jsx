import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, TrendingUp, Heart } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

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
      <section className={`relative py-20 overflow-hidden transition-colors duration-500 ${theme === 'dark' ? '' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-meta-blue/20 to-transparent" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <Icon className={`w-12 h-12 ${stat.color} mx-auto mb-4`} />
                  <div className={`text-3xl font-bold mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{stat.value}</div>
                  <div className={`${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={`py-20 transition-colors duration-500 ${theme === 'dark' ? '' : ''}`}>
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
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden">
                <img
                  src="/images/about-mission.jpg"
                  alt="Meta Agency Mission"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
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
            <p className={`text-meta-gray-300 max-w-2xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>Kami menyediakan berbagai layanan untuk membantu creator berkembang dan sukses di platform TikTok</p>
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
                className={`bg-meta-gray-800/50 rounded-xl p-6 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-800/50' : 'bg-white border border-meta-gray-200'}`}>
                <h3 className={`text-xl font-bold mb-4 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{service.title}</h3>
                <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={`py-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900/50' : 'bg-meta-gray-100/80'}`}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Tim Kami</h2>
            <p className={`transition-colors duration-500 max-w-2xl mx-auto ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>Tim profesional kami terdiri dari ahli di bidang content creation, social media marketing, dan talent management</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                name: 'John Doe',
                role: 'CEO & Founder',
                image: '/images/team/john-doe.jpg',
              },
              {
                name: 'Jane Smith',
                role: 'Head of Talent Management',
                image: '/images/team/jane-smith.jpg',
              },
              {
                name: 'Mike Johnson',
                role: 'Content Strategy Director',
                image: '/images/team/mike-johnson.jpg',
              },
              {
                name: 'Sarah Williams',
                role: 'Brand Partnership Manager',
                image: '/images/team/sarah-williams.jpg',
              },
            ].map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-meta-blue to-cyan-500 rounded-full opacity-20 blur-xl" />
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-meta-gray-400">{member.role}</p>
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
            <p className={`text-meta-gray-300 mb-8 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>Jadilah bagian dari komunitas creator sukses kami dan kembangkan karir konten Anda bersama Meta Agency</p>
            <a
              href="/join"
              className="btn btn-primary px-8 py-3 text-lg"
            >
              Daftar Sekarang
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 