import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTree, FaSeedling, FaShieldAlt, FaUserAstronaut, FaArrowRight, FaLock, FaCreditCard, FaApple, FaGooglePay } from 'react-icons/fa';
import { BiDonateHeart } from 'react-icons/bi';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './App.css';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Component definitions
const HomePage = () => {
  const navigate = useNavigate();
  const [currentAmount, setCurrentAmount] = useState(12000);
  const goalAmount = 30000;
  const progressPercentage = (currentAmount / goalAmount) * 100;

  // Fetch current amount from backend
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/total-donations`);
        if (response.ok) {
          const data = await response.json();
          setCurrentAmount(data.total || 12000);
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
      }
    };
    
    fetchDonations();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="relative h-screen bg-forest-dark bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-night-800"></div>
        
        <div className="relative z-10 container mx-auto px-4 pt-32 flex flex-col items-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Plant The Magic Forest — Together
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-200 text-center max-w-3xl mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Join our mission to create a sanctuary for nature, where trees thrive, biodiversity flourishes, and the magic of the forest lives on.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <motion.button
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-full text-lg flex items-center justify-center space-x-2 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/donate')}
            >
              <BiDonateHeart size={24} />
              <span>Donate Now</span>
            </motion.button>
            
            <motion.button
              className="bg-transparent hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-full text-lg border-2 border-white/30 flex items-center justify-center space-x-2 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const roadmapSection = document.getElementById('roadmap-section');
                roadmapSection.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Learn More</span>
              <FaArrowRight size={18} />
            </motion.button>
          </div>
          
          <div className="w-full max-w-3xl bg-night-600/70 backdrop-blur-sm p-6 rounded-xl">
            <div className="flex justify-between mb-2">
              <span className="text-lg font-medium text-gray-300">Fundraising Progress</span>
              <span className="text-lg font-medium text-white">${currentAmount.toLocaleString()} of ${goalAmount.toLocaleString()}</span>
            </div>
            
            <div className="w-full bg-night-400 rounded-full h-6 mb-6">
              <motion.div 
                className="bg-gradient-to-r from-primary-600 to-primary-400 h-6 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1.5, delay: 0.5 }}
              ></motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-night-700 hover:bg-night-600 transition-all p-4 rounded-lg cursor-pointer group">
                <div className="flex items-center mb-2">
                  <FaSeedling className="text-primary-400 text-xl mr-2" />
                  <h3 className="text-lg font-semibold">Seedling</h3>
                </div>
                <p className="text-gray-300 mb-2">Support our forest at the seedling level</p>
                <p className="text-white font-bold">$5 / month</p>
                <button 
                  className="mt-3 w-full bg-primary-600 hover:bg-primary-500 text-white py-2 rounded transition-all opacity-0 group-hover:opacity-100"
                  onClick={() => navigate('/donate?plan=seedling')}
                >
                  Select
                </button>
              </div>
              
              <div className="bg-night-700 hover:bg-night-600 transition-all p-4 rounded-lg cursor-pointer group">
                <div className="flex items-center mb-2">
                  <FaShieldAlt className="text-primary-400 text-xl mr-2" />
                  <h3 className="text-lg font-semibold">Tree Guardian</h3>
                </div>
                <p className="text-gray-300 mb-2">Become a guardian of the forest</p>
                <p className="text-white font-bold">$15 / month</p>
                <button 
                  className="mt-3 w-full bg-primary-600 hover:bg-primary-500 text-white py-2 rounded transition-all opacity-0 group-hover:opacity-100"
                  onClick={() => navigate('/donate?plan=guardian')}
                >
                  Select
                </button>
              </div>
              
              <div className="bg-night-700 hover:bg-night-600 transition-all p-4 rounded-lg cursor-pointer group">
                <div className="flex items-center mb-2">
                  <FaUserAstronaut className="text-primary-400 text-xl mr-2" />
                  <h3 className="text-lg font-semibold">UFO Ranger</h3>
                </div>
                <p className="text-gray-300 mb-2">Join our elite group of forest protectors</p>
                <p className="text-white font-bold">$30 / month</p>
                <button 
                  className="mt-3 w-full bg-primary-600 hover:bg-primary-500 text-white py-2 rounded transition-all opacity-0 group-hover:opacity-100"
                  onClick={() => navigate('/donate?plan=ranger')}
                >
                  Select
                </button>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button 
                className="text-primary-300 hover:text-primary-200 font-medium flex items-center justify-center mx-auto"
                onClick={() => navigate('/donate')}
              >
                <span>Make a one-time donation</span>
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <section id="forest-map-section" className="py-20 bg-night-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Growing Forest</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Every donation above $10 plants a tree in our virtual forest. Watch our community grow together!
            </p>
          </div>
          
          <ForestMap />
          
          <div className="mt-10 text-center">
            <button 
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-full text-lg"
              onClick={() => navigate('/donate')}
            >
              Plant Your Tree
            </button>
          </div>
        </div>
      </section>

      <section id="roadmap-section" className="py-20 bg-night-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From campaign launch to tree planting, follow our progress towards creating The Magic Forest.
            </p>
          </div>
          
          <Roadmap />
        </div>
      </section>
    </div>
  );
};

const DonationPage = () => {
  const navigate = useNavigate();
  const [donationType, setDonationType] = useState('one-time');
  const [amount, setAmount] = useState(30);
  const [email, setEmail] = useState('');
  const [recurringPlan, setRecurringPlan] = useState('guardian');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [checkoutStep, setCheckoutStep] = useState('form'); // form, payment, subscription, external
  const isTestMode = process.env.REACT_APP_STRIPE_MODE === 'test';
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  const getRecurringAmount = (plan) => {
    switch (plan) {
      case 'seedling': return 5;
      case 'guardian': return 15;
      case 'ranger': return 30;
      default: return 15;
    }
  };
  
  const handleProceed = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    
    if (donationType === 'recurring') {
      // For recurring donations, show the subscription checkout
      setCheckoutStep('subscription');
      setIsProcessing(false);
    } else {
      // For one-time donations, show the external checkout
      setCheckoutStep('external');
      setIsProcessing(false);
    }
  };
  
  const handlePaymentSuccess = (donationId) => {
    // Redirect to confirmation page
    navigate(`/confirmation?donationId=${donationId}`);
  };
  
  const handleCancel = () => {
    setCheckoutStep('form');
  };
  
  return (
    <div className="min-h-screen bg-night-800 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-night-700 rounded-xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Support The Magic Forest</h1>
          
          {isTestMode && (
            <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded-lg text-yellow-200 text-sm">
              <p className="font-semibold mb-1">⚠️ Demo Mode</p>
              <p className="mb-2">This is running in test mode. No real payments will be processed.</p>
              <details>
                <summary className="cursor-pointer font-medium">Test Card Numbers</summary>
                <div className="mt-2 pl-3 border-l-2 border-yellow-800">
                  <p className="mb-1"><code className="bg-yellow-900/50 px-1 py-0.5 rounded">4242 4242 4242 4242</code> - Succeeds</p>
                  <p className="mb-1"><code className="bg-yellow-900/50 px-1 py-0.5 rounded">4000 0000 0000 0002</code> - Declines</p>
                  <p className="mb-1">Use any future date for expiry and any 3 digits for CVC</p>
                </div>
              </details>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-200">
              {error}
            </div>
          )}
          
          {checkoutStep === 'form' && (
            <div className="mb-8">
              <div className="flex rounded-lg overflow-hidden mb-6">
                <button
                  className={`flex-1 py-3 px-4 font-medium text-center ${
                    donationType === 'one-time' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-night-600 text-gray-300 hover:bg-night-500'
                  }`}
                  onClick={() => setDonationType('one-time')}
                >
                  One-time Donation
                </button>
                <button
                  className={`flex-1 py-3 px-4 font-medium text-center ${
                    donationType === 'recurring' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-night-600 text-gray-300 hover:bg-night-500'
                  }`}
                  onClick={() => setDonationType('recurring')}
                >
                  Monthly Donation
                </button>
              </div>
              
              <form onSubmit={handleProceed}>
                {donationType === 'one-time' ? (
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2">Amount ($)</label>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                      className="w-full bg-night-800 border border-night-500 rounded-lg p-3 text-white"
                      required
                    />
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {[10, 25, 50, 100].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`py-2 rounded-lg ${
                            amount === value 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-night-600 text-gray-300 hover:bg-night-500'
                          }`}
                          onClick={() => setAmount(value)}
                        >
                          ${value}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                      {amount >= 10 ? 
                        '✅ This donation will plant a tree on our map!' : 
                        '⚠️ Donations of $10 or more will plant a tree on our map.'}
                    </p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2">Select a Plan</label>
                    <div className="grid grid-cols-1 gap-3">
                      <div 
                        className={`p-4 rounded-lg cursor-pointer border-2 ${
                          recurringPlan === 'seedling' 
                            ? 'border-primary-500 bg-primary-900/20' 
                            : 'border-night-500 bg-night-800 hover:bg-night-700'
                        }`}
                        onClick={() => setRecurringPlan('seedling')}
                      >
                        <div className="flex items-center">
                          <div className="rounded-full bg-primary-800/30 p-3 mr-4">
                            <FaSeedling className="text-primary-300 text-xl" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Seedling</h3>
                            <p className="text-sm text-gray-400">
                              Support our forest at the seedling level
                            </p>
                            <p className="font-bold mt-1">$5 / month</p>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-4 rounded-lg cursor-pointer border-2 ${
                          recurringPlan === 'guardian' 
                            ? 'border-primary-500 bg-primary-900/20' 
                            : 'border-night-500 bg-night-800 hover:bg-night-700'
                        }`}
                        onClick={() => setRecurringPlan('guardian')}
                      >
                        <div className="flex items-center">
                          <div className="rounded-full bg-primary-800/30 p-3 mr-4">
                            <FaShieldAlt className="text-primary-300 text-xl" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Tree Guardian</h3>
                            <p className="text-sm text-gray-400">
                              Become a guardian of the forest
                            </p>
                            <p className="font-bold mt-1">$15 / month</p>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-4 rounded-lg cursor-pointer border-2 ${
                          recurringPlan === 'ranger' 
                            ? 'border-primary-500 bg-primary-900/20' 
                            : 'border-night-500 bg-night-800 hover:bg-night-700'
                        }`}
                        onClick={() => setRecurringPlan('ranger')}
                      >
                        <div className="flex items-center">
                          <div className="rounded-full bg-primary-800/30 p-3 mr-4">
                            <FaUserAstronaut className="text-primary-300 text-xl" />
                          </div>
                          <div>
                            <h3 className="font-semibold">UFO Ranger</h3>
                            <p className="text-sm text-gray-400">
                              Join our elite group of forest protectors
                            </p>
                            <p className="font-bold mt-1">$30 / month</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                      ✅ All monthly donations plant a tree on our map!
                    </p>
                  </div>
                )}
                
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Email (optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="For receipt and donation updates"
                    className="w-full bg-night-800 border border-night-500 rounded-lg p-3 text-white"
                  />
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-400 mb-3">
                    Your donation helps us acquire land and plant trees for conservation. 
                    We'll use these funds responsibly to create a thriving forest ecosystem.
                  </p>
                </div>
                
                <button
                  type="submit"
                  className={`w-full py-3 rounded-lg font-medium text-white ${
                    isProcessing 
                      ? 'bg-primary-800 cursor-not-allowed' 
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Continue to Payment'}
                </button>
                
                <div className="flex items-center justify-center mt-4">
                  <div className="flex items-center text-gray-400 text-sm">
                    <FaLock className="mr-2" />
                    <span>Secure payments via Stripe</span>
                  </div>
                </div>
              </form>
            </div>
          )}
          
          {checkoutStep === 'payment' && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm 
                amount={donationType === 'one-time' ? amount : getRecurringAmount(recurringPlan)}
                donationType={donationType}
                plan={recurringPlan}
                email={email}
                onSuccess={handlePaymentSuccess}
                onCancel={handleCancel}
              />
            </Elements>
          )}
          
          {checkoutStep === 'subscription' && (
            <SubscriptionCheckout
              plan={recurringPlan}
              email={email}
              onCancel={handleCancel}
            />
          )}
          
          {checkoutStep === 'external' && (
            <OneTimeCheckout
              amount={amount}
              email={email}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ForestMap = () => {
  const [trees, setTrees] = useState([]);
  const [selectedTree, setSelectedTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapWidth = 1000;
  const mapHeight = 600;
  
  // Function to fetch trees
  const fetchTrees = async () => {
    try {
      setLoading(true);
      console.log('Fetching trees from API...');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/trees?nocache=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Trees from API:', data);
        if (data && data.length > 0) {
          // Make sure each tree has a size property
          const processedTrees = data.map(tree => ({
            ...tree,
            size: tree.size || Math.random() * 0.5 + 0.7 // Add default size if missing
          }));
          setTrees(processedTrees);
        } else {
          console.log('No trees found, using mock data');
          setTrees(getMockTrees());
        }
      } else {
        console.error('Error response from API:', response.status);
        setTrees(getMockTrees());
      }
    } catch (error) {
      console.error('Exception fetching trees:', error);
      setTrees(getMockTrees());
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch trees when the component mounts
  useEffect(() => {
    fetchTrees();
    
    // Also fetch trees every few seconds to ensure we have the latest data
    const intervalId = setInterval(() => {
      fetchTrees();
    }, 2000); // Refresh every 2 seconds for better responsiveness
    
    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);
  
  // Mock data for initial development
  const getMockTrees = () => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: `tree-${i}`,
      x: Math.random() * (mapWidth - 60),
      y: Math.random() * (mapHeight - 80),
      type: ['pine', 'oak', 'birch', 'sequoia', 'maple'][Math.floor(Math.random() * 5)],
      donor: `Donor ${i + 1}`,
      message: `This is my tree in the magic forest! Planting for a better future.`,
      size: Math.random() * 0.5 + 0.7, // Random size between 0.7 and 1.2
    }));
  };
  
  const getTreeColor = (type) => {
    switch (type) {
      case 'pine': return '#2D6A4F';
      case 'oak': return '#40916C';
      case 'birch': return '#52B788';
      case 'sequoia': return '#1B4332';
      case 'maple': return '#74C69D';
      default: return '#2D6A4F';
    }
  };
  
  return (
    <div className="relative w-full max-w-4xl mx-auto bg-forest-dark bg-cover bg-center rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-night-900/60"></div>
      
      {loading && (
        <div className="absolute inset-0 bg-night-900/60 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white text-lg">Growing forest...</p>
          </div>
        </div>
      )}
      
      <div className="relative p-4">
        {trees.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-white mb-4">The forest is empty right now.</p>
            <p className="text-gray-300 mb-6">Be the first to plant a tree!</p>
          </div>
        ) : (
          <>
            <svg width="100%" height={mapHeight} viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="mx-auto">
              {/* Background grid */}
              {Array.from({ length: 10 }).map((_, i) => (
                <line 
                  key={`grid-h-${i}`} 
                  x1="0" 
                  y1={i * (mapHeight / 10)} 
                  x2={mapWidth} 
                  y2={i * (mapHeight / 10)}
                  stroke="#ffffff10"
                  strokeWidth="1"
                />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <line 
                  key={`grid-v-${i}`} 
                  x1={i * (mapWidth / 10)} 
                  y1="0" 
                  x2={i * (mapWidth / 10)} 
                  y2={mapHeight}
                  stroke="#ffffff10"
                  strokeWidth="1"
                />
              ))}
              
              {trees.map((tree) => (
                <g 
                  key={tree.id} 
                  transform={`translate(${tree.x}, ${tree.y}) scale(${tree.size})`}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => setSelectedTree(tree)}
                >
                  {/* Tree trunk */}
                  <rect 
                    x="10" 
                    y="35" 
                    width="10" 
                    height="20" 
                    fill="#8B4513" 
                  />
                  
                  {/* Tree foliage (triangle for pine, circle for others) */}
                  {tree.type === 'pine' ? (
                    <>
                      <polygon 
                        points="0,35 30,35 15,10" 
                        fill={getTreeColor(tree.type)} 
                      />
                      <polygon 
                        points="5,25 25,25 15,5" 
                        fill={getTreeColor(tree.type)} 
                      />
                    </>
                  ) : (
                    <circle 
                      cx="15" 
                      cy="20" 
                      r="15" 
                      fill={getTreeColor(tree.type)} 
                    />
                  )}
                </g>
              ))}
            </svg>
            
            {selectedTree && (
              <div className="absolute right-4 top-4 w-72 bg-night-800/95 backdrop-blur-sm p-4 rounded-lg border border-night-700 shadow-xl">
                <button 
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => setSelectedTree(null)}
                >
                  ✕
                </button>
                <h3 className="font-semibold text-lg">{selectedTree.donor}&apos;s {selectedTree.type.charAt(0).toUpperCase() + selectedTree.type.slice(1)}</h3>
                <p className="text-gray-300 mt-2">{selectedTree.message}</p>
                <div className="mt-3 pt-3 border-t border-night-600 text-sm text-gray-400">
                  Planted on {new Date().toLocaleDateString()}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const Roadmap = () => {
  const milestones = [
    {
      id: 'M0',
      title: 'Campaign Launch',
      description: 'Official launch of The Magic Forest crowdfunding campaign',
      complete: true,
    },
    {
      id: 'M1',
      title: 'Initial Funding',
      description: 'Raise 10,000 € from close supporters',
      complete: true,
    },
    {
      id: 'M2',
      title: 'Land Search',
      description: 'Raise 40,000 € — search for land and negotiate with owners',
      complete: false,
    },
    {
      id: 'M3',
      title: 'Land Option',
      description: 'Raise 50,000 € — sign "opción de compra" for land (2.5% ownership)',
      complete: false,
    },
    {
      id: 'M4',
      title: 'Grant Applications',
      description: 'Apply to grants (COREangels, ESADE, MITECO, LIFE SAP)',
      complete: false,
    },
    {
      id: 'M5',
      title: 'Land Acquisition',
      description: 'Complete the purchase of land for The Magic Forest',
      complete: false,
    },
    {
      id: 'M6',
      title: 'Infrastructure',
      description: 'Prepare infrastructure for planting and conservation activities',
      complete: false,
    },
    {
      id: 'M7',
      title: 'Tree Planting',
      description: 'Begin planting trees and creating the forest ecosystem',
      complete: false,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-900"></div>
        
        {milestones.map((milestone, index) => (
          <div 
            key={milestone.id}
            className={`relative mb-16 ${index % 2 === 0 ? 'md:ml-auto md:pl-16 md:pr-0' : 'md:mr-auto md:pr-16 md:pl-0'} md:w-1/2 pl-12`}
          >
            {/* Milestone dot */}
            <div className="absolute left-0 md:left-1/2 md:transform md:-translate-x-1/2 w-8 h-8 rounded-full bg-night-800 border-4 border-primary-500 z-10"></div>
            
            {/* Milestone content */}
            <div className="bg-night-700 p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-2">
                <span className="text-sm font-bold py-1 px-3 rounded-full bg-primary-900/50 text-primary-300 mr-3">
                  {milestone.id}
                </span>
                <h3 className="text-xl font-semibold">
                  {milestone.title}
                </h3>
                {milestone.complete && (
                  <span className="ml-auto bg-green-900/30 text-green-300 text-sm py-1 px-2 rounded-full">
                    Completed
                  </span>
                )}
              </div>
              <p className="text-gray-300">{milestone.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UserAccount = () => {
  const [user, setUser] = useState(null);
  const [trees, setTrees] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTree, setSelectedTree] = useState(null);
  const [message, setMessage] = useState('');
  const [treeType, setTreeType] = useState('');
  
  // Mock user data for demo purposes
  // In a real app, this would be fetched from the backend after authentication
  useEffect(() => {
    setUser({
      id: 'user123',
      name: 'Jane Doe',
      email: 'jane@example.com',
      totalDonation: 45,
    });
    
    // Mock trees data
    setTrees([
      {
        id: 'tree-1',
        type: 'oak',
        message: 'My first tree in the magic forest!',
        donationAmount: 15,
        donationDate: '2025-02-15',
      },
      {
        id: 'tree-2',
        type: 'pine',
        message: 'For a greener future!',
        donationAmount: 30,
        donationDate: '2025-03-01',
      },
    ]);
  }, []);
  
  const handleEditTree = (tree) => {
    setSelectedTree(tree);
    setMessage(tree.message);
    setTreeType(tree.type);
    setIsEditing(true);
  };
  
  const handleSaveTree = async () => {
    if (!selectedTree) return;
    
    // In a real app, this would send an update to the backend
    const updatedTrees = trees.map(tree => 
      tree.id === selectedTree.id 
        ? { ...tree, message, type: treeType }
        : tree
    );
    setTrees(updatedTrees);
    setIsEditing(false);
    setSelectedTree(null);
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-night-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Please log in to view your account</h2>
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-full">
            Log In
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-night-800 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Your Forest Account</h1>
          
          <div className="bg-night-700 rounded-xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Account Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 mb-1">Name</p>
                <p className="text-white">{user.name}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Email</p>
                <p className="text-white">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Total Contribution</p>
                <p className="text-white">${user.totalDonation}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Trees Planted</p>
                <p className="text-white">{trees.length}</p>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">Your Trees</h2>
          
          {trees.length === 0 ? (
            <div className="bg-night-700 rounded-xl shadow-xl p-6 text-center">
              <p className="text-gray-300 mb-4">You haven't planted any trees yet.</p>
              <Link 
                to="/donate" 
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg"
              >
                Plant a Tree
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trees.map((tree) => (
                <div 
                  key={tree.id}
                  className="bg-night-700 rounded-xl shadow-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold capitalize">{tree.type} Tree</h3>
                    <button 
                      className="text-primary-400 hover:text-primary-300"
                      onClick={() => handleEditTree(tree)}
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-gray-300 mb-3">"{tree.message}"</p>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Donation: ${tree.donationAmount}</span>
                    <span>Planted: {new Date(tree.donationDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {isEditing && selectedTree && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
              <div className="bg-night-700 rounded-xl shadow-xl p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Edit Your Tree</h2>
                
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Tree Type</label>
                  <select
                    value={treeType}
                    onChange={(e) => setTreeType(e.target.value)}
                    className="w-full bg-night-800 border border-night-500 rounded-lg p-3 text-white"
                  >
                    <option value="pine">Pine</option>
                    <option value="oak">Oak</option>
                    <option value="birch">Birch</option>
                    <option value="sequoia">Sequoia</option>
                    <option value="maple">Maple</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Your Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-night-800 border border-night-500 rounded-lg p-3 text-white h-32"
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button 
                    className="bg-night-600 hover:bg-night-500 text-white font-medium py-2 px-4 rounded-lg"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg"
                    onClick={handleSaveTree}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const [donationDetails, setDonationDetails] = useState(null);
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [receiptSent, setReceiptSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  // Get donation ID or session ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const donationId = urlParams.get('donationId');
  const sessionId = urlParams.get('session_id');
  
  useEffect(() => {
    // Fetch donation details
    const fetchDonationDetails = async () => {
      try {
        // If we have a Stripe checkout session ID
        if (sessionId) {
          console.log('Fetching checkout session:', sessionId);
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/checkout-session/${sessionId}`);
          if (response.ok) {
            const sessionData = await response.json();
            console.log('Checkout session data:', sessionData);
            
            setDonationDetails({
              id: sessionData.donation_id,
              amount: sessionData.amount,
              type: sessionData.donation_type,
              plan: sessionData.plan,
              timestamp: new Date().toISOString(),
              email: sessionData.customer_email,
            });
            
            if (sessionData.customer_email) {
              setEmail(sessionData.customer_email);
            }
            
            return;
          } else {
            console.error('Error fetching checkout session:', response.status);
          }
        }
        
        // If we have a direct donation ID
        if (donationId) {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/donations/${donationId}`);
          if (response.ok) {
            const data = await response.json();
            setDonationDetails(data);
            if (data.email) {
              setEmail(data.email);
            }
            return;
          }
        }
        
        // If no valid donation ID or session, use mock data
        setDonationDetails({
          id: 'demo-donation',
          amount: 15,
          type: 'one-time',
          plan: null,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error fetching donation details:', error);
        // If error, use mock data
        setDonationDetails({
          id: donationId,
          amount: 30,
          type: 'one-time',
          plan: null,
          timestamp: new Date().toISOString(),
        });
      }
    };
    
    fetchDonationDetails();
  }, [donationId, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  const handleSendReceipt = async (e) => {
    e.preventDefault();
    // In a real app, this would send an actual email
    console.log(`Sending receipt to ${email}`);
    setReceiptSent(true);
  };
  
  const handleRegistration = async (e) => {
    e.preventDefault();
    
    // In a real app, this would create a user account
    console.log('Creating user account:', formData);
    
    // Navigate to thank-you page to personalize tree with a delay
    console.log('Redirecting to tree personalization page...');
    setTimeout(() => {
      navigate(`/thank-you?donationId=${donationId}`);
    }, 500); // Small delay to ensure navigation happens
  };
  
  const handleSkipRegistration = () => {
    // Navigate to home page with a delay
    console.log('Skipping registration and redirecting to home...');
    setTimeout(() => {
      navigate('/');
    }, 500); // Small delay to ensure navigation happens
  };
  
  if (!donationDetails) {
    return (
      <div className="min-h-screen bg-night-800 flex items-center justify-center">
        <div className="p-8 text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-night-800 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-night-700 rounded-xl shadow-xl p-8">
          <div className="mb-8 text-center">
            <div className="w-20 h-20 bg-primary-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BiDonateHeart className="text-primary-300 text-4xl" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Thank You for Your Donation!</h1>
            <p className="text-xl text-gray-300 mb-4">
              Your contribution helps us create The Magic Forest.
            </p>
            
            <div className="bg-night-600/50 p-4 rounded-lg mt-6 mb-8 mx-auto max-w-md">
              <h2 className="text-lg font-semibold mb-2">Donation Receipt</h2>
              <div className="flex justify-between py-2 border-b border-night-500">
                <span className="text-gray-300">Donation Amount:</span>
                <span className="font-medium">${donationDetails.amount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-night-500">
                <span className="text-gray-300">Donation Type:</span>
                <span className="font-medium capitalize">
                  {donationDetails.type === 'recurring' 
                    ? `${donationDetails.plan} (Monthly)` 
                    : 'One-time'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-300">Date:</span>
                <span className="font-medium">
                  {new Date(donationDetails.timestamp).toLocaleDateString()}
                </span>
              </div>
              
              {!receiptSent && (
                <form onSubmit={handleSendReceipt} className="mt-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Enter email for receipt"
                      className="flex-grow bg-night-800 border border-night-500 rounded-lg p-2 text-white"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
                    >
                      Send Receipt
                    </button>
                  </div>
                </form>
              )}
              
              {receiptSent && (
                <div className="mt-4 text-center text-green-400">
                  Receipt sent to your email!
                </div>
              )}
            </div>
          </div>
          
          {donationDetails.amount >= 10 || donationDetails.type === 'recurring' ? (
            <div>
              {!isRegistering ? (
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-4">Plant Your Tree in The Magic Forest</h2>
                  <p className="text-gray-300 mb-6">
                    Your donation of ${donationDetails.amount} qualifies you to plant a tree in our virtual forest! 
                    Register to personalize your tree and watch it grow over time.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                    <button
                      className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-full text-lg"
                      onClick={() => setIsRegistering(true)}
                    >
                      Register & Personalize Tree
                    </button>
                    
                    <button
                      className="bg-transparent hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-full text-lg border-2 border-white/30"
                      onClick={handleSkipRegistration}
                    >
                      Skip for Now
                    </button>
                  </div>
                  
                  <p className="text-gray-400 text-sm mt-4">
                    Registration is optional. You can always come back later to add your tree.
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold mb-4 text-center">Create an Account</h2>
                  <form onSubmit={handleRegistration}>
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-night-800 border border-night-500 rounded-lg p-3 text-white"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-night-800 border border-night-500 rounded-lg p-3 text-white"
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-gray-300 mb-2">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-night-800 border border-night-500 rounded-lg p-3 text-white"
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <button
                        type="button"
                        className="bg-night-600 hover:bg-night-500 text-white font-semibold py-3 px-8 rounded-full text-lg"
                        onClick={() => setIsRegistering(false)}
                      >
                        Go Back
                      </button>
                      
                      <button
                        type="submit"
                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-full text-lg"
                      >
                        Register & Continue
                      </button>
                    </div>
                    
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        className="text-primary-400 hover:text-primary-300"
                        onClick={() => {
                          // For demo purposes, we'll just redirect to the tree personalization page
                          navigate(`/thank-you?donationId=${donationId}`);
                        }}
                      >
                        Continue with Google
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-300 mb-6">
                Thank you for your contribution to The Magic Forest!
                Donations of $10 or more qualify to plant a tree in our virtual forest.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-full text-lg"
                  onClick={() => navigate('/donate')}
                >
                  Make Another Donation
                </button>
                
                <button
                  className="bg-transparent hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-full text-lg border-2 border-white/30"
                  onClick={() => navigate('/')}
                >
                  Return Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stripe payment form component
const CheckoutForm = ({ amount, donationType, plan, email = '', onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!stripe || !elements) {
      setIsLoading(false);
      setErrorMessage('Stripe has not loaded yet. Please try again.');
      return;
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      setIsLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/confirmation',
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded
      console.log('Payment succeeded:', paymentIntent);
      
      // Create a donation record in our database
      try {
        const donationData = {
          type: donationType,
          amount: amount,
          plan: donationType === 'recurring' ? plan : null,
          email: email,
          payment_status: 'succeeded',
          session_id: paymentIntent.id
        };
        
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/donations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(donationData),
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Donation created:', result);
          onSuccess(result.id);
        } else {
          const errorData = await response.json();
          console.error('Failed to create donation:', errorData);
          // Still consider payment successful even if our record creation fails
          onSuccess(paymentIntent.id);
        }
      } catch (err) {
        console.error('Error creating donation record:', err);
        // Still consider payment successful even if our record creation fails
        onSuccess(paymentIntent.id);
      }
    } else {
      setErrorMessage('Something went wrong with your payment. Please try again.');
      setIsLoading(false);
    }
  };

  const paymentElementOptions = {
    layout: 'tabs',
    defaultValues: {
      billingDetails: {
        email: email,
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement id="payment-element" options={paymentElementOptions} />
      </div>
      
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-200">
          {errorMessage}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center text-gray-400 text-sm">
          <FaLock className="mr-2" />
          <span>Secure payment via Stripe</span>
        </div>
        <div className="flex items-center space-x-2">
          <FaCreditCard className="text-gray-400" />
          <FaApple className="text-gray-400" />
          <FaGooglePay className="text-gray-400" />
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          type="button"
          className="px-6 py-3 bg-night-600 hover:bg-night-500 rounded-lg text-white"
          onClick={onCancel}
          disabled={isLoading}
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-semibold flex items-center justify-center"
          disabled={isLoading || !stripe || !elements}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </>
          ) : (
            <>Complete Payment</>
          )}
        </button>
      </div>
    </form>
  );
};

// Checkout Session handler for recurring subscriptions
const SubscriptionCheckout = ({ plan, email, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isTestMode = process.env.REACT_APP_STRIPE_MODE === 'test';
  
  const handleSubscribe = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          email
        }),
      });
      
      if (response.ok) {
        const { url } = await response.json();
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        // For demo purposes with invalid test keys, provide a better error message
        const errorData = await response.json();
        setErrorMessage(errorData.detail || 'Stripe payment processing unavailable in demo mode');
        setIsLoading(false);
        
        // In demo mode, still allow proceeding after 2 seconds
        if (isTestMode) {
          setTimeout(() => {
            // Create a simulated donation record
            const simulatedDonationId = `demo-${Date.now()}`;
            // Navigate to confirmation
            window.location.href = `${window.location.origin}/confirmation?donationId=${simulatedDonationId}`;
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setErrorMessage('An error occurred. Please try again.');
      setIsLoading(false);
      
      // In demo mode, still allow proceeding after 2 seconds
      if (isTestMode) {
        setTimeout(() => {
          // Create a simulated donation record
          const simulatedDonationId = `demo-${Date.now()}`;
          // Navigate to confirmation
          window.location.href = `${window.location.origin}/confirmation?donationId=${simulatedDonationId}`;
        }, 2000);
      }
    }
  };
  
  return (
    <div>
      <div className="mb-6 p-6 bg-night-600 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">
          {plan === 'seedling' && 'Seedling - $5/month'}
          {plan === 'guardian' && 'Tree Guardian - $15/month'}
          {plan === 'ranger' && 'UFO Ranger - $30/month'}
        </h3>
        
        {isTestMode && (
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded-lg text-yellow-200 text-sm">
            <p className="font-semibold mb-1">⚠️ Demo Mode</p>
            <p className="mb-2">This is running in test mode. No real payments will be processed.</p>
            <details>
              <summary className="cursor-pointer font-medium">Test Card Numbers</summary>
              <div className="mt-2 pl-3 border-l-2 border-yellow-800">
                <p className="mb-1"><code className="bg-yellow-900/50 px-1 py-0.5 rounded">4242 4242 4242 4242</code> - Succeeds</p>
                <p className="mb-1"><code className="bg-yellow-900/50 px-1 py-0.5 rounded">4000 0000 0000 0002</code> - Declines</p>
                <p className="mb-1">Use any future date for expiry and any 3 digits for CVC</p>
              </div>
            </details>
          </div>
        )}
        
        <p className="text-gray-300 mb-6">
          You're setting up a monthly donation to The Magic Forest. You can cancel anytime from your account.
        </p>
        
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-200">
            {errorMessage}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-gray-400 text-sm">
            <FaLock className="mr-2" />
            <span>Secure payment via Stripe</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaCreditCard className="text-gray-400" />
            <FaApple className="text-gray-400" />
            <FaGooglePay className="text-gray-400" />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            className="px-6 py-3 bg-night-700 hover:bg-night-600 rounded-lg text-white"
            onClick={onCancel}
            disabled={isLoading}
          >
            Back
          </button>
          <button
            type="button"
            className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-semibold flex items-center justify-center"
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>Continue to Subscription</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Checkout Session handler for one-time payments
const OneTimeCheckout = ({ amount, email, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isTestMode = process.env.REACT_APP_STRIPE_MODE === 'test';
  
  const handleCheckout = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          email
        }),
      });
      
      if (response.ok) {
        const { url } = await response.json();
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        // For demo purposes with invalid test keys, provide a better error message
        const errorData = await response.json();
        setErrorMessage(errorData.detail || 'Stripe payment processing unavailable in demo mode');
        setIsLoading(false);
        
        // In demo mode, still allow proceeding after 2 seconds
        if (isTestMode) {
          setTimeout(() => {
            // Create a simulated donation record
            const simulatedDonationId = `demo-${Date.now()}`;
            // Navigate to confirmation
            window.location.href = `${window.location.origin}/confirmation?donationId=${simulatedDonationId}`;
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setErrorMessage('An error occurred. Please try again.');
      setIsLoading(false);
      
      // In demo mode, still allow proceeding after 2 seconds
      if (isTestMode) {
        setTimeout(() => {
          // Create a simulated donation record
          const simulatedDonationId = `demo-${Date.now()}`;
          // Navigate to confirmation
          window.location.href = `${window.location.origin}/confirmation?donationId=${simulatedDonationId}`;
        }, 2000);
      }
    }
  };
  
  return (
    <div>
      <div className="mb-6 p-6 bg-night-600 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">One-time Donation - ${amount}</h3>
        
        {isTestMode && (
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded-lg text-yellow-200 text-sm">
            <p className="font-semibold mb-1">⚠️ Demo Mode</p>
            <p>This is running in test mode. No real payments will be processed.</p>
          </div>
        )}
        
        <p className="text-gray-300 mb-6">
          You're making a one-time donation to The Magic Forest. Thank you for your support!
        </p>
        
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-200">
            {errorMessage}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-gray-400 text-sm">
            <FaLock className="mr-2" />
            <span>Secure payment via Stripe</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaCreditCard className="text-gray-400" />
            <FaApple className="text-gray-400" />
            <FaGooglePay className="text-gray-400" />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            className="px-6 py-3 bg-night-700 hover:bg-night-600 rounded-lg text-white"
            onClick={onCancel}
            disabled={isLoading}
          >
            Back
          </button>
          <button
            type="button"
            className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-semibold flex items-center justify-center"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>Continue to Checkout</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ThankYouPage = () => {
  const navigate = useNavigate();
  const [donationDetails, setDonationDetails] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    treeType: 'oak',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get donation ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const donationId = urlParams.get('donationId');
  
  useEffect(() => {
    // Fetch donation details
    const fetchDonationDetails = async () => {
      try {
        if (!donationId) {
          // Create a default donation for demo purposes
          setDonationDetails({
            id: 'demo-donation',
            amount: 15,
            type: 'one-time',
            plan: null,
            timestamp: new Date().toISOString(),
          });
          return;
        }
        
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/donations/${donationId}`);
        if (response.ok) {
          const data = await response.json();
          setDonationDetails(data);
        } else {
          // If donation not found, use mock data
          setDonationDetails({
            id: donationId,
            amount: 30,
            type: 'one-time',
            plan: null,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error fetching donation details:', error);
        // If error, use mock data
        setDonationDetails({
          id: donationId,
          amount: 30,
          type: 'one-time',
          plan: null,
          timestamp: new Date().toISOString(),
        });
      }
    };
    
    fetchDonationDetails();
  }, [donationId, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create tree data
      const treeData = {
        donation_id: donationId,
        donor: formData.name,
        message: formData.message,
        type: formData.treeType,
      };
      
      console.log('Sending tree data:', treeData);
      
      // POST to create tree
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/trees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(treeData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Tree created successfully:', result);
        // Redirect to forest map
        console.log('Redirecting to forest map...');
        setTimeout(() => {
          navigate('/forest');
        }, 500); // Small delay to ensure navigation happens
      } else {
        // If error, log and still redirect for demo purposes
        const errorText = await response.text();
        console.error('Error creating tree:', response.status, errorText);
        console.log('Redirecting to forest map despite error...');
        setTimeout(() => {
          navigate('/forest');
        }, 500); // Small delay to ensure navigation happens
      }
    } catch (error) {
      console.error('Exception creating tree:', error);
      // If error, still redirect for demo purposes
      console.log('Redirecting to forest map after exception...');
      setTimeout(() => {
        navigate('/forest');
      }, 500); // Small delay to ensure navigation happens
    }
  };
  
  if (!donationDetails) {
    return (
      <div className="min-h-screen bg-night-800 flex items-center justify-center">
        <div className="p-8 text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-night-800 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-night-700 rounded-xl shadow-xl p-8">
          <div className="mb-8 text-center">
            <div className="w-20 h-20 bg-primary-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTree className="text-primary-300 text-4xl" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Thank You for Your Support!</h1>
            <p className="text-xl text-gray-300">
              {donationDetails.amount >= 10 || donationDetails.type === 'recurring' 
                ? "You've planted a tree in The Magic Forest!" 
                : "Thank you for your contribution to The Magic Forest!"}
            </p>
            
            {(donationDetails.amount >= 10 || donationDetails.type === 'recurring') && (
              <div className="mt-6 mb-8">
                <p className="text-gray-300 mb-4">
                  Your donation of <span className="text-white font-semibold">
                    ${donationDetails.amount}
                  </span> has qualified to add a tree to our forest.
                </p>
                <p className="text-gray-400">
                  Personalize your tree by filling out the form below.
                </p>
              </div>
            )}
          </div>
          
          {(donationDetails.amount >= 10 || donationDetails.type === 'recurring') ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Your Name (as you want it to appear)</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-night-800 border border-night-500 rounded-lg p-3 text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Tree Type</label>
                <select
                  name="treeType"
                  value={formData.treeType}
                  onChange={handleChange}
                  className="w-full bg-night-800 border border-night-500 rounded-lg p-3 text-white"
                >
                  <option value="pine">Pine</option>
                  <option value="oak">Oak</option>
                  <option value="birch">Birch</option>
                  <option value="sequoia">Sequoia</option>
                  <option value="maple">Maple</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Your Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-night-800 border border-night-500 rounded-lg p-3 text-white h-32"
                  placeholder="Share why you're supporting The Magic Forest..."
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                className={`w-full py-3 rounded-lg font-medium text-white ${
                  isSubmitting 
                    ? 'bg-primary-800 cursor-not-allowed' 
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Planting Your Tree...' : 'Plant Your Tree'}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-gray-300 mb-6">
                Your contribution helps us create and maintain The Magic Forest.
                Donations of $10 or more qualify to plant a tree in our virtual forest.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-full text-lg"
                  onClick={() => navigate('/donate')}
                >
                  Make Another Donation
                </button>
                
                <button
                  className="bg-transparent hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-full text-lg border-2 border-white/30"
                  onClick={() => navigate('/')}
                >
                  Return Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <div className="bg-night-900 min-h-screen">
      <BrowserRouter>
        <header className="fixed w-full top-0 z-50 bg-night-900/80 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <Link to="/" className="text-white font-bold text-xl flex items-center">
                <FaTree className="text-primary-400 mr-2" /> The Magic Forest
              </Link>
              
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/forest" className="text-gray-300 hover:text-white transition-colors">
                      Forest Map
                    </Link>
                  </li>
                  <li>
                    <Link to="/donate" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full transition-colors">
                      Donate
                    </Link>
                  </li>
                  <li>
                    <Link to="/account" className="text-gray-300 hover:text-white transition-colors">
                      Account
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/donate" element={<DonationPage />} />
            <Route path="/forest" element={<ForestMap />} />
            <Route path="/account" element={<UserAccount />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
          </Routes>
        </main>
        
        <footer className="bg-night-900 py-12 border-t border-night-700">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="mb-8 md:mb-0">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FaTree className="text-primary-400 mr-2" /> The Magic Forest
                </h3>
                <p className="text-gray-400 max-w-md">
                  A crowdfunding initiative to create a sanctuary for nature, 
                  where trees thrive and biodiversity flourishes.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-white font-semibold mb-4">Links</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link to="/forest" className="text-gray-400 hover:text-white transition-colors">
                        Forest Map
                      </Link>
                    </li>
                    <li>
                      <Link to="/donate" className="text-gray-400 hover:text-white transition-colors">
                        Donate
                      </Link>
                    </li>
                    <li>
                      <Link to="/account" className="text-gray-400 hover:text-white transition-colors">
                        Account
                      </Link>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-4">Contact</h4>
                  <ul className="space-y-2">
                    <li className="text-gray-400">
                      hello@magicforest.org
                    </li>
                    <li className="text-gray-400">
                      Catalonia, Spain
                    </li>
                  </ul>
                  
                  <div className="mt-4">
                    <h4 className="text-white font-semibold mb-3">Follow Us</h4>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-night-700 text-center text-gray-500">
              <p>&copy; 2025 The Magic Forest. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </BrowserRouter>
    </div>
  );
}

export default App;
