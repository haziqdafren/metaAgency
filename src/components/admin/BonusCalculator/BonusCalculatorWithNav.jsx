import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, History, Settings, CheckCircle } from 'lucide-react';
import AdminLayout from '../AdminLayout';
import BonusCalculatorRefactored from './BonusCalculatorRefactored';
import BonusHistory from '../../../pages/admin/BonusHistory';
import BonusRules from '../../../pages/admin/BonusRules';

const BonusCalculatorWithNav = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const tabs = [
    {
      id: 'upload',
      name: 'Upload & Results',
      icon: Calculator,
      description: 'Upload task file and calculate bonuses'
    },
    {
      id: 'history',
      name: 'History',
      icon: History,
      description: 'View previous bonus calculations'
    },
    {
      id: 'rules',
      name: 'Rules',
      icon: Settings,
      description: 'Edit bonus calculation rules'
    }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const markStepCompleted = (stepId) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="mt-6">
            <BonusCalculatorRefactored onCalculationComplete={() => markStepCompleted('upload')} />
          </div>
        );
      case 'history':
        return (
          <div className="mt-6">
            <BonusHistory />
          </div>
        );
      case 'rules':
        return (
          <div className="mt-6">
            <BonusRules />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="Bonus Calculator" compact>
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-0" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isCompleted = completedSteps.has(tab.id);
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    relative flex-1 group px-6 py-4 text-sm font-medium text-center border-b-2 transition-all duration-200
                    ${isActive 
                      ? 'border-blue-500 text-blue-600 bg-blue-50' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="relative">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      {isCompleted && (
                        <div className="absolute -top-1 -right-1">
                          <CheckCircle className="w-3 h-3 text-green-500 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    <span className="hidden sm:inline">{tab.name}</span>
                  </div>
                  
                  {/* Mobile tooltip */}
                  <div className="sm:hidden absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {tab.name}
                  </div>
                  
                  {/* Desktop description */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hidden sm:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 text-xs text-gray-600 bg-white border border-gray-200 rounded-md shadow-sm whitespace-nowrap z-10"
                    >
                      {tab.description}
                    </motion.div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderTabContent()}
      </motion.div>
    </AdminLayout>
  );
};

export default BonusCalculatorWithNav;