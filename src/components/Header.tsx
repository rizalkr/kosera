"use client"
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
          <a href="#" className="hover:underline text-blue-400" onClick={() => setOpen(false)}>Bookings</a>
          <a href="#" className="hover:underline text-blue-400" onClick={() => setOpen(false)}>Aduan</a>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setOpen(false)}>Login</button>
        </div>
      </div>
    </header>
  );
}