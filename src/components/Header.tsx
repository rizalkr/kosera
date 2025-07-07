"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const servicesRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(event.target as Node)
      ) {
        setServicesOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper untuk cek active link
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-[#E1F6F2] backdrop-blur shadow-sm" : "bg-[#E1F6F2]"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center px-8 py-4 relative">
        <div className="text-2xl font-bold text-blue-400">KOSERA.</div>
        {/* Hamburger for mobile */}
        <button
          className="ml-auto lg:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          <span
            className={`block w-6 h-0.5 bg-blue-900 mb-1 transition-all duration-300 ${
              open ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-blue-900 mb-1 transition-all duration-300 ${
              open ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-blue-900 transition-all duration-300 ${
              open ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </button>
        {/* Navigation */}
        <nav
          className={`space-x-6 transition-all duration-300 ${
            scrolled
              ? "absolute left-1/2 -translate-x-1/2"
              : "ml-auto"
          } hidden lg:flex`}
        >
          <a
            href="/"
            className={`text-[#83B8C6] hover:underline transition-all duration-150 ${
              isActive("/") ? "underline font-semibold" : ""
            }`}
          >
            Home
          </a>
          <a
            href="/list"
            className={`text-[#83B8C6] hover:underline transition-all duration-150 ${
              isActive("/list") ? "underline font-semibold" : ""
            }`}
          >
            Daftar
          </a>
          <div className="relative inline-block" ref={servicesRef}>
            <button
              className="hover:underline text-[#83B8C6] flex items-center gap-1"
              onClick={() => setServicesOpen((v) => !v)}
              type="button"
            >
              Services
              <svg
                className={`w-4 h-4 transition-transform ${
                  servicesOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* Submenu with animation */}
            <div
              className={`
                absolute left-0 mt-2 w-40 bg-white shadow-lg z-50 flex flex-col text-[#83B8C6]
                transition-all duration-300 origin-top rounded-2xl
                ${servicesOpen
                  ? "opacity-100 scale-y-100 pointer-events-auto"
                  : "opacity-0 scale-y-95 pointer-events-none"
                }
              `}
              style={{ transformOrigin: "top" }}
            >
              <a
                href="/services/angkutBarang"
                className="px-4 py-2 hover:bg-blue-50 hover:underline transition rounded-t-2xl"
                onClick={() => setServicesOpen(false)}
              >
                Angkut Barang
              </a>
              <a
                href="/services/titipBarang"
                className="px-4 py-2 hover:bg-blue-50 hover:underline transition rounded-b-2xl"
                onClick={() => setServicesOpen(false)}
              >
                Titip Barang
              </a>
            </div>
          </div>
          <a
            href="/bookings"
            className={`text-[#83B8C6] hover:underline transition-all duration-150 ${
              isActive("/bookings") ? "underline font-semibold" : ""
            }`}
          >
            Bookings
          </a>
          <a
            href="/complaint"
            className={`text-[#83B8C6] hover:underline transition-all duration-150 ${
              isActive("/complaint") ? "underline font-semibold" : ""
            }`}
          >
            Aduan
          </a>
          <a
            href="/contact"
            className={`text-[#83B8C6] hover:underline transition-all duration-150 ${
              isActive("/contact") ? "underline font-semibold" : ""
            }`}
          >
            Kontak
          </a>
          {/* Authentication Section for Desktop */}
          {isLoading ? (
            <div className="ml-4 bg-gray-200 animate-pulse rounded px-4 py-2 w-20"></div>
          ) : isAuthenticated ? (
            <div className="relative ml-4" ref={userMenuRef}>
              <button
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline">{user?.username}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* User Dropdown Menu */}
              <div
                className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border transition-all duration-200 ${
                  userMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Profil Saya
                </Link>
                
                {user?.role === 'SELLER' && (
                  <Link
                    href="/my-kos"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Kos Saya
                  </Link>
                )}
                
                <Link
                  href="/bookings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Booking Saya
                </Link>
                
                <Link
                  href="/favorites"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Favorit
                </Link>
                
                <hr className="my-2" />
                
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                    router.push('/');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Keluar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2 ml-4">
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700 px-4 py-2 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Daftar
              </Link>
            </div>
          )}
        </nav>
        {/* Mobile nav */}
        <div
          className={`absolute top-full left-0 w-full bg-white shadow-lg flex flex-col items-center py-4 gap-4 lg:hidden z-50 transition-all duration-300 ${
            open
              ? "opacity-100 pointer-events-auto translate-y-0"
              : "opacity-0 pointer-events-none -translate-y-2"
          }`}
        >
          <a
            href="/"
            className={`text-blue-400 hover:underline transition-all duration-150 ${
              isActive("/") ? "underline font-semibold" : ""
            }`}
            onClick={() => setOpen(false)}
          >
            Home
          </a>
          <a
            href="/list"
            className={`text-blue-400 hover:underline transition-all duration-150 ${
              isActive("/list") ? "underline font-semibold" : ""
            }`}
            onClick={() => setOpen(false)}
          >
            Daftar
          </a>
          {/* Mobile Services with submenu */}
          <div className="w-full flex flex-col items-center">
            <button
              className="hover:underline text-blue-400 flex items-center gap-1"
              onClick={() => setServicesOpen((v) => !v)}
              type="button"
            >
              Services
              <svg
                className={`w-4 h-4 transition-transform ${
                  servicesOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`
                flex flex-col w-full items-center mt-1
                transition-all duration-300 origin-top rounded-2xl
                ${servicesOpen
                  ? "opacity-100 scale-y-100 pointer-events-auto"
                  : "opacity-0 scale-y-95 pointer-events-none"
                }
              `}
              style={{ transformOrigin: "top" }}
            >
              <a
                href="/services/angkutBarang"
                className="px-4 py-2 text-blue-400 hover:underline transition rounded-t-2xl"
                onClick={() => {
                  setOpen(false);
                  setServicesOpen(false);
                }}
              >
                Angkut Barang
              </a>
              <a
                href="/services/titipBarang"
                className="px-4 py-2 text-blue-400 hover:underline transition rounded-b-2xl"
                onClick={() => {
                  setOpen(false);
                  setServicesOpen(false);
                }}
              >
                Titip Barang
              </a>
            </div>
          </div>
          <a
            href="/bookings"
            className={`text-blue-400 hover:underline transition-all duration-150 ${
              isActive("/bookings") ? "underline font-semibold" : ""
            }`}
            onClick={() => setOpen(false)}
          >
            Bookings
          </a>
          <a
            href="/complaint"
            className={`text-blue-400 hover:underline transition-all duration-150 ${
              isActive("/complaint") ? "underline font-semibold" : ""
            }`}
            onClick={() => setOpen(false)}
          >
            Aduan
          </a>
          <Link
            href="/contact"
            className={`text-blue-400 hover:underline transition-all duration-150 ${
              isActive("/contact") ? "underline font-semibold" : ""
            }`}
            onClick={() => setOpen(false)}
          >
            Kontak
          </Link>
          
          {/* Authentication Section */}
          {isLoading ? (
            <div className="bg-gray-200 animate-pulse rounded px-4 py-2 w-20"></div>
          ) : isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline">{user?.username}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* User Dropdown Menu */}
              <div
                className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border transition-all duration-200 ${
                  userMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setOpen(false);
                  }}
                >
                  Profil Saya
                </Link>
                
                {user?.role === 'SELLER' && (
                  <Link
                    href="/my-kos"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setOpen(false);
                    }}
                  >
                    Kos Saya
                  </Link>
                )}
                
                <Link
                  href="/bookings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setOpen(false);
                  }}
                >
                  Booking Saya
                </Link>
                
                <Link
                  href="/favorites"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setOpen(false);
                  }}
                >
                  Favorit
                </Link>
                
                <hr className="my-2" />
                
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                    setOpen(false);
                    router.push('/');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Keluar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700 px-4 py-2 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                onClick={() => setOpen(false)}
              >
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                onClick={() => setOpen(false)}
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}