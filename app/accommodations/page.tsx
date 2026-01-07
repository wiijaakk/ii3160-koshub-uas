'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { accommodationApi, bookingApi } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import type { Accommodation } from '../types';
import { Building2, MapPin, Users, Calendar, X, Check } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data kos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-primary-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Cari Kos</h1>
          <p className="text-primary-200">Temukan kos yang cocok untuk kamu</p>

          {isAuthenticated && user?.membership_level && user.membership_level !== 'BASIC' && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="font-medium">{user.membership_level}</span>
              <span className="text-primary-200">- Diskon {(user.discount_rate || 0) * 100}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accommodations.map((accommodation) => {
            const { discount, finalPrice } = calculateDiscount(accommodation.price);
            const isAvailable = accommodation.available_units > 0;

            return (
              <div
                key={accommodation.accommodation_id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover"
              >
                <div className="h-40 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center relative">
                  <Building2 className="text-white/50" size={48} />
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Penuh
                      </span>
                    </div>
                  )}
                  {discount > 0 && isAvailable && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                      -{(user?.discount_rate || 0) * 100}%
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {accommodation.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin size={14} className="mr-2 flex-shrink-0" />
                      <span className="truncate">{accommodation.address}, {accommodation.city}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Users size={14} className="mr-2 flex-shrink-0" />
                      <span>{accommodation.available_units} dari {accommodation.total_units} unit tersedia</span>
                    </div>
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <div className="flex items-baseline gap-2">
                      {discount > 0 ? (
                        <>
                          <span className="text-gray-400 line-through text-sm">
                            Rp {accommodation.price.toLocaleString()}
                          </span>
                          <span className="text-xl font-bold text-primary-600">
                            Rp {finalPrice.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-primary-600">
                          Rp {accommodation.price.toLocaleString()}
                        </span>
                      )}
                      <span className="text-gray-400 text-sm">/bulan</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBooking(accommodation)}
                    disabled={!isAvailable}
                    className="w-full py-3 rounded-xl font-semibold transition-all btn-press disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600 text-white hover:bg-primary-700"
                  >
                    {isAvailable ? 'Booking Sekarang' : 'Tidak Tersedia'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {accommodations.length === 0 && !loading && (
          <div className="text-center py-16">
            <Building2 className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-xl text-gray-500">Belum ada kos tersedia</p>
          </div>
        )}
      </div>

      {selectedAccommodation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Booking Kos</h2>
              <button
                onClick={() => {
                  setSelectedAccommodation(null);
                  setBookingDates({ start_date: '', end_date: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-900">{selectedAccommodation.name}</h3>
              <p className="text-sm text-gray-500">{selectedAccommodation.address}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={14} className="inline mr-1" />
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={bookingDates.start_date}
                  onChange={(e) => setBookingDates({ ...bookingDates, start_date: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={14} className="inline mr-1" />
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={bookingDates.end_date}
                  onChange={(e) => setBookingDates({ ...bookingDates, end_date: e.target.value })}
                  min={bookingDates.start_date || format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-primary-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Harga</span>
                <span className="font-medium">Rp {selectedAccommodation.price.toLocaleString()}</span>
              </div>
              {calculateDiscount(selectedAccommodation.price).discount > 0 && (
                <>
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Diskon Member</span>
                    <span>- Rp {calculateDiscount(selectedAccommodation.price).discount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-primary-200">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary-600">
                      Rp {calculateDiscount(selectedAccommodation.price).finalPrice.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedAccommodation(null);
                  setBookingDates({ start_date: '', end_date: '' });
                }}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={submitBooking}
                disabled={bookingLoading}
                className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 btn-press"
              >
                {bookingLoading ? 'Memproses...' : 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-slide-up">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Berhasil!</h3>
            <p className="text-gray-600 mb-4">Silakan lanjutkan pembayaran di dashboard.</p>
            <button
              onClick={() => { setShowSuccessModal(false); router.push('/dashboard'); }}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors btn-press"
            >
              Ke Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
