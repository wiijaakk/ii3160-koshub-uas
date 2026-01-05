'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import { cateringApi, bookingApi } from '../../lib/api';
import { UtensilsCrossed, Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
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

  // Fetch menu only after we have bookings
  useEffect(() => {
    if (bookings.length > 0) {
      fetchMenu();
    } else {
      setLoadingMenu(false);
    }
  }, [bookings]);

  const fetchBookings = async () => {
    try {
      console.log('Fetching bookings for user:', user);
      const data = await bookingApi.getById(user?.id!);
      console.log('Ini loh datanya', data);
      const dataArray = Array.isArray(data) ? data : [data];
      const successBookings = dataArray.filter((b: Booking) => b.status === 'SUCCESS');
      setBookings(successBookings);
      if (successBookings.length > 0) {
        setSelectedBooking(successBookings[0].booking_id);
        console.log('Selected booking set to:', successBookings[0].booking_id);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const fetchMenu = async () => {
    setLoadingMenu(true);
    try {
      const data = await cateringApi.getMenu();
      console.log('Menu data received:', data);
      setMenu(data);
      if (data.breakfast && data.breakfast.length > 0) {
        setFormData((prev) => ({ ...prev, menu_name: data.breakfast[0].name }));
      }
    } catch (err: any) {
      console.error('Failed to fetch menu:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to load menu. Please try again later.');
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
      setError('Please select a booking');
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
      setSuccess('Catering order placed successfully!');
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
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/services"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Services
          </Link>
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <UtensilsCrossed className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Bookings</h2>
            <p className="text-gray-600 mb-6">
              You need an active accommodation booking to use catering services.
            </p>
            <Link
              href="/accommodations"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              Browse Accommodations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/services"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Services
        </Link>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mr-4">
              <UtensilsCrossed className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Catering Service</h1>
              <p className="text-gray-600">Fresh Indonesian meals delivered to you</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Booking
              </label>
              <select
                value={selectedBooking || ''}
                onChange={(e) => setSelectedBooking(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                {bookings.map((booking) => (
                  <option key={booking.booking_id} value={booking.booking_id}>
                    Booking #{booking.booking_id} - Accommodation ID: {booking.accommodation_id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleMealTypeChange(type)}
                    className={`py-3 px-4 rounded-lg font-medium transition ${
                      formData.meal_type === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Menu
              </label>
              {loadingMenu ? (
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  Loading menu...
                </div>
              ) : getCurrentMenuItems().length === 0 ? (
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-yellow-50 text-yellow-700">
                  No menu items available for {formData.meal_type}
                </div>
              ) : (
                <select
                  value={formData.menu_name}
                  onChange={(e) => setFormData({ ...formData, menu_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline mr-2" size={16} />
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline mr-2" size={16} />
                  Delivery Time
                </label>
                <input
                  type="time"
                  value={formData.delivery_time}
                  onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline mr-2" size={16} />
                Delivery Address (Optional)
              </label>
              <input
                type="text"
                value={formData.delivery_address}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Leave empty to use accommodation address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                value={formData.special_requests}
                onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Any dietary restrictions or special requests..."
              />
            </div>

            <div className="bg-primary-50 border-l-4 border-primary-600 p-4 rounded">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total Price:</span>
                <span className="text-2xl font-bold text-primary-600">
                  Rp {calculatePrice().toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Placing Order...' : 'Place Catering Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
