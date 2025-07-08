import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#E1F6F2] text-[#83B8C6] mt-12 rounded-t-xl shadow-inner">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xl font-bold tracking-wide">KOSERA.</div>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/list" className="hover:underline">Daftar</Link>
          <Link href="/contact" className="hover:underline">Kontak</Link>
          <Link href="/bookings" className="hover:underline">Bookings</Link>
          <Link href="/complaint" className="hover:underline">Aduan</Link>
          <Link href="/profile" className="hover:underline">Profil</Link>
        </div>
        <div className="text-xs text-blue-400 mt-4 md:mt-0">
          &copy; {new Date().getFullYear()} Kosera. All rights reserved.
        </div>
      </div>
    </footer>
  );
}