'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import { cateringApi, bookingApi } from '../../lib/api';
import { UtensilsCrossed, Calendar, Clock, MapPin, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import type { CreateCateringData, Booking, CateringMenu, MenuItem } from '../../types';

export default function CateringPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [menu, setMenu] = useState<CateringMenu | null>(null);
  const [formData, setFormData] = useState<CreateCateringData>({
    meal_type: 'breakfast',
    menu_name: '',
    quantity: 1,
    delivery_date: '',
    delivery_time: '',
    delivery_address: '',
    special_requests: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (bookings.length > 0) {
      fetchMenu();
    } else {
      setLoadingMenu(false);
    }
  }, [bookings]);

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

  const fetchMenu = async () => {
    setLoadingMenu(true);
    try {
      const data = await cateringApi.getMenu();
      setMenu(data);
      if (data.breakfast && data.breakfast.length > 0) {
        setFormData((prev) => ({ ...prev, menu_name: data.breakfast[0].name }));
      }
    } catch (err: any) {
      console.error('Failed to fetch menu:', err);
      setError('Gagal memuat menu. Coba lagi nanti.');
    } finally {
      setLoadingMenu(false);
    }
  };

  const getCurrentMenuItems = (): MenuItem[] => {
    if (!menu) return [];
    return menu[formData.meal_type] || [];
  };

  const getSelectedMenuItem = (): MenuItem | undefined => {
    return getCurrentMenuItems().find((item) => item.name === formData.menu_name);
  };

  const calculatePrice = () => {
    const menuItem = getSelectedMenuItem();
    return menuItem ? menuItem.price * formData.quantity : 0;
  };

  const handleMealTypeChange = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setFormData((prev) => {
      const newMenuItems = menu?.[mealType] || [];
      return {
        ...prev,
        meal_type: mealType,
        menu_name: newMenuItems.length > 0 ? newMenuItems[0].name : '',
      };
    });
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
      await cateringApi.createOrder({
        ...formData,
        booking_id: selectedBooking,
      });
      setSuccess('Pesanan catering berhasil dibuat!');
      setFormData({
        meal_type: 'breakfast',
        menu_name: menu?.breakfast[0]?.name || '',
        quantity: 1,
        delivery_date: '',
        delivery_time: '',
        delivery_address: '',
        special_requests: '',
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

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'snack', label: 'Snack' },
  ] as const;

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
            <UtensilsCrossed className="mx-auto text-gray-300 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Booking Aktif</h2>
            <p className="text-gray-600 mb-6">
              Kamu perlu booking kos terlebih dahulu untuk menggunakan layanan catering.
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
                <UtensilsCrossed className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Catering Service</h1>
                <p className="text-primary-200 text-sm">Menu Indonesia segar setiap hari</p>
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
                  Tipe Makanan
                </label>
                <div className="flex gap-2">
                  {mealTypes.map((type) => (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => handleMealTypeChange(type.key)}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${formData.meal_type === type.key
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Menu
                </label>
                {loadingMenu ? (
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-400">
                    Memuat menu...
                  </div>
                ) : getCurrentMenuItems().length === 0 ? (
                  <div className="w-full px-4 py-3 border border-yellow-200 rounded-xl bg-yellow-50 text-yellow-700 text-sm">
                    Tidak ada menu tersedia untuk {formData.meal_type}
                  </div>
                ) : (
                  <select
                    value={formData.menu_name}
                    onChange={(e) => setFormData({ ...formData, menu_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    {getCurrentMenuItems().map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name} - Rp {item.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Porsi
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline mr-1" size={14} />
                    Tanggal Kirim
                  </label>
                  <input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline mr-1" size={14} />
                    Waktu Kirim
                  </label>
                  <input
                    type="time"
                    value={formData.delivery_time}
                    onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline mr-1" size={14} />
                  Alamat (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Kosongkan untuk pakai alamat kos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permintaan Khusus (Opsional)
                </label>
                <textarea
                  value={formData.special_requests}
                  onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Alergi, preferensi pedas, dll..."
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
                {loading ? 'Memproses...' : 'Pesan Catering'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
