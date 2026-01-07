import Link from 'next/link';
import { Building2, Shirt, UtensilsCrossed, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/image.png"
                alt="KosHub Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Platform terintegrasi untuk booking kos dan layanan pendukung kehidupan sehari-hari.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Layanan</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/accommodations" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Building2 size={16} />
                  <span>Booking Kos</span>
                </Link>
              </li>
              <li>
                <Link href="/services/laundry" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Shirt size={16} />
                  <span>Laundry</span>
                </Link>
              </li>
              <li>
                <Link href="/services/catering" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <UtensilsCrossed size={16} />
                  <span>Catering</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-white transition-colors">Daftar</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-primary-400" />
                <span>hello@koshub.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-primary-400" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-primary-400" />
                <span>Bandung, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
