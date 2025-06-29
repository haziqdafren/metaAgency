import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  BarChart2, 
  DollarSign, 
  Target, 
  Shield,
  Zap,
  Heart,
  Star
} from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import MagneticButton from '../common/MagneticButton';
import MagneticCard from '../common/MagneticCard';
import { TouchNavigation } from '../common/TouchOptimized';

const ServicesSectionEnhanced = () => {
  const { theme } = useThemeStore();
  const [activeService, setActiveService] = useState(0);

  const services = [
    {
      icon: TrendingUp,
      title: 'Content Strategy',
      description: 'AI-powered content recommendations tailored to Indonesian audience preferences and trending topics.',
      features: ['Viral Content Analysis', 'Trend Prediction', 'Audience Insights', 'Content Calendar'],
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      stats: { growth: '+150%', metric: 'Engagement Rate' }
    },
    {
      icon: Users,
      title: 'Community Building',
      description: 'Connect with 10,000+ creators, collaborate on projects, and learn from industry experts.',
      features: ['Creator Network', 'Collaboration Tools', 'Mentorship Program', 'Events & Workshops'],
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      stats: { growth: '10K+', metric: 'Active Creators' }
    },
    {
      icon: BarChart2,
      title: 'Analytics & Insights',
      description: 'Deep performance analytics with actionable insights to optimize your content strategy.',
      features: ['Real-time Analytics', 'Performance Tracking', 'Audience Demographics', 'ROI Analysis'],
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500',
      stats: { growth: '+200%', metric: 'Content Performance' }
    },
    {
      icon: DollarSign,
      title: 'Monetization Support',
      description: 'Maximize your earnings with our comprehensive monetization strategies and bonus programs.',
      features: ['Bonus Calculator', 'Revenue Optimization', 'Brand Partnerships', 'Payment Processing'],
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500',
      stats: { growth: 'Rp 5B+', metric: 'Monthly Payouts' }
    },
    {
      icon: Target,
      title: 'Brand Partnerships',
      description: 'Connect with premium brands and unlock exclusive collaboration opportunities.',
      features: ['Brand Matching', 'Campaign Management', 'Contract Support', 'Performance Tracking'],
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/10',
      iconColor: 'text-red-500',
      stats: { growth: '500+', metric: 'Brand Partners' }
    },
    {
      icon: Shield,
      title: 'Creator Protection',
      description: 'Comprehensive support system ensuring your rights, payments, and content are protected.',
      features: ['Legal Support', 'Content Protection', 'Dispute Resolution', '24/7 Support'],
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-500/10',
      iconColor: 'text-indigo-500',
      stats: { growth: '99.9%', metric: 'Protection Rate' }
    }
  ];

  const navigationItems = services.map((service, index) => ({
    label: service.title,
    icon: service.icon
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className={`py-20 lg:py-32 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-white'
    }`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-meta-blue/10 to-cyan-500/10 text-meta-blue px-4 py-2 rounded-full text-sm font-medium mb-6 border border-meta-blue/20"
          >
            <Zap className="w-4 h-4" />
            <span>Comprehensive Creator Solutions</span>
          </motion.div>

          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-meta-black'
          }`}>
            Everything You Need to{' '}
            <motion.span
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="bg-gradient-to-r from-meta-blue via-cyan-500 to-purple-600 bg-clip-text text-transparent"
              style={{ backgroundSize: '200% 200%' }}
            >
              Succeed
            </motion.span>
          </h2>

          <p className={`text-xl max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            From content strategy to monetization, we provide a complete ecosystem 
            for Indonesian creators to thrive in the digital economy.
          </p>
        </motion.div>

        {/* Mobile Navigation */}
        <div className="mb-8 lg:hidden">
          <TouchNavigation
            items={navigationItems}
            activeIndex={activeService}
            onItemClick={setActiveService}
          />
        </div>

        {/* Services Grid - Desktop */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="group"
              >
                <MagneticCard
                  className={`h-full p-8 border border-gray-200 dark:border-gray-700 hover:border-transparent transition-all duration-300 ${service.bgColor}`}
                  tiltStrength={0.05}
                  magneticStrength={0.1}
                  onClick={() => setActiveService(index)}
                >
                  {/* Service Icon */}
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className={`text-2xl font-bold mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-meta-black'
                    }`}>
                      {service.title}
                    </h3>
                    
                    <p className={`mb-6 leading-relaxed ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {service.description}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          className="flex items-center gap-3"
                        >
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.color}`} />
                          <span className={`text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Stats */}
                    <div className={`flex items-center justify-between p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
                    } backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50`}>
                      <div>
                        <div className={`text-2xl font-bold ${service.iconColor}`}>
                          {service.stats.growth}
                        </div>
                        <div className="text-xs text-gray-500">{service.stats.metric}</div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br ${service.color}`} />
                </MagneticCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mobile Service Detail View */}
        <div className="lg:hidden">
          <motion.div
            key={activeService}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-8 rounded-2xl ${services[activeService].bgColor} border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${services[activeService].color} flex items-center justify-center`}>
                {React.createElement(services[activeService].icon, { className: "w-8 h-8 text-white" })}
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                  {services[activeService].title}
                </h3>
                <div className={`text-2xl font-bold ${services[activeService].iconColor}`}>
                  {services[activeService].stats.growth}
                </div>
              </div>
            </div>

            <p className={`mb-6 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {services[activeService].description}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {services[activeService].features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${services[activeService].color}`} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className={`inline-flex items-center gap-3 p-6 rounded-2xl ${
            theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
          } backdrop-blur-sm border border-gray-200 dark:border-gray-700 mb-8`}>
            <Heart className="w-6 h-6 text-red-500" />
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Trusted by 10,000+ creators across Indonesia
            </span>
          </div>

          <MagneticButton
            variant="primary"
            size="xl"
            className="group"
            magneticStrength={0.4}
          >
            <span className="flex items-center">
              Start Your Creator Journey
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap className="ml-2 w-6 h-6 group-hover:text-yellow-300 transition-colors" />
              </motion.div>
            </span>
          </MagneticButton>

          <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No setup fees • Free to join • Instant access
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSectionEnhanced;