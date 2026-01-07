'use client';

import Link from 'next/link';
import { Building2, Shirt, UtensilsCrossed, Shield, Clock, Bell, ChevronRight, Star } from 'lucide-react';
import { useAuth } from './lib/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/landing.png)' }}
        >
          <div className="absolute inset-0 bg-primary-900/60"></div>
        </div>


        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm mb-6">
              <Star size={16} className="text-yellow-400" />
              <span>Platform Kos #1 di Indonesia</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Temukan Kos Impian
              <br />
              <span className="text-primary-300">Dengan Mudah</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Booking kos, pesan laundry, dan catering dalam satu platform.
              Nikmati diskon member hingga 10%!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/auth/register"
                    className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all shadow-lg btn-press"
                  >
                    Daftar Sekarang
                  </Link>
                  <Link
                    href="/accommodations"
                    className="px-8 py-4 bg-transparent text-white border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
                  >
                    Lihat Kos
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all shadow-lg btn-press"
                >
                  Ke Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Layanan Kami
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Semua kebutuhan hidup di kos dalam satu platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/accommodations" className="group">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover h-full">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                  <Building2 className="text-primary-600 group-hover:text-white transition-colors" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Kos</h3>
                <p className="text-gray-600 mb-4">
                  Cari dan booking kos dengan filter lokasi, harga, dan fasilitas. Diskon up to 10% untuk member!
                </p>
                <span className="inline-flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                  Lihat Kos <ChevronRight size={18} />
                </span>
              </div>
            </Link>

            <div className="group">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover h-full">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Shirt className="text-primary-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Laundry Service</h3>
                <p className="text-gray-600 mb-4">
                  Cuci, setrika, atau dry clean. Pickup dan delivery langsung ke pintu kamar kos kamu.
                </p>
                {isAuthenticated ? (
                  <Link href="/services/laundry" className="inline-flex items-center text-primary-600 font-semibold hover:gap-2 transition-all">
                    Pesan Laundry <ChevronRight size={18} />
                  </Link>
                ) : (
                  <p className="text-gray-400 text-sm italic">Login untuk akses</p>
                )}
              </div>
            </div>

            <div className="group">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover h-full">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <UtensilsCrossed className="text-primary-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Catering Service</h3>
                <p className="text-gray-600 mb-4">
                  Menu makanan Indonesia fresh setiap hari. Breakfast, lunch, dinner, sampai snack!
                </p>
                {isAuthenticated ? (
                  <Link href="/services/catering" className="inline-flex items-center text-primary-600 font-semibold hover:gap-2 transition-all">
                    Lihat Menu <ChevronRight size={18} />
                  </Link>
                ) : (
                  <p className="text-gray-400 text-sm italic">Login untuk akses</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Kenapa KosHub?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Member Benefits</h3>
              <p className="text-gray-600">
                Diskon 5% untuk SILVER dan 10% untuk GOLD member
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">24/7 Service</h3>
              <p className="text-gray-600">
                Akses platform kapan saja, track order real-time
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Notifikasi</h3>
              <p className="text-gray-600">
                Update real-time untuk semua booking dan order
              </p>
            </div>
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="py-16 bg-primary-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Siap Memulai?
            </h2>
            <p className="text-primary-100 mb-8 text-lg">
              Daftar sekarang dan nikmati kemudahan hidup di kos
            </p>
            <Link
              href="/auth/register"
              className="inline-block px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all shadow-lg btn-press"
            >
              Buat Akun Gratis
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
