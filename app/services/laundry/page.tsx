'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import { laundryApi, bookingApi } from '../../lib/api';
import { Shirt, Calendar, Clock, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import type { CreateLaundryData, Booking } from '../../types';
import { LAUNDRY_PRICES, LAUNDRY_SERVICE_NAMES } from '../../types';

export default function LaundryPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateLaundryData>({
    service_type: 'wash',
    weight: 1,
    pickup_date: '',
    pickup_time: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated, router]);

  const fetchBookings = async () => {
    try {
      const data = await bookingApi.getById(user?.id!);
      const dataArray = Array.isArray(data) ? data : [data];
      const successBookings = dataArray.filter((b: Booking) => b.status === 'SUCCESS');
      setBookings(successBookings);
      if (successBookings.length > 0) {
        setSelectedBooking(successBookings[0].booking_id);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const calculatePrice = () => {
    return LAUNDRY_PRICES[formData.service_type] * formData.weight;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) {
      setError('Pilih booking terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await laundryApi.createOrder({
        ...formData,
        booking_id: selectedBooking,
      });
      setSuccess('Pesanan laundry berhasil dibuat!');
      setFormData({
        service_type: 'wash',
        weight: 1,
        pickup_date: '',
        pickup_time: '',
        notes: '',
      });
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-lg mx-auto px-4 py-12">
          <Link
            href="/services"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={18} className="mr-2" />
            Kembali
          </Link>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <Shirt className="mx-auto text-gray-300 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Booking Aktif</h2>
            <p className="text-gray-600 mb-6">
              Kamu perlu booking kos terlebih dahulu untuk menggunakan layanan laundry.
            </p>
            <Link
              href="/accommodations"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Cari Kos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/services"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Kembali
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-primary-900 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Shirt className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Laundry Service</h1>
                <p className="text-primary-200 text-sm">Professional laundry di pintu kamu</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <Check size={18} />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Booking
                </label>
                <select
                  value={selectedBooking || ''}
                  onChange={(e) => setSelectedBooking(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {bookings.map((booking) => (
                    <option key={booking.booking_id} value={booking.booking_id}>
                      Booking #{booking.booking_id} - Kos ID: {booking.accommodation_id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Layanan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(LAUNDRY_SERVICE_NAMES).map(([key, name]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, service_type: key as any })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${formData.service_type === key
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <p className="font-medium text-gray-900">{name}</p>
                      <p className="text-sm text-primary-600 font-semibold">
                        Rp {LAUNDRY_PRICES[key as keyof typeof LAUNDRY_PRICES].toLocaleString()}/kg
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Berat (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline mr-1" size={14} />
                    Tanggal Pickup
                  </label>
                  <input
                    type="date"
                    value={formData.pickup_date}
                    onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline mr-1" size={14} />
                    Waktu Pickup
                  </label>
                  <input
                    type="time"
                    value={formData.pickup_time}
                    onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Instruksi khusus..."
                />
              </div>

              <div className="bg-primary-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Harga</span>
                  <span className="text-2xl font-bold text-primary-600">
                    Rp {calculatePrice().toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 btn-press"
              >
                {loading ? 'Memproses...' : 'Pesan Laundry'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
