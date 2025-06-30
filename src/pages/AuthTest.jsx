import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import useNewAuthStore from '../store/newAuthStore';
import { debugAuth } from '../utils/authDebug';

const AuthTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const { user, profile, loading, error, runDiagnostics, signIn, signOut } = useNewAuthStore();

  const tests = [
    {
      id: 'connection',
      name: 'Database Connection',
      description: 'Test Supabase connection',
      test: () => debugAuth.testConnection()
    },
    {
      id: 'adminTable',
      name: 'Admin Table Access',
      description: 'Check admin table structure and data',
      test: () => debugAuth.testAdminTable()
    },
    {
      id: 'adminAuth',
      name: 'Admin Authentication',
      description: 'Test admin login credentials',
      test: () => debugAuth.testAdminCredentials('admin@metaagency.id', 'admin123')
    },
    {
      id: 'emergencyAdmin',
      name: 'Emergency Admin Creation',
      description: 'Create emergency admin if needed',
      test: () => debugAuth.createEmergencyAdmin()
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});
    
    for (const test of tests) {
      setCurrentTest(test.name);
      console.log(`🧪 Running test: ${test.name}`);
      
      try {
        const result = await test.test();
        setTestResults(prev => ({
          ...prev,
          [test.id]: {
            ...result,
            name: test.name,
            description: test.description
          }
        }));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          [test.id]: {
            success: false,
            error: error.message,
            name: test.name,
            description: test.description
          }
        }));
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setCurrentTest('');
    setIsRunning(false);
  };

  const testLogin = async () => {
    console.log('🧪 Testing login flow...');
    try {
      setCurrentTest('Testing Login Flow');
      const result = await signIn('admin@metaagency.id', 'admin123');
      console.log('Login test result:', result);
    } catch (error) {
      console.error('Login test failed:', error);
    } finally {
      setCurrentTest('');
    }
  };

  const testLogout = async () => {
    console.log('🧪 Testing logout flow...');
    try {
      setCurrentTest('Testing Logout Flow');
      const result = await signOut();
      console.log('Logout test result:', result);
    } catch (error) {
      console.error('Logout test failed:', error);
    } finally {
      setCurrentTest('');
    }
  };

  const getStatusIcon = (result) => {
    if (!result) return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    if (result.success) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusColor = (result) => {
    if (!result) return 'border-gray-200 bg-gray-50';
    if (result.success) return 'border-green-200 bg-green-50';
    return 'border-red-200 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <div className="flex items-center space-x-3 mb-8">
            <Bug className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Authentication Test Suite</h1>
          </div>

          {/* Current Auth State */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Current Authentication State</h2>
            <div className="space-y-2 text-sm">
              <div>Loading: <span className={loading ? 'text-yellow-600' : 'text-green-600'}>{loading ? 'Yes' : 'No'}</span></div>
              <div>User: <span className={user ? 'text-green-600' : 'text-red-600'}>{user ? user.email : 'Not logged in'}</span></div>
              <div>Profile: <span className={profile ? 'text-green-600' : 'text-red-600'}>{profile ? profile.role : 'No profile'}</span></div>
              <div>Error: <span className={error ? 'text-red-600' : 'text-green-600'}>{error || 'None'}</span></div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                <span>Run All Tests</span>
              </button>

              <button
                onClick={testLogin}
                disabled={isRunning || user}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Test Login
              </button>

              <button
                onClick={testLogout}
                disabled={isRunning || !user}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Test Logout
              </button>
            </div>

            {currentTest && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />
                  <span className="text-yellow-800">Running: {currentTest}</span>
                </div>
              </div>
            )}
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
            
            {tests.map((test) => {
              const result = testResults[test.id];
              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`border rounded-lg p-4 ${getStatusColor(result)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(result)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                      
                      {result && (
                        <div className="space-y-2">
                          <div className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                            Status: {result.success ? 'Passed' : 'Failed'}
                          </div>
                          
                          {result.error && (
                            <div className="text-sm text-red-700">
                              Error: {result.error}
                            </div>
                          )}
                          
                          {result.data && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                                View Data
                              </summary>
                              <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">How to Use This Test Suite</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Click "Run All Tests" to check database connectivity and admin setup</li>
              <li>If admin table test fails, the emergency admin will be created automatically</li>
              <li>Use "Test Login" to verify the authentication flow works</li>
              <li>Use "Test Logout" to verify session cleanup</li>
              <li>Check the browser console for detailed logs</li>
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthTest;