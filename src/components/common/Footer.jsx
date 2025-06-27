import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  ExternalLink
} from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useThemeStore();

  const footerLinks = {
    company: [
      { label: 'Tentang Kami', href: '/about' },
      { label: 'Layanan', href: '/services' },
      { label: 'Karir', href: '/careers' },
      { label: 'Kontak', href: '/contact' },
    ],
    talent: [
      { label: 'Gabung Sekarang', href: '/join' },
      { label: 'Portal Talent', href: '/login' },
      { label: 'Panduan Creator', href: '/articles?category=panduan-streaming' },
      { label: 'FAQ', href: '/faq' },
    ],
    resources: [
      { label: 'Artikel', href: '/articles' },
      { label: 'Kebijakan TikTok', href: '/articles?category=kebijakan-tiktok' },
      { label: 'Tips Algoritma', href: '/articles?category=tips-algoritma' },
      { label: 'Success Stories', href: '/articles?category=success-story' },
    ],
    legal: [
      { label: 'Kebijakan Privasi', href: '/privacy' },
      { label: 'Syarat & Ketentuan', href: '/terms' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com/metaagency', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com/metaagency', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/metaagency', label: 'Twitter' },
    { icon: Youtube, href: 'https://youtube.com/metaagency', label: 'YouTube' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`border-t transition-colors duration-500 ${theme === 'dark' ? 'bg-black border-meta-gray-800' : 'bg-white border-meta-gray-200'}`}
    >
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center space-x-3 mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-meta-blue focus-visible:ring-offset-2">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center relative">
                  {/* Soft glow behind logo */}
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-meta-blue/30 to-cyan-500/20 blur-md z-0" />
                  <span className="text-black font-black text-xl relative z-10">M</span>
                </div>
                <div>
                  <h1 className={`font-display font-black text-xl leading-tight transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
                    META
                  </h1>
                  <p className={`text-xs transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-black'}`}>AGENCY</p>
                </div>
              </Link>
              <p className={`text-sm mb-6 max-w-sm transition-colors duration-500 ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-black'}`}>
                Partner resmi TikTok untuk mengelola dan mengembangkan creator Indonesia. 
                Bergabunglah dengan 800+ talent yang telah berkembang bersama kami.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <a 
                  href="mailto:info@metaagency.id" 
                  className={`flex items-center space-x-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-meta-blue focus-visible:ring-offset-2 ${theme === 'dark' ? 'text-meta-gray-400 hover:text-white' : 'text-meta-black hover:text-meta-black'}`}
                >
                  <Mail className="w-4 h-4" />
                  <span>info@metaagency.id</span>
                </a>
                <a 
                  href="tel:+6281234567890" 
                  className={`flex items-center space-x-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-meta-blue focus-visible:ring-offset-2 ${theme === 'dark' ? 'text-meta-gray-400 hover:text-white' : 'text-meta-black hover:text-meta-black'}`}
                >
                  <Phone className="w-4 h-4" />
                  <span>+62 812-3456-7890</span>
                </a>
                <div className={`flex items-start space-x-2 text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-black'}`}>
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>Pekanbaru, Riau, Indonesia</span>
                </div>
              </div>
            </div>

            {/* Links Sections */}
            <div>
              <h3 className={`font-semibold mb-4 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Perusahaan</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link 
                      to={link.href}
                      className={`text-sm transition-colors ${theme === 'dark' ? 'text-meta-gray-400 hover:text-white' : 'text-meta-black hover:text-meta-black'}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className={`font-semibold mb-4 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Untuk Talent</h3>
              <ul className="space-y-2">
                {footerLinks.talent.map((link) => (
                  <li key={link.href}>
                    <Link 
                      to={link.href}
                      className={`text-sm transition-colors ${theme === 'dark' ? 'text-meta-gray-400 hover:text-white' : 'text-meta-black hover:text-meta-black'}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className={`font-semibold mb-4 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Resources</h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.href}>
                    <Link 
                      to={link.href}
                      className={`text-sm transition-colors ${theme === 'dark' ? 'text-meta-gray-400 hover:text-white' : 'text-meta-black hover:text-meta-black'}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className={`font-semibold mb-4 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>Legal</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link 
                      to={link.href}
                      className={`text-sm transition-colors ${theme === 'dark' ? 'text-meta-gray-400 hover:text-white' : 'text-meta-black hover:text-meta-black'}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* TikTok Partnership Badge */}
        <div className={`py-6 border-t ${theme === 'dark' ? 'border-meta-gray-800' : 'border-meta-gray-200'}`}>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
            <div className={`flex items-center space-x-2 text-sm ${theme === 'dark' ? 'text-meta-gray-400' : 'text-white'}`}>
              <span className="text-sm">Official Partner</span>
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-meta-gray-900' : 'bg-meta-black'}`}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
                <span className={`text-sm font-semibold transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-white'}`}>TikTok</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`py-6 border-t ${theme === 'dark' ? 'border-meta-gray-800' : 'border-meta-gray-200'}`}>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className={`text-sm text-center md:text-left ${theme === 'dark' ? 'text-meta-gray-400' : 'text-meta-black'}`}>
              © {currentYear} Meta Agency. All rights reserved. PT Meta Digital Indonesia.
              <Link 
                to="/login" 
                className={`ml-2 text-xs opacity-0 hover:opacity-100 transition-opacity duration-300 ${theme === 'dark' ? 'text-meta-gray-700 hover:text-meta-gray-500' : 'text-meta-gray-300 hover:text-meta-gray-500'}`}
                aria-label="Admin Login"
              >
                Admin Login
              </Link>
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.18, color: '#22d3ee', boxShadow: '0 2px 12px 0 rgba(34,197,246,0.18)' }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className={`p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-meta-blue focus-visible:ring-offset-2 ${theme === 'dark' ? 'text-meta-gray-400 hover:text-white' : 'text-meta-black hover:text-meta-blue'}`}
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer; 