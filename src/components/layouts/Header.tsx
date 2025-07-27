"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(event.target as Node)
      ) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Navigation items berdasarkan role
  const getNavigationItems = () => {
    if (!user) return [];
    
    const items = [];

    switch (user.role) {
      case 'ADMIN':
        items.push(
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Profil', href: '/profile' }
        );
        break;
      case 'SELLER':
        items.push(
          { label: 'Dashboard', href: '/seller/dashboard' },
          { label: 'Profil', href: '/profile' }
        );
        break;
      case 'RENTER':
        items.push(
          { label: 'Bookings', href: '/bookings' },
          { label: 'Favorit', href: '/favorites' },
          { label: 'Profil', href: '/profile' }
        );
        break;
    }

    return items;
  };

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
      <div className="max-w-7xl mx-auto flex items-center px-8 py-4 relative overflow-visible">
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
          } hidden lg:flex overflow-visible`}
        >
          <button
            onClick={() => router.push("/")}
            className={`text-[#83B8C6] hover:underline transition-all duration-150 ${
              isActive("/") ? "underline font-semibold" : ""
            }`}
          >
            Home
          </button>
          <button
            onClick={() => router.push("/list")}
            className={`text-[#83B8C6] hover:underline transition-all duration-150 ${
              isActive("/list") ? "underline font-semibold" : ""
            }`}
          >
            Daftar
          </button>
          <div className="mt-2 relative inline-block" ref={servicesRef}>
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
              <button
                onClick={() => {
                  router.push("/services/angkutBarang");
                  setServicesOpen(false);
                }}
                className="px-4 py-2 text-left hover:bg-blue-50 hover:underline transition rounded-t-2xl"
              >
                Angkut Barang
              </button>
              <button
                onClick={() => {
                  router.push("/services/titipBarang");
                  setServicesOpen(false);
                }}
                className="px-4 py-2 text-left hover:bg-blue-50 hover:underline transition rounded-b-2xl"
              >
                Titip Barang
              </button>
            </div>
          </div>
          {/* Dynamic navigation based on user role */}
          {isAuthenticated && getNavigationItems().map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`text-[#83B8C6] hover:underline transition-all duration-150 ${
                isActive(item.href) ? "underline font-semibold" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
          
          {/* Authentication Section for Desktop */}
          {isLoading ? (
            <div className="ml-4 bg-gray-200 animate-pulse rounded px-4 py-2 w-20"></div>
          ) : isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="ml-4 text-red-600 hover:text-red-700 px-4 py-2 border border-red-600 rounded hover:bg-red-50 transition-colors"
            >
              Keluar
            </button>
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
          <button
            onClick={() => {
              router.push("/");
              setOpen(false);
            }}
            className={`text-blue-400 hover:underline transition-all duration-150 ${
              isActive("/") ? "underline font-semibold" : ""
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              router.push("/list");
              setOpen(false);
            }}
            className={`text-blue-400 hover:underline transition-all duration-150 ${
              isActive("/list") ? "underline font-semibold" : ""
            }`}
          >
            Daftar
          </button>
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
                flex flex-col w-full items-center overflow-hidden
                transition-all duration-300 ease-in-out
                ${servicesOpen
                  ? "max-h-24 opacity-100"
                  : "max-h-0 opacity-0"
                }
              `}
            >
              <button
                onClick={() => {
                  router.push("/services/angkutBarang");
                  setOpen(false);
                  setServicesOpen(false);
                }}
                className="px-4 py-2 text-blue-400 hover:underline transition w-full text-center"
              >
                Angkut Barang
              </button>
              <button
                onClick={() => {
                  router.push("/services/titipBarang");
                  setOpen(false);
                  setServicesOpen(false);
                }}
                className="px-4 py-2 text-blue-400 hover:underline transition w-full text-center"
              >
                Titip Barang
              </button>
            </div>
          </div>
        
          {/* Dynamic navigation based on user role */}
          {isAuthenticated && getNavigationItems().map((item) => (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href);
                setOpen(false);
              }}
              className={`text-blue-400 hover:underline transition-all duration-150 ${
                isActive(item.href) ? "underline font-semibold" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
          
          {/* Authentication Section */}
          {isLoading ? (
            <div className="bg-gray-200 animate-pulse rounded px-4 py-2 w-20"></div>
          ) : isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 px-4 py-2 border border-red-600 rounded hover:bg-red-50 transition-colors"
            >
              Keluar
            </button>
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