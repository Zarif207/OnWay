🚖 OnWay - Ride Sharing Platform
<p align="center"> <img src="https://i.ibb.co.com/35Hc5k4n/onway.png" alt="OnWay Banner" /> </p>
🔗 Live Demo

👉 https://onway-5g8a.onrender.com/

📦 Repository

👉 https://github.com/Zarif207/OnWay

📌 Project Overview

OnWay is a full-stack ride-sharing platform inspired by Uber and Pathao. It connects passengers with drivers in real-time, while support agents ensure safety and admins manage the entire system.

🎯 Core Goal: Safe, affordable, and real-time transportation with modern features like live tracking, SOS system, and secure payments.

🚀 Key Features
👤 Passenger
Ride booking system
Real-time ride tracking (Google Maps)
Secure online payments
Ride history & trip details
🚨 SOS emergency button
🚗 Driver
Accept/Reject ride requests
OTP-based trip verification
Navigation support
Earnings tracking
Withdrawal system
🛡️ Support Agent
Live chat support
SOS alert handling
Complaint management
Refund processing
👨‍💼 Admin
Manage users, drivers, and rides
Monitor transactions
Promo code system
Full system control
👥 Role-Based Dashboard System
Role	Pages	Features
👨‍💼 Admin	5	Manage system, users, payments
🚗 Passenger	5	Book rides, track trips
👨‍🚗 Driver	10	Accept rides, earn money
🛡️ Support Agent	4	Handle SOS & support
🔐 Authentication & Security
NextAuth.js based authentication
Google OAuth (International users)
Phone OTP (Bangladesh users)
Email/Password login system
🔑 Role-Based Redirection
Passenger → /dashboard/passenger
Driver → /dashboard/driver
Admin → /admin/overview
Support → /support/alerts
🔒 Security Features
JWT token with role-based claims
Protected routes (middleware)
Session persistence (no logout on reload)
Firebase integration
📱 Application Structure
🌐 Public Pages
Home (Booking preview)
Rider Trips & Rentals
About / Help / Blog
AI Chatbot
🔐 Protected Dashboards
Passenger Dashboard
Driver Dashboard
Admin Panel
Support Agent Panel
🛠️ Tech Stack

Frontend:

Next.js 14
Tailwind CSS

Backend & Tools:

NextAuth.js
MongoDB
Socket.io (Real-time)

Integrations:

Google Maps API (Location tracking)
SSLCommerz (Local payments)
Stripe (International payments)

Deployment:

Vercel
Render

# Clone the repository
git clone https://github.com/Zarif207/OnWay.git

# Go to project folder
cd OnWay

# Install dependencies
npm install

# Run the development server
npm run dev
