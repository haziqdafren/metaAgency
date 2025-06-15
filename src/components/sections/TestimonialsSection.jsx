import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Lifestyle Creator',
      followers: '2.5M',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      quote: 'Bergabung dengan Meta Agency adalah keputusan terbaik yang pernah saya buat. Tim mereka membantu saya mengembangkan strategi konten yang tepat dan menghubungkan saya dengan brand-brand ternama.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Tech Reviewer',
      followers: '1.8M',
      image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      quote: 'Meta Agency memberikan dukungan yang luar biasa dalam mengembangkan channel saya. Analisis data mereka sangat membantu dalam memahami audiens dan mengoptimalkan konten.',
      rating: 5,
    },
    {
      name: 'Emma Rodriguez',
      role: 'Fashion Influencer',
      followers: '3.2M',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
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
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-meta-blue/20 to-cyan-500/20 rounded-xl blur-xl" />
                <div className={`relative backdrop-blur-sm rounded-xl p-8 md:p-12 border transition-colors duration-500 ${theme === 'dark' ? 'bg-black/50 border-meta-gray-800' : 'bg-white border-meta-gray-200'}`}>
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    <div className="flex-shrink-0">
                      <img
                        src={testimonials[currentIndex].image}
                        alt={testimonials[currentIndex].name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-meta-blue"
                      />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex justify-center md:justify-start space-x-1 mb-4">
                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <h3 className={`text-xl font-bold mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>{testimonials[currentIndex].name}</h3>
                      <p className={`${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'} mb-1`}>{testimonials[currentIndex].role}</p>
                      <p className={`${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-gray-600'} mb-1`}>{testimonials[currentIndex].followers} Followers</p>
                      <p className={`text-lg italic mb-2 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>"{testimonials[currentIndex].quote}"</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4">
              <button
                onClick={prevTestimonial}
                className={`p-2 rounded-full backdrop-blur-sm border transition-colors duration-500 ${theme === 'dark' ? 'bg-black/50 border-meta-gray-800 text-white hover:bg-meta-blue/20' : 'bg-white border-meta-gray-200 text-meta-black hover:bg-meta-gray-100'}`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className={`p-2 rounded-full backdrop-blur-sm border transition-colors duration-500 ${theme === 'dark' ? 'bg-black/50 border-meta-gray-800 text-white hover:bg-meta-blue/20' : 'bg-white border-meta-gray-200 text-meta-black hover:bg-meta-gray-100'}`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-meta-blue' : 'bg-meta-gray-600'
                  }`}
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