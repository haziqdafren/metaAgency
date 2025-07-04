import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Dwi Sari',
      role: 'Lifestyle Creator',
      followers: '2.5M',
      image: '👩',
      quote: 'Bergabung dengan Meta Agency adalah keputusan terbaik yang pernah saya buat. Tim mereka membantu saya mengembangkan strategi konten yang tepat dan menghubungkan saya dengan brand-brand ternama.',
      rating: 5,
    },
    {
      name: 'Budi Sutiono',
      role: 'Tech Reviewer',
      followers: '1.8M',
      image: '👨‍💻',
      quote: 'Meta Agency memberikan dukungan yang luar biasa dalam mengembangkan channel saya. Analisis data mereka sangat membantu dalam memahami audiens dan mengoptimalkan konten.',
      rating: 5,
    },
    {
      name: 'Eka Pramudi',
      role: 'Fashion Influencer',
      followers: '3.2M',
      image: '👩‍🎤',
      quote: 'Dengan bantuan Meta Agency, saya berhasil meningkatkan engagement dan monetisasi channel saya secara signifikan. Mereka benar-benar memahami kebutuhan creator.',
      rating: 5,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useThemeStore();

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

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
              Kata Mereka
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-meta-blue to-cyan-500">
                Tentang Kami
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`text-xl max-w-3xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-600'}`}
            >
              Dengarkan pengalaman creator yang telah bergabung dengan Meta Agency
            </motion.p>
          </div>

          {/* Testimonials Carousel */}
          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.95 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-meta-blue/20 to-cyan-500/20 rounded-xl blur-xl" />
                <div className={`relative backdrop-blur-sm rounded-xl p-8 md:p-12 border shadow-2xl transition-colors duration-500 ${theme === 'dark' ? 'bg-black/50 border-meta-gray-800' : 'bg-white border-meta-gray-200'}`}>
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ duration: 0.7, type: 'spring', bounce: 0.5 }}
                      className="flex-shrink-0 relative"
                    >
                      <div
                        className="w-24 h-24 rounded-full border-4 border-meta-blue shadow-lg flex items-center justify-center text-5xl bg-white"
                        aria-label={testimonials[currentIndex].name}
                        role="img"
                      >
                        {testimonials[currentIndex].image}
                      </div>
                    </motion.div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex justify-center md:justify-start space-x-1 mb-4">
                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <h3 className={`text-xl font-bold mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{testimonials[currentIndex].name}</h3>
                      <p className={`${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'} mb-1`}>{testimonials[currentIndex].role}</p>
                      <p className={`${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'} mb-1`}>{testimonials[currentIndex].followers} Followers</p>
                      <p className={`text-lg italic mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                        "{testimonials[currentIndex].quote}"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4">
              <motion.button
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                onClick={prevTestimonial}
                className={`p-2 rounded-full backdrop-blur-sm border shadow transition-colors duration-500 ${theme === 'dark' ? 'bg-black/50 border-meta-gray-800 text-white hover:bg-meta-blue/20' : 'bg-white border-meta-gray-200 text-meta-black hover:bg-meta-gray-100'}`}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                onClick={nextTestimonial}
                className={`p-2 rounded-full backdrop-blur-sm border shadow transition-colors duration-500 ${theme === 'dark' ? 'bg-black/50 border-meta-gray-800 text-white hover:bg-meta-blue/20' : 'bg-white border-meta-gray-200 text-meta-black hover:bg-meta-gray-100'}`}
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-meta-blue ${
                    index === currentIndex ? 'bg-meta-blue' : 'bg-meta-gray-600'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 