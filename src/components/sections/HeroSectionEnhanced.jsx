import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Users, TrendingUp, Award, Sparkles, Zap } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import MagneticButton from '../common/MagneticButton';
import { TouchCarousel } from '../common/TouchOptimized';

const HeroSectionEnhanced = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { theme } = useThemeStore();
  const controls = useAnimation();
  
  const stats = [
    { icon: Users, label: 'Active Creators', value: '10,000+', color: 'text-meta-blue', bgColor: 'bg-blue-500/10' },
    { icon: TrendingUp, label: 'Monthly Revenue', value: 'Rp 5B+', color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { icon: Award, label: 'Success Rate', value: '95%', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  ];

  const testimonials = [
    {
      name: "@sarah_creative",
      content: "Meta Agency changed my life! From 1K to 500K followers in 6 months",
      avatar: "👩‍💼",
      earnings: "Rp 15M/month"
    },
    {
      name: "@gaming_indo",
      content: "Best decision ever joining Meta Agency. The support is incredible!",
      avatar: "🎮",
      earnings: "Rp 12M/month"
    },
    {
      name: "@food_blogger",
      content: "Amazing community and resources. My content quality improved drastically",
      avatar: "🍜",
      earnings: "Rp 8M/month"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  useEffect(() => {
    controls.start({
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    });
  }, [controls]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Floating particles animation
  const particles = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-meta-blue/30 rounded-full"
      animate={{
        y: [0, -100, 0],
        x: [0, Math.random() * 100 - 50, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: Math.random() * 3 + 2,
        repeat: Infinity,
        delay: Math.random() * 2,
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  ));

  const renderTestimonial = (testimonial, index) => (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 mx-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-3xl">{testimonial.avatar}</div>
        <div>
          <h4 className="font-bold text-lg">{testimonial.name}</h4>
          <p className="text-green-600 font-semibold">{testimonial.earnings}</p>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.content}"</p>
    </div>
  );

  return (
    <section 
      className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-500 ${
        theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-white to-cyan-50'
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles}
      </div>

      {/* Dynamic Background Gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.3) 0%, transparent 50%)`,
        }}
      />

      {/* Indonesian Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFC107' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3Cpath d='M20 20l20 20M40 20l-20 20' stroke='%23F44336' stroke-width='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-meta-blue/10 to-cyan-500/10 text-meta-blue px-4 py-2 rounded-full text-sm font-medium mb-6 border border-meta-blue/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Indonesia's #1 Creator Network</span>
              <Sparkles className="w-4 h-4" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
                theme === 'dark' ? 'text-white' : 'text-meta-black'
              }`}
            >
              <span className="bg-gradient-to-r from-meta-blue to-cyan-500 bg-clip-text text-transparent">
                Empower
              </span>{' '}
              Your Creative{' '}
              <motion.span
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent"
                style={{ backgroundSize: '200% 200%' }}
              >
                Journey
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`text-lg md:text-xl mb-8 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Join 10,000+ Indonesian creators who've transformed their passion into 
              <span className="font-semibold text-meta-blue"> sustainable income</span> with 
              our proven creator economy platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <MagneticButton
                as={Link}
                to="/join"
                variant="primary"
                size="lg"
                className="group"
                magneticStrength={0.3}
              >
                <span className="flex items-center">
                  Start Your Journey
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </motion.div>
                </span>
              </MagneticButton>

              <MagneticButton
                variant="glass"
                size="lg"
                onClick={() => {
                  // Scroll to success stories or open video modal
                  document.querySelector('#success-stories')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group"
              >
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Success Stories
              </MagneticButton>
            </motion.div>

            {/* Dynamic Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const isActive = index === currentStat;
                
                return (
                  <motion.div
                    key={index}
                    className={`p-4 rounded-xl text-center transition-all duration-500 ${
                      isActive ? `${stat.bgColor} scale-105 shadow-lg` : 'bg-gray-100/50 dark:bg-gray-800/50'
                    }`}
                    animate={{
                      scale: isActive ? 1.05 : 1,
                      y: isActive ? -5 : 0,
                    }}
                  >
                    <motion.div
                      animate={{ rotate: isActive ? 360 : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${isActive ? stat.color : 'text-gray-500'}`} />
                    </motion.div>
                    <div className={`text-xl font-bold ${isActive ? stat.color : 'text-gray-700 dark:text-gray-300'}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main Visual Container */}
            <div className="relative">
              {/* Central Image/Illustration */}
              <motion.div
                animate={controls}
                className="relative z-10 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 shadow-2xl"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-meta-blue to-cyan-500 rounded-full flex items-center justify-center"
                  >
                    <Zap className="w-16 h-16 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2">Ready to Go Viral?</h3>
                  <p className="text-gray-600 dark:text-gray-300">Join the creator revolution</p>
                </div>
              </motion.div>

              {/* Floating Success Indicators */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-4 -left-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg"
              >
                <div className="text-sm font-bold">+500K</div>
                <div className="text-xs">New Followers</div>
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -top-2 -right-6 bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-lg"
              >
                <div className="text-sm font-bold">Rp 15M</div>
                <div className="text-xs">Monthly Earnings</div>
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 3, 0]
                }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
                className="absolute -bottom-6 -left-2 bg-purple-500 text-white px-3 py-2 rounded-lg shadow-lg"
              >
                <div className="text-sm font-bold">Grade A</div>
                <div className="text-xs">Performance</div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Testimonials Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 lg:hidden"
        >
          <h3 className="text-2xl font-bold text-center mb-6">What Our Creators Say</h3>
          <TouchCarousel
            items={testimonials}
            renderItem={renderTestimonial}
            autoPlay={true}
            autoPlayInterval={4000}
            className="h-48"
          />
        </motion.div>

        {/* Desktop Testimonials Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="hidden lg:grid grid-cols-3 gap-6 mt-16"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-bold text-lg">{testimonial.name}</h4>
                  <p className="text-green-600 font-semibold">{testimonial.earnings}</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.content}"</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-gray-500 dark:text-gray-400"
          >
            <span className="text-sm mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-current rounded-full mt-2"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSectionEnhanced;