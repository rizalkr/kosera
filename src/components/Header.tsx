"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = usePathname();

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
          <button className="ml-4 bg-[#F3D17C] text-white px-4 py-2 rounded">
            Login
          </button>
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
          <a
            href="/contact"
            className={`text-blue-400 hover:underline transition-all duration-150 ${
              isActive("/contact") ? "underline font-semibold" : ""
            }`}
            onClick={() => setOpen(false)}
          >
            Kontak
          </a>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setOpen(false)}
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
}