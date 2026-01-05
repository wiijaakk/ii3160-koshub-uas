'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import { bookingApi, userApi } from '../lib/api';
import type { Booking } from '../types';
import { Building2, Calendar, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [discountRate, setDiscountRate] = useState<number | undefined>(undefined);
  const [membershipLevel, setMembershipLevel] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchUserDetails();
    fetchBookings();
  }, [isAuthenticated, router]);

  const fetchUserDetails = async () => {
    if (!user?.id) return;
    try {
      const userData = await userApi.getById(user.id);
      setUserName(userData.name || '');
      setMembershipLevel(userData.membership_level || '');
      setDiscountRate(userData.discount_rate);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };

  const fetchBookings = async () => {
    if (!user?.id) return;
    try {
      const data = await bookingApi.getById(user.id);
      setBookings(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number, status: 'SUCCESS' | 'CANCELLED', accommodationId: number) => {
    try {
      await bookingApi.updateStatus(bookingId, status, accommodationId);
      fetchBookings();
    } catch (error) {
      alert('Failed to update booking status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'PENDING':
        return <Clock className="text-yellow-500" size={20} />;
      case 'CANCELLED':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {userName}!
              </h1>
              <p className="text-gray-600">Manage your bookings and services</p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-primary-100 text-primary-800 px-6 py-3 rounded-lg">
                <p className="text-sm font-medium">Membership Level</p>
                <p className="text-2xl font-bold">{membershipLevel}</p>
                {discountRate && discountRate > 0 && (
                  <p className="text-sm">
                    {(discountRate * 100)}% discount on bookings
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Building2 className="text-primary-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Active Bookings</p>
                <p className="text-3xl font-bold text-gray-900">
                  {bookings.filter((b) => b.status === 'SUCCESS').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Pending Payment</p>
                <p className="text-3xl font-bold text-gray-900">
                  {bookings.filter((b) => b.status === 'PENDING').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Bookings</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-xl text-gray-600 mb-4">No bookings yet</p>
              <button
                onClick={() => router.push('/accommodations')}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Browse Accommodations
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.booking_id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          Booking #{booking.booking_id}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Accommodation ID: {booking.accommodation_id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-700">
                      <Calendar size={16} className="mr-2 text-primary-600" />
                      <div>
                        <p className="text-xs text-gray-500">Check-in</p>
                        <p className="font-semibold">
                          {format(new Date(booking.start_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Calendar size={16} className="mr-2 text-primary-600" />
                      <div>
                        <p className="text-xs text-gray-500">Check-out</p>
                        <p className="font-semibold">
                          {format(new Date(booking.end_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <DollarSign size={16} className="mr-2 text-primary-600" />
                      <div>
                        <p className="text-xs text-gray-500">Total Price</p>
                        <p className="font-semibold text-primary-600">
                          Rp {booking.final_price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {booking.discount_applied > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <span className="font-semibold">Discount Applied:</span> Rp{' '}
                        {booking.discount_applied.toLocaleString()} saved!
                      </p>
                    </div>
                  )}

                  {booking.status === 'PENDING' && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 mb-2">
                        <span className="font-semibold">Action Required:</span> Complete your
                        payment to confirm this booking.
                      </p>
                      <div className="flex gap-4">
                        <button
                          className="px-6 py-2 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
                          onClick={() => handleUpdateBookingStatus(booking.booking_id, 'SUCCESS', booking.accommodation_id)}
                        >
                          Pay
                        </button>
                        <button
                          className="px-6 py-2 rounded-lg bg-red-100 text-red-700 font-semibold shadow hover:bg-red-200 transition-colors border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-300"
                          onClick={() => handleUpdateBookingStatus(booking.booking_id, 'CANCELLED', booking.accommodation_id)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push('/services')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Living Support Services</h3>
            <p className="text-gray-600 mb-4">
              Order laundry or catering services for your kos
            </p>
            <span className="text-primary-600 font-semibold">Browse Services →</span>
          </button>
          <button
            onClick={() => router.push('/accommodations')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Find More Accommodations</h3>
            <p className="text-gray-600 mb-4">Browse and book additional kos units</p>
            <span className="text-primary-600 font-semibold">Browse Kos →</span>
          </button>
        </div>
      </div>
    </div>
  );
}