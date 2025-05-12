export default function Footer() {
  return (
    <footer className="bg-[#E1F6F2] text-[#83B8C6] mt-12 rounded-t-xl shadow-inner">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xl font-bold tracking-wide">KOSERA.</div>
        <div className="flex flex-wrap gap-6 text-sm">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">Daftar</a>
          <a href="#" className="hover:underline">Kontak</a>
          <a href="#" className="hover:underline">Bookings</a>
          <a href="#" className="hover:underline">Aduan</a>
        </div>
        <div className="text-xs text-blue-400 mt-2 md:mt-0">
          &copy; {new Date().getFullYear()} Kosera. All rights reserved.
        </div>
      </div>
    </footer>
  );
}