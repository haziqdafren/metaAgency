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
  ChevronLeft,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSidebarStore from '../../store/sidebarStore';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const { isOpen, toggleSidebar } = useSidebarStore();
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
      description: 'Overview of key metrics and recent activities',
    },
    {
      name: 'Upload Performance',
      icon: Upload,
      path: '/admin/upload',
      description: 'Upload monthly performance data',
    },
    {
      name: 'Bonus Calculator',
      icon: Book,
      path: '/admin/bonus',
      description: 'Calculate and manage monthly bonuses',
    },
    {
      name: 'Talent Management',
      icon: Users,
      path: '/admin/talents',
      description: 'Manage and search creators',
    },
    {
      name: 'Articles',
      icon: BookOpen,
      path: '/admin/articles',
      description: 'Manage and search articles',
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
      className={`h-screen fixed top-0 left-0 z-40 flex flex-col p-4 transition-colors duration-500`}
    >
      <div className="flex items-center justify-between mb-8">
        {isOpen && (
          <motion.h2 
            className={`text-2xl font-bold font-display`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
           Admin Panel
          </motion.h2>
        )}
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-full transition-colors duration-300`}
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
                  : 'text-meta-gray-700 hover:bg-gray-100 hover:text-meta-black'
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
                    className={`absolute left-full ml-4 p-2 rounded-md shadow-lg text-sm whitespace-nowrap`}
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