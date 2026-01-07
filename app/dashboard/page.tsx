'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import { bookingApi, userApi, laundryApi, cateringApi } from '../lib/api';
import type { Booking, LaundryService, CateringOrder } from '../types';
import { Building2, Calendar, CheckCircle, Clock, XCircle, Shirt, UtensilsCrossed, ArrowRight, Package } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [laundryOrders, setLaundryOrders] = useState<LaundryService[]>([]);
  const [cateringOrders, setCateringOrders] = useState<CateringOrder[]>([]);
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
    fetchLivingSupportOrders();
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

  const fetchLivingSupportOrders = async () => {
    try {
      const [laundry, catering] = await Promise.all([
        laundryApi.getAll().catch(() => []),
        cateringApi.getAll().catch(() => []),
      ]);
      setLaundryOrders(Array.isArray(laundry) ? laundry : []);
      setCateringOrders(Array.isArray(catering) ? catering : []);
    } catch (error) {
      console.error('Failed to fetch living support orders:', error);
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'delivered':
        return { icon: <CheckCircle size={14} />, bg: 'bg-green-100', text: 'text-green-700', label: 'Selesai' };
      case 'PENDING':
      case 'pending':
        return { icon: <Clock size={14} />, bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' };
      case 'CANCELLED':
      case 'cancelled':
        return { icon: <XCircle size={14} />, bg: 'bg-red-100', text: 'text-red-700', label: 'Dibatalkan' };
      case 'picked_up':
      case 'confirmed':
        return { icon: <Package size={14} />, bg: 'bg-blue-100', text: 'text-blue-700', label: 'Diproses' };
      case 'in_progress':
      case 'preparing':
        return { icon: <Clock size={14} />, bg: 'bg-orange-100', text: 'text-orange-700', label: 'Dalam Proses' };
      case 'ready':
      case 'on_delivery':
        return { icon: <Package size={14} />, bg: 'bg-purple-100', text: 'text-purple-700', label: 'Siap Antar' };
      default:
        return { icon: null, bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      label: 'Total Booking',
      value: bookings.length,
      icon: <Building2 size={20} />,
      bg: 'bg-primary-100',
      iconColor: 'text-primary-600'
    },
    {
      label: 'Laundry',
      value: laundryOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
      icon: <Shirt size={20} />,
      bg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Catering',
      value: cateringOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
      icon: <UtensilsCrossed size={20} />,
      bg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
  ];

  const activeLaundry = laundryOrders.filter(o => o.status !== 'cancelled');
  const activeCatering = cateringOrders.filter(o => o.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-primary-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Halo, {userName}!
              </h1>
              <p className="text-primary-200 mt-1">Kelola booking dan layanan kamu</p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <span className="text-primary-200 text-sm">Membership:</span>
              <span className="text-white font-bold">{membershipLevel}</span>
              {discountRate && discountRate > 0 && (
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  -{discountRate * 100}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center ${stat.iconColor}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Booking Kos</h2>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-500">Memuat data...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="p-8 text-center">
                  <Building2 className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500 mb-4">Belum ada booking</p>
                  <Link
                    href="/accommodations"
                    className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700"
                  >
                    Cari Kos <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bookings.map((booking) => {
                    const statusConfig = getStatusConfig(booking.status);
                    return (
                      <div key={booking.booking_id} className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Booking #{booking.booking_id}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Kos ID: {booking.accommodation_id}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{format(new Date(booking.start_date), 'dd MMM yyyy')}</span>
                          </div>
                          <span className="text-gray-300">→</span>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{format(new Date(booking.end_date), 'dd MMM yyyy')}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-primary-600">
                              Rp {booking.final_price.toLocaleString()}
                            </span>
                            {booking.discount_applied > 0 && (
                              <span className="ml-2 text-sm text-green-600">
                                (hemat Rp {booking.discount_applied.toLocaleString()})
                              </span>
                            )}
                          </div>

                          {booking.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.booking_id, 'SUCCESS', booking.accommodation_id)}
                                className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors btn-press"
                              >
                                Bayar
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.booking_id, 'CANCELLED', booking.accommodation_id)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Batal
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Living Support Orders</h2>
              </div>

              {activeLaundry.length === 0 && activeCatering.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500 mb-4">Belum ada pesanan layanan</p>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700"
                  >
                    Lihat Layanan <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {activeLaundry.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <div key={`laundry-${order.id}`} className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Shirt className="text-blue-600" size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">Laundry #{order.id}</h4>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                {statusConfig.icon}
                                {statusConfig.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{order.weight}kg - Rp {order.total_price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {activeCatering.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <div key={`catering-${order.id}`} className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <UtensilsCrossed className="text-orange-600" size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">Catering #{order.id}</h4>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                {statusConfig.icon}
                                {statusConfig.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{order.menu_name} x{order.quantity} - Rp {order.total_price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <Link href="/services/laundry" className="block">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Shirt className="text-primary-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Laundry</h3>
                    <p className="text-sm text-gray-500">Pesan laundry</p>
                  </div>
                  <ArrowRight className="text-gray-400" size={20} />
                </div>
              </div>
            </Link>

            <Link href="/services/catering" className="block">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <UtensilsCrossed className="text-primary-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Catering</h3>
                    <p className="text-sm text-gray-500">Pesan makanan</p>
                  </div>
                  <ArrowRight className="text-gray-400" size={20} />
                </div>
              </div>
            </Link>

            <Link href="/accommodations" className="block">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Building2 className="text-primary-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Cari Kos</h3>
                    <p className="text-sm text-gray-500">Booking kos baru</p>
                  </div>
                  <ArrowRight className="text-gray-400" size={20} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}