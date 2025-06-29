import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const { theme } = useThemeStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format the message in Bahasa Indonesia
    const whatsappMessage = `Halo, saya ${formData.name}
Email: ${formData.email}
Subjek: ${formData.subject}
Pesan: ${formData.message}`;

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    // WhatsApp number (you can change this to your actual WhatsApp number)
    // const whatsappNumber = '6282383616024'; // Using the phone number from contactInfo
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${62895360039764}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'contact@metaagency.com',
      link: 'mailto:contact@metaagency.com',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+62 821-2345-6789',
      link: 'tel:+6282123456789',
    },
    {
      icon: MapPin,
      title: 'Address',
      value: 'Jakarta, Indonesia',
      link: 'https://maps.google.com/?q=Jakarta,Indonesia',
    },
  ];

  // SVG background as a string
  const svgBg = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

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
              Hubungi Kami
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-meta-blue to-cyan-500">
                Mari Berkolaborasi
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`text-xl max-w-3xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}
            >
              Kami siap membantu Anda mencapai kesuksesan sebagai creator
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-meta-blue/20 to-cyan-500/20 rounded-xl blur-xl" />
              <div className={`relative backdrop-blur-sm rounded-xl p-8 border transition-colors duration-500 ${theme === 'dark' ? 'bg-black/50 border-meta-gray-800 text-white' : 'bg-white border-meta-gray-200 text-meta-black'}`}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {[
                    { id: 'name', label: 'Nama', type: 'text', placeholder: 'Masukkan nama lengkap' },
                    { id: 'email', label: 'Email', type: 'email', placeholder: 'nama@email.com' },
                    { id: 'subject', label: 'Subjek', type: 'text', placeholder: 'Masukkan subjek pesan' },
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
                        className={`w-full px-4 py-3 rounded-lg transition-colors duration-500 border focus:outline-none focus:ring-2 focus:ring-meta-blue focus:border-transparent ${theme === 'dark' ? 'bg-meta-gray-900 border-meta-gray-800 text-white placeholder-meta-gray-500' : 'bg-white border-meta-gray-200 text-meta-black placeholder-meta-gray-400'}`}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                  <div>
                    <label htmlFor="message" className={`block text-sm font-medium mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>Pesan</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      required
                      className={`w-full px-4 py-3 rounded-lg transition-colors duration-500 border focus:outline-none focus:ring-2 focus:ring-meta-blue focus:border-transparent ${theme === 'dark' ? 'bg-meta-gray-900 border-meta-gray-800 text-white placeholder-meta-gray-500' : 'bg-white border-meta-gray-200 text-meta-black placeholder-meta-gray-400'}`}
                      placeholder="Tulis pesan Anda di sini..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-meta-blue to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Send className="w-5 h-5" />
                    <span>Kirim via WhatsApp</span>
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.a
                    key={info.title}
                    href={info.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="relative group block"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-meta-blue/20 to-cyan-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className={`relative backdrop-blur-sm rounded-xl p-6 flex items-center space-x-4 border transition-colors duration-500 ${theme === 'dark' ? 'bg-black/50 border-meta-gray-800 text-white' : 'bg-white border-meta-gray-200 text-meta-black'}`}>
                      <div className="flex-shrink-0">
                        <Icon className="w-8 h-8 text-meta-blue" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold mb-1 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{info.title}</h3>
                        <p className={`transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'}`}>{info.value}</p>
                      </div>
                    </div>
                  </motion.a>
                );
              })}

              {/* Social Media Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-meta-blue/20 to-cyan-500/20 rounded-xl blur-xl" />
                <div className={`relative backdrop-blur-sm rounded-xl p-6 border transition-colors duration-500 ${theme === 'dark' ? 'bg-black/50 border-meta-gray-800 text-white' : 'bg-white border-meta-gray-200 text-meta-black'}`}>
                  <h3 className={`text-lg font-semibold mb-4 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Social Media</h3>
                  <div className="flex space-x-4">
                    <a
                      href="https://instagram.com/@metaagencyofficial"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-lg border transition-colors duration-500 font-medium text-sm ${theme === 'dark' ? 'bg-meta-gray-900/50 border-meta-gray-800 text-white hover:bg-meta-gray-800' : 'bg-white border-meta-gray-200 text-meta-black hover:bg-meta-gray-100'}`}
                    >
                      Instagram
                    </a>
                    <a
                      href="https://tiktok.com/@metaagencyofficial"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-lg border transition-colors duration-500 font-medium text-sm ${theme === 'dark' ? 'bg-meta-gray-900/50 border-meta-gray-800 text-white hover:bg-meta-gray-800' : 'bg-white border-meta-gray-200 text-meta-black hover:bg-meta-gray-100'}`}
                    >
                      Tiktok
                    </a>
                    <a
                      href="https://wa.me/62895360039764"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-lg border transition-colors duration-500 font-medium text-sm ${theme === 'dark' ? 'bg-meta-gray-900/50 border-meta-gray-800 text-white hover:bg-meta-gray-800' : 'bg-white border-meta-gray-200 text-meta-black hover:bg-meta-gray-100'}`}
                    >
                      WhatsApp
                    </a>  
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection; 