"use client"
import { useEffect, useState, useRef } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false); 

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
          <a href="#" className="underline text-[#83B8C6]">Home</a>
          <a href="#" className="hover:underline text-[#83B8C6]">Daftar</a>
          <a href="#" className="hover:underline text-[#83B8C6]">Kontak</a>
          {/* Services with submenu */}
          <div className="relative inline-block" ref={servicesRef}>
            <button
              className="hover:underline text-[#83B8C6] flex items-center gap-1"
              onClick={() => setServicesOpen((v) => !v)}
              type="button"
            >
              Services
              <svg className={`w-4 h-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            {/* Submenu */}
            {servicesOpen && (
              <div className="absolute left-0 mt-2 w-40 bg-white rounded shadow-lg z-50 flex flex-col text-[#83B8C6]">
                <a href="#" className="px-4 py-2 hover:bg-blue-50 hover:underline">Angkut Barang</a>
                <a href="#" className="px-4 py-2 hover:bg-blue-50 hover:underline">Titip Barang</a>
              </div>
            )}
          </div>
          <a href="#" className="hover:underline text-[#83B8C6]">Bookings</a>
          <a href="#" className="hover:underline text-[#83B8C6]">Aduan</a>
          <button className="ml-4 bg-[#F3D17C] text-white px-4 py-2 rounded">Login</button>
        </nav>
        {/* Mobile nav */}
        <div
          className={`absolute top-full left-0 w-full bg-white shadow-lg flex flex-col items-center py-4 gap-4 lg:hidden z-50 transition-all duration-300 ${
            open
              ? "opacity-100 pointer-events-auto translate-y-0"
              : "opacity-0 pointer-events-none -translate-y-2"
          }`}
        >
          <a href="#" className="underline text-blue-400" onClick={() => setOpen(false)}>Home</a>
          <a href="#" className="hover:underline text-blue-400" onClick={() => setOpen(false)}>Daftar</a>
          <a href="#" className="hover:underline text-blue-400" onClick={() => setOpen(false)}>Kontak</a>
          {/* Mobile Services with submenu */}
          <div className="w-full flex flex-col items-center">
            <button
              className="hover:underline text-blue-400 flex items-center gap-1"
              onClick={() => setServicesOpen((v) => !v)}
              type="button"
            >
              Services
              <svg className={`w-4 h-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            {servicesOpen && (
              <div className="flex flex-col w-full items-center mt-1">
                <a href="#" className="px-4 py-2 text-blue-400 hover:underline" onClick={() => { setOpen(false); setServicesOpen(false); }}>Angkut Barang</a>
                <a href="#" className="px-4 py-2 text-blue-400 hover:underline" onClick={() => { setOpen(false); setServicesOpen(false); }}>Titip Barang</a>
              </div>
            )}
          </div>
          <a href="#" className="hover:underline text-blue-400" onClick={() => setOpen(false)}>Bookings</a>
          <a href="#" className="hover:underline text-blue-400" onClick={() => setOpen(false)}>Aduan</a>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setOpen(false)}>Login</button>
        </div>
      </div>
    </header>
  );
}