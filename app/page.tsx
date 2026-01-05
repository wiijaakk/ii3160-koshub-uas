'use client';

import Link from 'next/link';
import { Building2, Shirt, UtensilsCrossed, Bell, Shield, Clock } from 'lucide-react';
import { useAuth } from './lib/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary-600">KosHub</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your all-in-one platform for accommodation booking and daily living support services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/register"
                  className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg"
                >
                  Get Started
                </Link>
                <Link
                  href="/accommodations"
                  className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold text-lg"
                >
                  Browse Kos
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Accommodation */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-primary-100">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <Building2 className="text-primary-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Accommodation Booking</h3>
            <p className="text-gray-600 mb-6">
              Find and book your perfect kos with our comprehensive listing. Filter by location,
              price, and amenities. Get exclusive member discounts!
            </p>
            <Link
              href="/accommodations"
              className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              Browse Accommodations →
            </Link>
          </div>

          {/* Laundry */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-primary-100">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <Shirt className="text-primary-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Laundry Service</h3>
            <p className="text-gray-600 mb-6">
              Professional laundry services delivered to your door. Choose from wash, iron,
              or dry clean options. Schedule pickup and delivery at your convenience.
            </p>
            {isAuthenticated ? (
              <Link
                href="/services/laundry"
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Order Laundry Service →
              </Link>
            ) : (
              <p className="text-gray-500 italic">Login to access this service</p>
            )}
          </div>

          {/* Catering */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-primary-100">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <UtensilsCrossed className="text-primary-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Catering Service</h3>
            <p className="text-gray-600 mb-6">
              Delicious meals delivered fresh to your kos. Choose from breakfast, lunch, dinner,
              and snack options. Customize your orders with special requests.
            </p>
            {isAuthenticated ? (
              <Link
                href="/services/catering"
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Order Food →
              </Link>
            ) : (
              <p className="text-gray-500 italic">Login to access this service</p>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose KosHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Member Benefits</h3>
              <p className="text-gray-600">
                Enjoy exclusive discounts with SILVER (5%) and GOLD (10%) membership levels
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Clock className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Service</h3>
              <p className="text-gray-600">
                Access our platform anytime, anywhere. Track your orders in real-time
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Bell className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Notifications</h3>
              <p className="text-gray-600">
                Stay updated with real-time notifications for all your bookings and services
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Built with Modern Architecture
          </h2>
          <p className="text-lg text-gray-600 mb-6 text-center max-w-3xl mx-auto">
            KosHub is designed using <span className="font-semibold text-primary-600">Domain-Driven Design (DDD)</span> principles
            with microservices architecture for scalability and maintainability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="border-2 border-primary-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accommodation Booking Context</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• User authentication & authorization</li>
                <li>• Accommodation management</li>
                <li>• Booking system with discounts</li>
                <li>• Membership management</li>
              </ul>
            </div>
            <div className="border-2 border-primary-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Living Support Services Context</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Laundry service management</li>
                <li>• Catering & food ordering</li>
                <li>• Real-time notifications</li>
                <li>• Order tracking & status updates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join KosHub today and experience seamless kos living
            </p>
            <Link
              href="/auth/register"
              className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              Create Your Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
