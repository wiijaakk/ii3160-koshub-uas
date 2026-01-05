'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { accommodationApi, bookingApi } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import type { Accommodation } from '../types';
import { Building2, MapPin, DollarSign, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function AccommodationsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [bookingDates, setBookingDates] = useState({
    start_date: '',
    end_date: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const data = await accommodationApi.getAll();
      setAccommodations(data);
    } catch (err: any) {
      setError('Failed to load accommodations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (accommodation: Accommodation) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    setSelectedAccommodation(accommodation);
  };

  const submitBooking = async () => {
    if (!selectedAccommodation) return;

    if (!bookingDates.start_date || !bookingDates.end_date) {
      alert('Please select both start and end dates');
      return;
    }

    setBookingLoading(true);
    try {
      await bookingApi.create({
        accommodation_id: selectedAccommodation.accommodation_id,
        start_date: bookingDates.start_date,
        end_date: bookingDates.end_date,
      });
      setShowSuccessModal(true);
      setSelectedAccommodation(null);
      setBookingDates({ start_date: '', end_date: '' });
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateDiscount = (price: number) => {
    const discountRate = user?.discount_rate || 0;
    const discount = price * discountRate;
    return { discount, finalPrice: price - discount };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accommodations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Accommodations</h1>
          <p className="text-xl text-gray-600">Find your perfect kos</p>
          {isAuthenticated && user?.membership_level && user.membership_level !== 'BASIC' && (
            <div className="mt-4 inline-block bg-primary-100 text-primary-800 px-6 py-2 rounded-full">
              <span className="font-semibold">{user.membership_level} Member</span> - Enjoy{' '}
              {(user.discount_rate || 0) * 100}% discount on all bookings!
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accommodations.map((accommodation) => {
            const { discount, finalPrice } = calculateDiscount(accommodation.price);
            return (
              <div
                key={accommodation.accommodation_id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="h-48 bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <Building2 className="text-white" size={64} />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {accommodation.name}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      <span className="text-sm">{accommodation.address}, {accommodation.city}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users size={16} className="mr-2" />
                      <span className="text-sm">
                        {accommodation.available_units} / {accommodation.total_units} units available
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <DollarSign size={20} className="text-primary-600" />
                      {discount > 0 ? (
                        <>
                          <span className="text-gray-400 line-through text-lg">
                            Rp {accommodation.price.toLocaleString()}
                          </span>
                          <span className="text-2xl font-bold text-primary-600">
                            Rp {finalPrice.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-primary-600">
                          Rp {accommodation.price.toLocaleString()}
                        </span>
                      )}
                      <span className="text-gray-500 text-sm">/ month</span>
                    </div>
                    {discount > 0 && (
                      <p className="text-sm text-green-600 font-semibold mb-4">
                        You save Rp {discount.toLocaleString()}!
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleBooking(accommodation)}
                    disabled={accommodation.available_units === 0}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {accommodation.available_units === 0 ? 'Fully Booked' : 'Book Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {accommodations.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building2 className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-xl text-gray-600">No accommodations available at the moment</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedAccommodation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Book {selectedAccommodation.name}</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={bookingDates.start_date}
                  onChange={(e) => setBookingDates({ ...bookingDates, start_date: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  End Date
                </label>
                <input
                  type="date"
                  value={bookingDates.end_date}
                  onChange={(e) => setBookingDates({ ...bookingDates, end_date: e.target.value })}
                  min={bookingDates.start_date || format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-semibold">Rp {selectedAccommodation.price.toLocaleString()}</span>
                </div>
                {calculateDiscount(selectedAccommodation.price).discount > 0 && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-green-600 font-semibold">
                        - Rp {calculateDiscount(selectedAccommodation.price).discount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-bold">Final Price:</span>
                      <span className="font-bold text-primary-600">
                        Rp {calculateDiscount(selectedAccommodation.price).finalPrice.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedAccommodation(null);
                  setBookingDates({ start_date: '', end_date: '' });
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitBooking}
                disabled={bookingLoading}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400"
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <span className="inline-block bg-green-100 text-green-600 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-green-700">Booking Successful!</h3>
            <p className="text-gray-700 mb-4">Check your dashboard for payment.</p>
            <button
              onClick={() => { setShowSuccessModal(false); router.push('/dashboard'); }}
              className="mt-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
