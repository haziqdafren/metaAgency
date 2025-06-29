import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

const JoinPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username_tiktok: '',
    followers_count: '',
    konten_kategori: '',
    experience: '',
  });

  const [error, setError] = useState('');
  const { theme } = useThemeStore();

  const handleSubmit = (e) => {
    e.preventDefault();

    const {
      name,
      email,
      phone,
      username_tiktok,
      followers_count,
      konten_kategori,
      experience,
    } = formData;

    if (
      !name ||
      !email ||
      !phone ||
      !username_tiktok ||
      !followers_count ||
      !konten_kategori ||
      !experience
    ) {
      alert('Mohon lengkapi semua isian');
      return;
    }

    const message = `Halo Admin Meta Agency! Saya ingin mendaftar sebagai talent:\n\n` +
      `Nama: ${name}\n` +
      `Email: ${email}\n` +
      `No. HP: ${phone}\n` +
      `Username TikTok: ${username_tiktok}\n` +
      `Jumlah Followers: ${followers_count}\n` +
      `Kategori Konten: ${konten_kategori}\n` +
      `Pengalaman: ${experience}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '62895360039764';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    alert('Terima kasih! Anda akan diarahkan ke WhatsApp untuk mengirim data ke admin.');
    window.open(whatsappURL, '_blank');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const benefits = [
    'Manajemen talent profesional',
    'Pelatihan dan workshop rutin',
    'Akses ke brand partnerships',
    'Analisis performa konten',
    'Monetisasi yang optimal',
    'Networking dengan creator lain',
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-meta-blue/20 to-transparent" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
              Bergabung Bersama Kami
            </h1>
            <p className={`text-xl transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}>
              Jadilah bagian dari komunitas creator sukses Meta Agency
            </p>
          </motion.div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Benefits Card */}
          <div className={`rounded-xl p-8 border transition-colors duration-500 ${theme === 'dark' ? 'bg-black/50 border-meta-gray-800 text-white' : 'bg-white border-meta-gray-200 text-meta-black'}`}>
            <h2 className="text-2xl font-bold mb-6">Keuntungan Bergabung</h2>
            <ul className="space-y-3 mb-8">
              {benefits.map((benefit) => (
                <li key={benefit} className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>
                  <Check className="w-5 h-5 text-meta-blue" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className={`rounded-lg p-4 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900/60 text-meta-gray-300' : 'bg-white border border-meta-gray-200 text-meta-gray-600'}`}> 
              <div className="font-semibold mb-2">Persyaratan</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Minimal 10K followers di TikTok</li>
                <li>Konten original dan berkualitas</li>
                <li>Konsisten dalam posting</li>
                <li>Memiliki passion di bidang konten</li>
                <li>Bersedia mengikuti program kami</li>
              </ul>
            </div>
          </div>

          {/* Registration Form Card */}
          <div className={`rounded-xl p-8 border transition-colors duration-500 ${theme === 'dark' ? 'bg-black/50 border-meta-gray-800 text-white' : 'bg-white border-meta-gray-200 text-meta-black'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Formulir Pendaftaran</h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-500 mb-6">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {[
                { id: 'name', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan nama lengkap' },
                { id: 'email', label: 'Email', type: 'email', placeholder: 'nama@email.com' },
                { id: 'phone', label: 'Nomor Telepon', type: 'tel', placeholder: '+62 812-3456-7890' },
                { id: 'username_tiktok', label: 'Username TikTok', type: 'text', placeholder: '@username' },
                { id: 'followers_count', label: 'Jumlah Followers', type: 'number', placeholder: '10000', min: 10000 },
              ].map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id} className={`block text-sm font-medium mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>{field.label}</label>
                  <input
                    type={field.type}
                    id={field.id}
                    name={field.id}
                    value={formData[field.id]}
                    onChange={handleChange}
                    required
                    min={field.min}
                    className={`w-full px-4 py-3 rounded-lg transition-colors duration-500 border focus:outline-none focus:ring-2 focus:ring-meta-blue focus:border-transparent ${theme === 'dark' ? 'bg-meta-gray-900 border-meta-gray-800 text-white placeholder-meta-gray-500' : 'bg-white border-meta-gray-200 text-meta-black placeholder-meta-gray-400'}`}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
              <div>
                <label htmlFor="konten_kategori" className={`block text-sm font-medium mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>Kategori Konten</label>
                <select
                  id="konten_kategori"
                  name="konten_kategori"
                  value={formData.konten_kategori}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg transition-colors duration-500 border focus:outline-none focus:ring-2 focus:ring-meta-blue focus:border-transparent ${theme === 'dark' ? 'bg-meta-gray-900 border-meta-gray-800 text-white' : 'bg-white border-meta-gray-200 text-meta-black'}`}
                >
                  <option value="">Pilih kategori</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="education">Education</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="business">Business</option>
                </select>
              </div>
              <div>
                <label htmlFor="experience" className={`block text-sm font-medium mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>Pengalaman Content Creation</label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg transition-colors duration-500 border focus:outline-none focus:ring-2 focus:ring-meta-blue focus:border-transparent ${theme === 'dark' ? 'bg-meta-gray-900 border-meta-gray-800 text-white placeholder-meta-gray-500' : 'bg-white border-meta-gray-200 text-meta-black placeholder-meta-gray-400'}`}
                  placeholder="Ceritakan pengalaman Anda dalam membuat konten..."
                />
              </div>
              <button
                type="submit"
                className="w-full btn btn-primary py-3 px-4 text-base font-medium"
              >
                Daftar
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JoinPage;
