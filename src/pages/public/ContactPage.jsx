import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useThemeStore from '../../store/themeStore';
import { useNotification } from '../../context/NotificationContext';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { theme } = useThemeStore();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([formData]);

      if (error) throw error;

      showNotification('Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.', 'success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      showNotification(`Gagal mengirim pesan: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
              Hubungi Kami
            </h1>
            <p className={`text-xl transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}>
              Kami siap membantu Anda mengembangkan karir TikTok Anda
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={`py-20 transition-colors duration-500 ${theme === 'dark' ? '' : ''}`}>
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={`rounded-xl p-8 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900/50 border border-meta-gray-800' : 'bg-white border border-meta-gray-200'}`}>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Kirim Pesan
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className={`block text-sm font-medium mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}>Nama Lengkap</label>
                    <motion.input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-meta-blue focus:border-transparent ${theme === 'dark' ? 'bg-meta-gray-900 border-meta-gray-800 text-white placeholder-meta-gray-500' : 'bg-white border-meta-gray-200 text-meta-black placeholder-meta-gray-400'}`}
                      placeholder="Masukkan nama lengkap"
                      whileFocus={{ scale: 1.01, borderColor: "#00bcd4", boxShadow: "0 0 0 2px rgba(0, 188, 212, 0.2)" }}
                      whileHover={{ borderColor: theme === 'dark' ? "#4b5563" : "#9ca3af" }}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={`block text-sm font-medium mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}>Email</label>
                    <motion.input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-meta-blue focus:border-transparent ${theme === 'dark' ? 'bg-meta-gray-900 border-meta-gray-800 text-white placeholder-meta-gray-500' : 'bg-white border-meta-gray-200 text-meta-black placeholder-meta-gray-400'}`}
                      placeholder="nama@email.com"
                      whileFocus={{ scale: 1.01, borderColor: "#00bcd4", boxShadow: "0 0 0 2px rgba(0, 188, 212, 0.2)" }}
                      whileHover={{ borderColor: theme === 'dark' ? "#4b5563" : "#9ca3af" }}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className={`block text-sm font-medium mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}>Subjek</label>
                    <motion.input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-meta-blue focus:border-transparent ${theme === 'dark' ? 'bg-meta-gray-900 border-meta-gray-800 text-white placeholder-meta-gray-500' : 'bg-white border-meta-gray-200 text-meta-black placeholder-meta-gray-400'}`}
                      placeholder="Masukkan subjek pesan"
                      whileFocus={{ scale: 1.01, borderColor: "#00bcd4", boxShadow: "0 0 0 2px rgba(0, 188, 212, 0.2)" }}
                      whileHover={{ borderColor: theme === 'dark' ? "#4b5563" : "#9ca3af" }}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className={`block text-sm font-medium mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}>Pesan</label>
                    <motion.textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className={`w-full px-4 py-3 rounded-lg border transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-meta-blue focus:border-transparent ${theme === 'dark' ? 'bg-meta-gray-900 border-meta-gray-800 text-white placeholder-meta-gray-500' : 'bg-white border-meta-gray-200 text-meta-black placeholder-meta-gray-400'}`}
                      placeholder="Tulis pesan Anda di sini..."
                      whileFocus={{ scale: 1.01, borderColor: "#00bcd4", boxShadow: "0 0 0 2px rgba(0, 188, 212, 0.2)" }}
                      whileHover={{ borderColor: theme === 'dark' ? "#4b5563" : "#9ca3af" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn btn-primary py-3 px-4 text-base font-medium flex items-center justify-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>{isLoading ? 'Mengirim...' : 'Kirim Pesan'}</span>
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className={`rounded-xl p-8 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900/50 border border-meta-gray-800' : 'bg-white border border-meta-gray-200'}`}>
                <h2 className={`text-2xl font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Informasi Kontak</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-meta-blue/10 rounded-lg">
                      <Mail className="w-6 h-6 text-meta-blue" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold mb-1 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Email</h3>
                      <a
                        href="mailto:info@metaagency.id"
                        className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300 hover:text-white' : 'text-meta-gray-800 hover:text-meta-black'}`}
                      >
                        info@metaagency.id
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-meta-blue/10 rounded-lg">
                      <Phone className="w-6 h-6 text-meta-blue" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold mb-1 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Telepon</h3>
                      <a
                        href="tel:+6281234567890"
                        className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300 hover:text-white' : 'text-meta-gray-800 hover:text-meta-black'}`}
                      >
                        +62 812-3456-7890
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-meta-blue/10 rounded-lg">
                      <MapPin className="w-6 h-6 text-meta-blue" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold mb-1 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Alamat</h3>
                      <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}>Pekanbaru, Riau, Indonesia</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-8 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900/50 border border-meta-gray-800' : 'bg-white border border-meta-gray-200'}`}>
                <h2 className={`text-2xl font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Jam Operasional</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}>Senin - Jumat</span>
                    <span className={`transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>09:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}>Sabtu</span>
                    <span className={`transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>10:00 - 15:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-800'}`}>Minggu</span>
                    <span className={`transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Tutup</span>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-8 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-900/50 border border-meta-gray-800' : 'bg-white border border-meta-gray-200'}`}>
                <h2 className={`text-2xl font-bold mb-6 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Media Sosial</h2>
                <div className="flex space-x-4">
                  {[
                    { name: 'Instagram', href: 'https://instagram.com/metaagency' },
                    { name: 'Facebook', href: 'https://facebook.com/metaagency' },
                    { name: 'Twitter', href: 'https://twitter.com/metaagency' },
                    { name: 'YouTube', href: 'https://youtube.com/metaagency' },
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-lg border transition-colors duration-500 font-medium text-sm ${theme === 'dark' ? 'bg-meta-gray-800 border-meta-gray-700 text-meta-gray-300 hover:bg-meta-gray-700' : 'bg-white border-meta-gray-200 text-meta-black hover:bg-meta-gray-100'}`}
                    >
                      {social.name}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage; 