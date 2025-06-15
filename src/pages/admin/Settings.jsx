import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import { Settings as SettingsIcon, Users, Bell, Sliders, X, CheckCircle } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const Settings = () => {
  const { theme } = useThemeStore();
  const [activeTab, setActiveTab] = useState('general');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    confirmAction: () => {},
    showConfirm: true,
  });
  const [actionSuccess, setActionSuccess] = useState(null);

  const openModal = (title, message, confirmAction, showConfirm = true) => {
    setModalContent({ title, message, confirmAction, showConfirm });
    setIsModalOpen(true);
    setActionSuccess(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent({
      title: '',
      message: '',
      confirmAction: () => {},
      showConfirm: true,
    });
  };

  const handleConfirmAction = () => {
    modalContent.confirmAction();
    // Do not close immediately, allow success message to show
  };

  const SettingSection = ({ title, icon: Icon, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-meta-gray-900 border-meta-gray-800' : 'bg-white border-gray-200'}`}
    >
      <h2 className={`text-xl font-semibold mb-4 flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}>
        <Icon className="w-6 h-6 text-meta-blue" /> {title}
      </h2>
      <div className={`${theme === 'dark' ? 'text-meta-gray-300' : 'text-meta-gray-700'}`}>
        {children}
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <SettingSection title="General Settings" icon={SettingsIcon} theme={theme}>
            <p>Platform-wide general configurations would be managed here.</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Site title and description</li>
              <li>Default currency settings</li>
              <li>Language preferences</li>
            </ul>
            <div className="mt-4">
              <button
                onClick={() => openModal(
                  'Save General Settings',
                  'Are you sure you want to save these general settings?',
                  () => {
                    // Dummy save logic
                    console.log('General settings saved!');
                    setActionSuccess('General settings saved successfully!');
                    setTimeout(closeModal, 1500); // Close modal after 1.5 seconds
                  }
                )}
                className="bg-meta-blue text-white py-2 px-4 rounded-md hover:bg-meta-blue/90 transition"
              >
                Save General Settings
              </button>
            </div>
          </SettingSection>
        );
      case 'users':
        return (
          <SettingSection title="User Management" icon={Users} theme={theme}>
            <p>Manage user roles, permissions, and accounts.</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>View and edit user profiles</li>
              <li>Assign and revoke roles (e.g., Admin, Talent)</li>
              <li>Manage user authentication settings</li>
            </ul>
            <div className="mt-4">
              <button
                onClick={() => openModal(
                  'Go to User Management',
                  'You will be redirected to the User Management section. Continue?',
                  () => {
                    // Simulate navigation
                    console.log('Navigating to User Management...');
                    setActionSuccess('Redirecting to User Management...');
                    setTimeout(closeModal, 1500); // Close modal after 1.5 seconds
                    // In a real app, you'd use: navigate('/admin/users');
                  }
                )}
                className="bg-meta-blue text-white py-2 px-4 rounded-md hover:bg-meta-blue/90 transition"
              >
                Go to User Management
              </button>
            </div>
          </SettingSection>
        );
      case 'notifications':
        return (
          <SettingSection title="Notification Settings" icon={Bell} theme={theme}>
            <p>Configure system notification preferences.</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Email notification preferences</li>
              <li>In-app notification settings</li>
              <li>Integration with external notification services</li>
            </ul>
            <div className="mt-4">
              <button
                onClick={() => openModal(
                  'Save Notification Settings',
                  'Are you sure you want to save these notification settings?',
                  () => {
                    // Dummy save logic
                    console.log('Notification settings saved!');
                    setActionSuccess('Notification settings saved successfully!');
                    setTimeout(closeModal, 1500); // Close modal after 1.5 seconds
                  }
                )}
                className="bg-meta-blue text-white py-2 px-4 rounded-md hover:bg-meta-blue/90 transition"
              >
                Save Notification Settings
              </button>
            </div>
          </SettingSection>
        );
      case 'integrations':
        return (
          <SettingSection title="Integrations" icon={Sliders} theme={theme}>
            <p>Manage connections to third-party services and APIs.</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Social media platform integrations</li>
              <li>Payment gateway settings</li>
              <li>Analytics tool connections</li>
            </ul>
            <div className="mt-4">
              <button
                onClick={() => openModal(
                  'Manage Integrations',
                  'You will be directed to the Integrations management section. Continue?',
                  () => {
                    // Simulate navigation or opening integration manager
                    console.log('Navigating to Integrations...');
                    setActionSuccess('Redirecting to Integrations management...');
                    setTimeout(closeModal, 1500); // Close modal after 1.5 seconds
                  }
                )}
                className="bg-meta-blue text-white py-2 px-4 rounded-md hover:bg-meta-blue/90 transition"
              >
                Manage Integrations
              </button>
            </div>
          </SettingSection>
        );
      default:
        return null;
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <motion.div
      className={`p-6 flex-1 overflow-y-auto transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-meta-black'}`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className={`mb-6 p-2 rounded-lg shadow-sm flex flex-wrap gap-2 ${theme === 'dark' ? 'bg-meta-gray-900 border border-meta-gray-800' : 'bg-white border border-gray-200'}`}>
        <button
          onClick={() => setActiveTab('general')}
          className={`py-2 px-4 rounded-md font-medium transition-colors duration-300 ${
            activeTab === 'general' 
              ? 'bg-meta-blue text-white shadow' 
              : (theme === 'dark' ? 'text-meta-gray-300 hover:bg-meta-gray-800' : 'text-meta-black hover:bg-gray-100')
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-4 rounded-md font-medium transition-colors duration-300 ${
            activeTab === 'users' 
              ? 'bg-meta-blue text-white shadow' 
              : (theme === 'dark' ? 'text-meta-gray-300 hover:bg-meta-gray-800' : 'text-meta-black hover:bg-gray-100')
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-2 px-4 rounded-md font-medium transition-colors duration-300 ${
            activeTab === 'notifications' 
              ? 'bg-meta-blue text-white shadow' 
              : (theme === 'dark' ? 'text-meta-gray-300 hover:bg-meta-gray-800' : 'text-meta-black hover:bg-gray-100')
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`py-2 px-4 rounded-md font-medium transition-colors duration-300 ${
            activeTab === 'integrations' 
              ? 'bg-meta-blue text-white shadow' 
              : (theme === 'dark' ? 'text-meta-gray-300 hover:bg-meta-gray-800' : 'text-meta-black hover:bg-gray-100')
          }`}
        >
          Integrations
        </button>
      </div>

      <div className="mt-6">
        {renderContent()}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className={`relative w-full max-w-md mx-auto rounded-lg shadow-lg p-6 ${theme === 'dark' ? 'bg-meta-gray-800 text-white' : 'bg-white text-meta-black'}`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-meta-gray-400 hover:text-meta-gray-600 dark:hover:text-meta-gray-300 transition"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4">{modalContent.title}</h2>
              <p className="mb-6">{modalContent.message}</p>
              {actionSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md text-green-500 text-sm flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {actionSuccess}
                </motion.div>
              )}
              <div className="flex justify-end space-x-2 mt-4">
                {modalContent.showConfirm && !actionSuccess && (
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg border border-meta-gray-300 dark:border-meta-gray-600 text-meta-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-gray-700 transition"
                  >
                    Cancel
                  </button>
                )}
                {!actionSuccess && modalContent.showConfirm && (
                  <button
                    type="button"
                    onClick={handleConfirmAction}
                    className="bg-meta-blue text-white rounded-lg py-2 px-4 font-semibold shadow hover:bg-meta-blue/90 transition"
                  >
                    Confirm
                  </button>
                )}
                {actionSuccess && (
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-meta-blue text-white rounded-lg py-2 px-4 font-semibold shadow hover:bg-meta-blue/90 transition"
                  >
                    OK
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings; 