'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, MessageCircle, Mail, Phone, HelpCircle, Shield, User, CreditCard, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageBanner from '../components/PageBanner';

const FAQ = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('general');
    const [expandedItem, setExpandedItem] = useState(null);

    const faqData = {
        general: {
            icon: HelpCircle,
            label: 'General',
            color: 'from-blue-500 to-blue-600',
            questions: [
                {
                    id: 'gen-1',
                    question: 'What is this ride-sharing service?',
                    answer: 'Our ride-sharing service is a modern, convenient platform that connects riders with verified drivers. We provide safe, affordable, and reliable transportation options for your daily commute and special occasions.'
                },
                {
                    id: 'gen-2',
                    question: 'How does the platform work?',
                    answer: 'Simply download our app, create an account, enter your pickup and destination locations, and request a ride. Our advanced matching algorithm connects you with the nearest available driver who will pick you up and safely transport you to your destination.'
                }
            ]
        },
        booking: {
            icon: MapPin,
            label: 'Booking Ride',
            color: 'from-green-500 to-green-600',
            questions: [
                {
                    id: 'book-1',
                    question: 'How can I book a ride?',
                    answer: 'Open the app, enter your pickup location and destination, select your preferred ride type, and confirm the booking. You\'ll see the driver details and estimated arrival time immediately.'
                },
                {
                    id: 'book-2',
                    question: 'Can I schedule a ride in advance?',
                    answer: 'Yes! You can schedule rides up to 7 days in advance. Simply select the "Schedule for later" option when booking, choose your preferred date and time, and we\'ll match you with a driver accordingly.'
                },
                {
                    id: 'book-3',
                    question: 'How do I cancel a ride?',
                    answer: 'You can cancel before the driver arrives without any charges. After the driver starts driving towards you, a cancellation fee may apply. Tap the cancel button in the app to cancel your current ride.'
                }
            ]
        },
        payments: {
            icon: CreditCard,
            label: 'Payments',
            color: 'from-purple-500 to-purple-600',
            questions: [
                {
                    id: 'pay-1',
                    question: 'What payment methods are available?',
                    answer: 'We accept credit cards, debit cards, digital wallets (Apple Pay, Google Pay), and cash payments. You can add and manage multiple payment methods in your account settings.'
                },
                {
                    id: 'pay-2',
                    question: 'Can I apply promo codes?',
                    answer: 'Absolutely! You can apply promo codes during checkout. Go to your account, select "Promo Codes", enter the code, and it will be applied to your next ride. Check our offers page for ongoing promotions.'
                },
                {
                    id: 'pay-3',
                    question: 'How are fares calculated?',
                    answer: 'Our fares are calculated based on distance, duration, current demand, and ride type. The estimated fare is shown before you confirm your booking, and the final amount may vary slightly based on actual route taken.'
                }
            ]
        },
        safety: {
            icon: Shield,
            label: 'Driver & Safety',
            color: 'from-red-500 to-red-600',
            questions: [
                {
                    id: 'safe-1',
                    question: 'Are drivers verified?',
                    answer: 'Yes, all drivers undergo thorough background checks, vehicle inspections, and license verification before joining our platform. We continuously monitor driver ratings and maintain high quality standards.'
                },
                {
                    id: 'safe-2',
                    question: 'What safety features are available?',
                    answer: 'Safety features include real-time ride tracking, emergency call button, driver and rider verification, GPS location sharing with emergency contacts, and our 24/7 support team ready to assist.'
                },
                {
                    id: 'safe-3',
                    question: 'How can I report an issue?',
                    answer: 'You can report issues through the app under "Help & Support" > "Report an Issue". Provide details about the incident, and our support team will investigate and respond within 24 hours.'
                }
            ]
        },
        account: {
            icon: User,
            label: 'Account & Profile',
            color: 'from-orange-500 to-orange-600',
            questions: [
                {
                    id: 'acc-1',
                    question: 'How do I create an account?',
                    answer: 'Download the app, tap "Sign Up", enter your email or phone number, create a password, and complete the verification process. Add your profile photo and basic details to get started.'
                },
                {
                    id: 'acc-2',
                    question: 'How can I update my profile?',
                    answer: 'Go to Account Settings in the app, select "Edit Profile", and update your information such as name, phone number, profile picture, emergency contacts, and payment methods.'
                },
                {
                    id: 'acc-3',
                    question: 'I forgot my password, what should I do?',
                    answer: 'On the login screen, tap "Forgot Password", enter your registered email or phone number, and follow the verification steps. We\'ll send you a password reset link to create a new password.'
                }
            ]
        }
    };

    // Search functionality
    const filteredFAQs = useMemo(() => {
        if (!searchQuery.trim()) {
            return faqData[activeCategory].questions;
        }

        const query = searchQuery.toLowerCase();
        let results = [];

        Object.values(faqData).forEach(category => {
            results = results.concat(
                category.questions.filter(
                    q => q.question.toLowerCase().includes(query) ||
                        q.answer.toLowerCase().includes(query)
                )
            );
        });

        return results;
    }, [searchQuery, activeCategory]);

    const currentCategory = faqData[activeCategory];
    const CurrentIcon = currentCategory.icon;

    const toggleExpand = (id) => {
        setExpandedItem(expandedItem === id ? null : id);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    };

    return (
        <div className="min-h-screen bg-[#f4f6f9]">
            <PageBanner
                tag="OnWay Support"
                title="FAQ"
                subtitle="Find answers to common questions about our ride-sharing service."
            />
            {/* Hero Section — replaced by banner above, keep search */}
            <div className="max-w-4xl mx-auto px-6 pt-12 pb-4">
                <motion.div
                    className="max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2FCA71] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search FAQs..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory('general'); }}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white text-[#011421] placeholder-gray-400 focus:outline-none focus:border-[#2FCA71] focus:ring-2 focus:ring-[#2FCA71]/20 shadow-sm transition-all"
                        />
                    </div>
                </motion.div>
            </div>

            {/* Main Content */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {/* Category Tabs */}
                {!searchQuery && (
                    <motion.div
                        className="flex flex-wrap gap-3 mb-12 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        {Object.entries(faqData).map(([key, category]) => {
                            const Icon = category.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveCategory(key)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                                        activeCategory === key
                                            ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                                            : 'bg-white text-color-neutral border-2 border-transparent hover:border-primary/30 shadow-md hover:shadow-lg'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{category.label}</span>
                                </button>
                            );
                        })}
                    </motion.div>
                )}

                {/* FAQ Items */}
                <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AnimatePresence mode="wait">
                        {filteredFAQs.length > 0 ? (
                            filteredFAQs.map((item) => (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    layout
                                    className="group"
                                >
                                    <button
                                        onClick={() => toggleExpand(item.id)}
                                        className="w-full text-left"
                                    >
                                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-transparent group-hover:border-primary">
                                            <div className="flex items-center justify-between gap-4">
                                                <h3 className="text-lg font-semibold text-color-neutral pr-4">
                                                    {item.question}
                                                </h3>
                                                <motion.div
                                                    animate={{ rotate: expandedItem === item.id ? 180 : 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="flex-shrink-0"
                                                >
                                                    <ChevronDown className="w-6 h-6 text-primary" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {expandedItem === item.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="bg-base-100 border-l-4 border-primary rounded-b-xl p-6 mt-1">
                                                    <p className="text-color-neutral/80 leading-relaxed">
                                                        {item.answer}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center py-12"
                            >
                                <Search className="w-16 h-16 text-color-neutral/30 mx-auto mb-4" />
                                <p className="text-color-neutral/60 text-lg">
                                    No FAQs found matching "{searchQuery}"
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </section>

            {/* Contact Support Section */}
            <motion.section
                className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 to-accent/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold text-color-neutral mb-4">
                                Still have questions?
                            </h2>
                            <p className="text-lg text-color-neutral/70">
                                Our dedicated support team is here to help you. Reach out to us through any of these channels.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Email Support */}
                            <motion.a
                                href="mailto:support@onway.com"
                                whileHover={{ y: -10 }}
                                className="group text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-lg transition-all duration-300 border border-blue-200/50"
                            >
                                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Mail className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-color-neutral mb-2">Email Support</h3>
                                <p className="text-color-neutral/70 mb-3">support@onway.com</p>
                                <p className="text-sm text-color-neutral/60">Response within 24 hours</p>
                            </motion.a>

                            {/* Phone Support */}
                            <motion.a
                                href="tel:+1234567890"
                                whileHover={{ y: -10 }}
                                className="group text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-lg transition-all duration-300 border border-green-200/50"
                            >
                                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Phone className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-color-neutral mb-2">Phone Support</h3>
                                <p className="text-color-neutral/70 mb-3">+1 (234) 567-890</p>
                                <p className="text-sm text-color-neutral/60">Available 24/7</p>
                            </motion.a>

                            {/* Live Chat */}
                            <motion.button
                                onClick={() => {
                                    // You can integrate Intercom, Zendesk, or similar here
                                    alert('Live chat feature would be integrated with your support platform');
                                }}
                                whileHover={{ y: -10 }}
                                className="group text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-lg transition-all duration-300 border border-purple-200/50"
                            >
                                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <MessageCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-color-neutral mb-2">Live Chat</h3>
                                <p className="text-color-neutral/70 mb-3">Chat with us instantly</p>
                                <p className="text-sm text-color-neutral/60">Average response: 2 minutes</p>
                            </motion.button>
                        </div>

                        {/* Action Button */}
                        <motion.div
                            className="text-center mt-12"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <button className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                                Contact Our Support Team
                            </button>
                        </motion.div>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default FAQ;