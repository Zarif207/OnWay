"use client";
import React from "react";
import { Phone, Mail, MapPin, MessageSquare } from "lucide-react";

const ContactUs = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">

      {/* Header */}
      <div className="text-center mb-12" data-aos="fade-up">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Contact Us
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Need help with your ride? Have questions, feedback, or safety concerns? 
          Our support team is available 24/7 to assist you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">

        {/* Contact Form */}
        <div 
          className="glossy-card spotlight-hover rounded-2xl p-6 shadow-lg relative"
          data-aos="fade-right"
        >
          <h2 className="text-2xl font-semibold mb-4">Send a Message</h2>

          <form className="space-y-4">

            <input
              type="text"
              placeholder="Your Name"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <input
              type="email"
              placeholder="Your Email"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <textarea
              rows="5"
              placeholder="Your Message"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>

            <button
              type="submit"
              className="animated-btn w-full py-2 rounded-lg flex items-center justify-center gap-2"
            >
              Send Message
              <span className="circle"></span>
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-6" data-aos="fade-left">

          {/* Phone */}
          <div className="glossy-card flex items-center gap-4 p-4 rounded-xl shadow">
            <Phone className="text-primary" />
            <div>
              <p className="font-semibold">Phone</p>
              <p className="text-gray-600">+880 1234-567890</p>
            </div>
          </div>

          {/* Email */}
          <div className="glossy-card flex items-center gap-4 p-4 rounded-xl shadow">
            <Mail className="text-primary" />
            <div>
              <p className="font-semibold">Email</p>
              <p className="text-gray-600">support@onway.com</p>
            </div>
          </div>

          {/* Location */}
          <div className="glossy-card flex items-center gap-4 p-4 rounded-xl shadow">
            <MapPin className="text-primary" />
            <div>
              <p className="font-semibold">Location</p>
              <p className="text-gray-600">Chattogram, Bangladesh</p>
            </div>
          </div>

          {/* Quick Help */}
          <div className="bg-primary/10 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="text-primary" />
              <h3 className="text-lg font-semibold">Need Quick Help?</h3>
            </div>
            <p className="text-gray-600 mb-3">
              Our live support team is available 24/7. If you face any ride issues, 
              payment problems, or safety concerns, contact us immediately.
            </p>
            <button className="animated-btn px-4 py-2 rounded-lg">
              Live Chat
              <span className="circle"></span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;