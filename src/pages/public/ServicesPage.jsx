import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  BarChart2, 
  Calendar, 
  Target,
  Award,
  Zap
} from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  const services = [
    {
      id: 'talent-management',
      title: 'Manajemen Talent',
      description: 'Pengelolaan profesional untuk creator TikTok',
      icon: Users,
      features: [
        'Strategi konten yang disesuaikan',
        'Jadwal posting yang optimal',
        'Analisis performa konten',
        'Manajemen komunitas',
        'Konsultasi personal branding',
      ],
      benefits: [
        'Pertumbuhan followers yang konsisten',
        'Engagement rate yang lebih tinggi',
        'Monetisasi yang optimal',
        'Brand image yang profesional',
      ],
    },
    {
      id: 'education',
      title: 'Edukasi Creator',
      description: 'Pelatihan dan workshop untuk meningkatkan skill content creation',
      icon: BookOpen,
      features: [
        'Workshop content creation',
        'Pelatihan algoritma TikTok',
        'Tips editing video',
        'Strategi engagement',
        'Analisis trend',
      ],
      benefits: [
        'Pemahaman platform yang lebih baik',
        'Skill content creation yang meningkat',
        'Konten yang lebih engaging',
        'Pertumbuhan yang lebih cepat',
      ],
    },
    {
      id: 'endorsement',
      title: 'Fasilitasi Endorsement',
      description: 'Menghubungkan creator dengan brand yang sesuai',
      icon: Target,
      features: [
        'Pencocokan dengan brand yang relevan',
        'Negosiasi kontrak',
        'Manajemen kolaborasi',
        'Analisis performa campaign',
        'Laporan hasil',
      ],
      benefits: [
        'Pendapatan tambahan yang stabil',
        'Portfolio brand yang berkualitas',
        'Networking yang luas',
        'Pengalaman profesional',
      ],
    },
    {
      id: 'analytics',
      title: 'Analitik Performa',
      description: 'Analisis mendalam untuk optimasi konten',
      icon: BarChart2,
      features: [
        'Analisis performa konten',
        'Tracking metrics penting',
        'Laporan performa mingguan',
        'Rekomendasi optimasi',
        'Benchmark dengan creator lain',
      ],
      benefits: [
        'Konten yang lebih efektif',
        'Pertumbuhan yang terukur',
        'ROI yang lebih baik',
        'Strategi yang data-driven',
      ],
    },
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
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Layanan Kami</h1>
            <p className={`text-xl transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-black'}`}>Solusi komprehensif untuk mengembangkan karir creator TikTok Anda</p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className={`py-20 transition-colors duration-500 ${theme === 'dark' ? '' : ''}`}>
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-xl p-8 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900/50' : 'bg-white border border-meta-gray-200'}`}
                >
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="p-3 bg-meta-blue/10 rounded-lg">
                      <Icon className="w-6 h-6 text-meta-blue" />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                        {service.title}
                      </h2>
                      <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-black'}`}>
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 flex items-center transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                        <Calendar className="w-5 h-5 text-meta-blue mr-2" />
                        Fitur Utama
                      </h3>
                      <ul className="space-y-3">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <Zap className="w-5 h-5 text-meta-blue mr-2 mt-0.5" />
                            <span className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-black'}`}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className={`text-lg font-semibold mb-4 flex items-center transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                        <Award className="w-5 h-5 text-meta-blue mr-2" />
                        Manfaat
                      </h3>
                      <ul className="space-y-3">
                        {service.benefits.map((benefit) => (
                          <li key={benefit} className="flex items-start">
                            <TrendingUp className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                            <span className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-black'}`}>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className={`py-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900/50' : 'bg-meta-gray-100/80'}`}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Proses Kerja Kami</h2>
            <p className={`max-w-2xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-black'}`}>
              Kami mengikuti proses yang terstruktur untuk memastikan hasil terbaik bagi setiap creator
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Konsultasi Awal',
                description: 'Diskusi mendalam tentang goals dan ekspektasi creator',
                color: 'text-meta-blue',
              },
              {
                step: '02',
                title: 'Analisis Profil',
                description: 'Evaluasi performa dan potensi akun TikTok',
                color: 'text-purple-500',
              },
              {
                step: '03',
                title: 'Strategi & Implementasi',
                description: 'Pengembangan dan eksekusi strategi konten',
                color: 'text-green-500',
              },
              {
                step: '04',
                title: 'Monitoring & Optimasi',
                description: 'Pemantauan performa dan penyesuaian strategi',
                color: 'text-yellow-500',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-meta-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-meta-blue">{item.step}</span>
                </div>
                <h3 className={`text-xl font-bold mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{item.title}</h3>
                <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-black'}`}>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Siap Mengembangkan Karir Anda?</h2>
            <p className={`text-xl mb-8 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-black'}`}>
              Jangan lewatkan kesempatan untuk berkembang bersama Meta Agency.
            </p>
            <Link
              to="/join"
              className="btn btn-primary px-8 py-3 text-lg"
            >
              Gabung Sekarang
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage; 