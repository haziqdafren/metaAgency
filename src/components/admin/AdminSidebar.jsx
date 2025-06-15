import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Search, 
  Upload, 
  UserPlus, 
  Book, 
  Settings, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import useSidebarStore from '../../store/sidebarStore';

const AdminSidebar = () => {
  const { isOpen, toggleSidebar } = useSidebarStore();
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();
  const { theme } = useThemeStore();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
      description: 'Overview of key metrics and recent activities',
    },
    {
      name: 'Talent Database',
      icon: Users,
      path: '/admin/talents',
      description: 'Manage all talent profiles',
    },
    {
      name: 'Search Talent',
      icon: Search,
      path: '/admin/search',
      description: 'Find talents for specific endorsements',
    },
    {
      name: 'Upload Performance',
      icon: Upload,
      path: '/admin/upload',
      description: 'Upload monthly performance data',
    },
    {
      name: 'Registrations',
      icon: UserPlus,
      path: '/admin/registrations',
      description: 'Review new talent applications',
    },
    {
      name: 'Articles',
      icon: Book,
      path: '/admin/articles',
      description: 'Manage educational content and news',
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/admin/settings',
      description: 'Configure system settings',
    },
  ];

  const sidebarVariants = {
    open: { width: 240, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { width: 80, transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      initial={false}
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className={`h-screen fixed top-0 left-0 z-40 flex flex-col p-4 transition-colors duration-500 ${theme === 'dark' ? 'bg-meta-gray-950 border-r border-meta-gray-800' : 'bg-gray-50 border-r border-gray-200'}`}
    >
      <div className="flex items-center justify-between mb-8">
        {isOpen && (
          <motion.h2 
            className={`text-2xl font-bold font-display ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
           Admin Panel
          </motion.h2>
        )}
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-full transition-colors duration-300 ${theme === 'dark' ? 'hover:bg-meta-gray-800 text-meta-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                           (item.path !== '/admin' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200
                ${isActive 
                  ? 'bg-meta-blue text-white shadow-md' 
                  : `${theme === 'dark' ? 'text-meta-gray-300 hover:bg-meta-gray-800 hover:text-white' : 'text-meta-gray-700 hover:bg-gray-100 hover:text-meta-black'}`
                }`}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.span
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait">
                {!isOpen && hoveredItem === item.name && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`absolute left-full ml-4 p-2 rounded-md shadow-lg text-sm whitespace-nowrap ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800 border border-gray-200'}`}
                  >
                    {item.description}
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default AdminSidebar; 