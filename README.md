<div align="center">


![OnWay Banner](https://i.ibb.co.com/8L4DX1MM/image.png)

# 🚗 OnWay

### *Your Journey, Your Way — A Smart Ride-Sharing Platform*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

</div>

---

## 🚀 Project Overview

**OnWay** is a full-stack, production-grade smart ride-sharing platform built to modernize urban transportation in Bangladesh. It connects passengers with nearby drivers in real time, offering a seamless, safe, and affordable travel experience — all from a single web application.

Traditional ride-sharing solutions often lack transparency, real-time communication, and intelligent pricing. OnWay addresses these gaps by combining live GPS tracking, AI-powered driver matching, weather-based dynamic pricing, and secure digital payments into one unified platform.

Whether you're a daily commuter or a driver looking to earn, OnWay delivers a premium experience with enterprise-level reliability.

---

## ✨ Core Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Smart Ride Booking** | Passengers can instantly request rides with pickup/drop-off location selection and real-time driver matching |
| 2 | **Real-Time GPS Tracking** | Live map tracking of driver location during the ride using Socket.io and GPS integration |
| 3 | **Dynamic Fare Estimation** | Intelligent fare calculation based on distance, ride type, surge multiplier, and weather conditions |
| 4 | **In-App Call & Chat** | Seamless communication between passengers and drivers without sharing personal numbers |
| 5 | **Digital Payment (SSLCommerz)** | Secure online payment gateway integration supporting bKash, Nagad, Upay, and bank cards |
| 6 | **Ride History & Invoice** | Passengers can view all past rides, download PDF invoices, and track spending |
| 7 | **Safety Features (SOS)** | One-tap emergency alert system that notifies authorities and trusted contacts |
| 8 | **Real-Time Driver Matching** | Smart algorithm that matches passengers with the nearest available and verified driver |
| 9 | **Face Verification** | AI-powered face recognition to verify driver identity before each ride |
| 10 | **Driving License Extraction** | Automated extraction of driver information from license documents using AI/OCR |
| 11 | **Traffic Monitoring** | Real-time road traffic data integration to optimize routes and pricing |
| 12 | **KYC Verification** | Full identity verification pipeline for drivers including document and face validation |
| 13 | **Item Recovery** | Lost item reporting system with status tracking and recovery coordination |
| 14 | **OTP Verification** | Secure one-time password authentication for login and signup flows |
| 15 | **Driver Rating & Review** | Post-ride rating and review system to maintain driver quality standards |
| 16 | **Promo Code & Discounts** | Promotional code system with configurable discount rules for passengers |
| 17 | **AI Chatbot** | Intelligent conversational support bot to assist users with queries and issues |
| 18 | **Newsletter** | Email subscription system for platform updates, offers, and announcements |
| 19 | **Demand Prediction** | Data-driven ride demand forecasting to optimize driver availability |
| 20 | **Dynamic Pricing (Weather-Based)** | Automatic fare adjustment based on real-time weather conditions and demand |

---

## 👨‍💻 Feature Ownership

> Each feature was owned and developed by a dedicated team member from **DevVibe**.

| Feature | Description | Developer |
|---------|-------------|-----------|
| Smart Ride Booking (Instant Request) | Users can instantly request rides | **Minhaj** |
| Real-Time GPS Tracking | Live tracking of rides using GPS | **Minhaj** |
| Fare Estimation | Estimated ride cost before booking | **Minhaj** |
| Newsletter | Email subscription system | **Minhaj** |
| In-App Call & Chat | Communication between rider and driver | **Shourov** |
| OTP Verification | Secure login/signup with OTP | **Shourov** |
| Promo Code & Discounts | Offers and discount system | **Shourov** |
| AI Chatbot | AI-powered user support chatbot | **Shourov** |
| Digital Payment (SSLCommerz) | Secure online payment integration | **Zubaer** |
| Safety Features (SOS) | Emergency alert system for users | **Zubaer** |
| Traffic Monitoring | Road traffic status handling system | **Zubaer** |
| Driver Rating & Review | Rating system for drivers | **Zubaer** |
| Ride History & Invoice | Users can view past rides and invoices | **Isthiak** |
| Item Recovery | Lost item reporting and recovery system | **Isthiak** |
| Demand Prediction | Predict ride demand using data | **Isthiak** |
| Dynamic Pricing (Weather-Based) | Pricing changes based on weather conditions | **Isthiak** |
| Real-Time Driver Matching | Smart driver allocation system | **Zarif** |
| Face Verification | Identity verification using face recognition | **Zarif** |
| Driving License Extraction | Extract driver info using AI/parsing tools | **Zarif** |
| KYC Verification | User identity verification system | **Zarif** |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 15** | React framework with App Router |
| **React** | Component-based UI library |
| **Tailwind CSS** | Utility-first CSS framework |
| **Framer Motion** | Animations and transitions |
| **Socket.io Client** | Real-time communication |
| **Recharts** | Data visualization and charts |
| **Leaflet / React-Leaflet** | Interactive maps and GPS tracking |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | RESTful API framework |
| **Socket.io** | Real-time bidirectional communication |
| **MongoDB Atlas** | Cloud NoSQL database |
| **NextAuth.js** | Authentication (Google, GitHub, Credentials) |
| **SSLCommerz** | Payment gateway integration |
| **Cloudinary** | Image and file storage |
| **JWT** | Secure token-based authorization |

### DevOps & Tools
| Technology | Purpose |
|-----------|---------|
| **Vercel** | Frontend deployment |
| **Render** | Backend deployment |
| **GitHub** | Version control and collaboration |
| **Postman** | API testing |

---

## 📸 Screenshots

> UI screenshots will be added here after final deployment.

| Page | Preview |
|------|---------|
| 🏠 Home / Landing Page | `./assets/screenshots/home.png` |
| 🗺️ Ride Booking Page | `./assets/screenshots/booking.png` |
| 🚗 Active Ride Tracking | `./assets/screenshots/tracking.png` |
| 📊 Passenger Dashboard | `./assets/screenshots/passenger-dashboard.png` |
| 🛡️ Driver Dashboard | `./assets/screenshots/driver-dashboard.png` |
| 🔧 Admin Dashboard | `./assets/screenshots/admin-dashboard.png` |
| 💳 Payment Page | `./assets/screenshots/payment.png` |

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js `v18+`
- npm or yarn
- MongoDB Atlas account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Zarif207/OnWay.git
cd onway
```

### 2. Install Frontend Dependencies

```bash
cd on-way
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../backend
npm install
```

### 4. Install Socket Server Dependencies

```bash
cd ../socket-server
npm install
```

### 5. Configure Environment Variables

See the [Environment Variables](#-environment-variables) section below.

### 6. Run the Application

**Frontend (Next.js):**
```bash
cd on-way
npm run dev
# Runs on http://localhost:3000
```

**Backend (Express API):**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Socket Server:**
```bash
cd socket-server
npm run dev
# Runs on http://localhost:4001
```

---

## 🔐 Environment Variables

### Frontend — `on-way/.env.local`

```env
# Authentication
AUTH_URL=http://localhost:3000
AUTH_SECRET=your_auth_secret_here

# OAuth Providers
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Socket Server
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_PRESET=your_upload_preset

# External APIs
NEXT_PUBLIC_WEATHER_API_KEY=your_openweather_api_key
NEXT_PUBLIC_TOMTOM_API_KEY=your_tomtom_api_key
```

### Backend — `backend/.env`

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/onWayDB

# Server
PORT=5000
NODE_ENV=development

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
SOCKET_URL=http://localhost:4001

# Payment Gateway (SSLCommerz)
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false

# Email (Gmail SMTP)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

> ⚠️ **Never commit real credentials to version control.** Add `.env` and `.env.local` to your `.gitignore`.

---

## 🌐 Live Links

| Resource | Link |
|----------|------|
| 🌍 **Live Site** | [https://onway.vercel.app](https://onway.vercel.app) |
| 💻 **Frontend Repository** | [github.com/devvibe/onway-frontend](https://github.com/devvibe/onway-frontend) |
| ⚙️ **Backend Repository** | [github.com/devvibe/onway-backend](https://github.com/devvibe/onway-backend) |

---

## 👥 Team DevVibe

**DevVibe** is a team of five passionate full-stack developers united by a shared vision — to build technology that solves real-world problems. OnWay is our flagship project, developed as a collaborative effort combining expertise in frontend engineering, backend architecture, real-time systems, AI integration, and payment infrastructure.

| Member | Role | Focus Area |
|--------|------|------------|
| **Minhaj** | MERN Stack Developer | Ride Booking, GPS, Fare Engine, Newsletter |
| **Shourov** | MERN Stack  Developer | Chat, OTP, Promo Codes, AI Chatbot |
| **Zubaer** | Full-Stack Developer | Payments, SOS, Traffic, Driver Ratings |
| **Isthiak** | Frontend Developer | Ride History, Item Recovery, Demand & Pricing |
| **Zarif** | Full-Stack Developer | Driver Matching, Face & KYC Verification, License OCR |

---

## 📈 Future Improvements

We have an ambitious roadmap for OnWay's next phase:

- **🤖 AI-Powered Route Optimization** — Machine learning models to suggest the fastest and most fuel-efficient routes in real time
- **📱 Native Mobile App** — React Native application for iOS and Android with full feature parity
- **🌍 Multi-City Expansion** — Scalable architecture to support operations across multiple cities and regions
- **📊 Advanced Analytics Dashboard** — Deeper insights for admins including heatmaps, revenue forecasting, and driver performance metrics
- **🔋 EV Driver Support** — Integration with electric vehicle charging station data for eco-friendly rides
- **🧠 Predictive Demand Engine** — Enhanced ML model for surge pricing and driver positioning based on historical patterns
- **🔒 Enhanced Security** — End-to-end encryption for all communications and biometric authentication
- **⚡ Performance Optimization** — Edge caching, CDN integration, and database query optimization for sub-100ms response times

---

## 📄 License

```
MIT License

Copyright (c) 2026 DevVibe

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">

**Built with ❤️ by Team DevVibe**

*OnWay — Connecting people, one ride at a time.*

</div>
