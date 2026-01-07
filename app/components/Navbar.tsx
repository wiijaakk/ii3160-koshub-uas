'use client';

import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import { Home, Building2, ShoppingBag, User, LogOut, Bell, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationApi } from '../lib/api';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const { unread_count } = await notificationApi.getUnreadCount();
      setUnreadCount(unread_count);
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
    }
  };

  const navLinks = [
    { href: '/', icon: Home, label: 'Home', public: true },
    { href: '/accommodations', icon: Building2, label: 'Kos', public: true },
    { href: '/services', icon: ShoppingBag, label: 'Services', public: false },
    { href: '/dashboard', icon: User, label: 'Dashboard', public: false },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/image.png"
              alt="KosHub Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              (link.public || isAuthenticated) && (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-white/90 hover:bg-white/10 hover:text-white"
                >
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </Link>
              )
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard/notifications"
                  className="relative p-2 rounded-lg transition-all text-white/90 hover:bg-white/10"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-primary-600 text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right text-white">
                    <p className="text-sm font-semibold">{user?.name || 'User'}</p>
                    <p className="text-xs text-primary-200">
                      {user?.membership_level || 'BASIC'}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg transition-all text-white/90 hover:bg-white/10"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg font-medium transition-all text-white hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-lg font-semibold transition-all bg-white text-primary-600 hover:bg-primary-50"
                >
                  Daftar
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                (link.public || isAuthenticated) && (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-white hover:bg-white/10"
                  >
                    <link.icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                )
              ))}
              {isAuthenticated && (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-white hover:bg-white/10"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
