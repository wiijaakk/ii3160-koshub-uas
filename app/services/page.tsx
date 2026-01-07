'use client';

import Link from 'next/link';
import { Shirt, UtensilsCrossed, ArrowRight, Clock, Truck, CreditCard } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ServicesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const services = [
    {
      href: '/services/laundry',
      icon: Shirt,
      title: 'Laundry Service',
      desc: 'Cuci, setrika, atau dry clean. Kami pickup dan antar langsung ke pintu kamu.',
      prices: [
        { label: 'Cuci', price: 'Rp 5.000/kg' },
        { label: 'Cuci + Setrika', price: 'Rp 7.000/kg' },
        { label: 'Dry Clean', price: 'Rp 15.000/kg' },
        { label: 'Setrika', price: 'Rp 3.000/kg' },
      ],
      cta: 'Pesan Laundry',
    },
    {
      href: '/services/catering',
      icon: UtensilsCrossed,
      title: 'Catering Service',
      desc: 'Makanan Indonesia segar setiap hari. Breakfast, lunch, dinner, sampai snack!',
      prices: [
        { label: 'Breakfast', price: 'dari Rp 10.000' },
        { label: 'Lunch/Dinner', price: 'dari Rp 15.000' },
        { label: 'Snack', price: 'dari Rp 8.000' },
      ],
      cta: 'Lihat Menu',
    },
  ];

  const steps = [
    {
      icon: CreditCard,
      title: 'Pesan',
      desc: 'Pilih layanan dan isi detail pesanan',
    },
    {
      icon: Clock,
      title: 'Proses',
      desc: 'Tracking status real-time di dashboard',
    },
    {
      icon: Truck,
      title: 'Selesai',
      desc: 'Pesanan diantar ke pintu kamu',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-primary-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Living Support Services
          </h1>
          <p className="text-primary-200 text-lg">
            Semua kebutuhan hidup di kos dalam satu platform
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {services.map((service) => (
            <Link key={service.href} href={service.href} className="group">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full card-hover">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-600 transition-colors">
                    <service.icon className="text-primary-600 group-hover:text-white transition-colors" size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{service.title}</h2>
                    <p className="text-gray-600 text-sm">{service.desc}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {service.prices.map((price) => (
                    <div key={price.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{price.label}</span>
                      <span className="font-medium text-gray-900">{price.price}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                  <span>{service.cta}</span>
                  <ArrowRight size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-8 text-center">Cara Kerja</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="text-white" size={24} />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h4 className="font-semibold text-gray-900">{step.title}</h4>
                </div>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-primary-50 border border-primary-200 rounded-xl p-4">
          <p className="text-primary-800 text-sm">
            <span className="font-semibold">Note:</span> Kamu harus punya booking kos aktif untuk menggunakan layanan ini.
          </p>
        </div>
      </div>
    </div>
  );
}
