import React from 'react';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DemoBanner = ({ isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 shadow-lg"
      >
        <div className="container mx-auto flex items-center justify-center gap-3">
          <Info className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm md:text-base font-medium text-center">
            <span className="font-bold">🎨 Demo Mode</span> - You're viewing the admin panel in read-only mode.
            All data modifications are disabled for this demonstration.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DemoBanner;
