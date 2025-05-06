export default function Header() {
    return (
      <header className="flex items-center justify-between">
        <div className="text-2xl font-bold">KOSERA.</div>
        <nav className="space-x-6">
          <a href="#" className="underline">Home</a>
          <a href="#" className="hover:underline">Daftar</a>
          <a href="#" className="hover:underline">Kontak</a>
          <a href="#" className="hover:underline">Aduan</a>
          <button className="ml-4 bg-blue-600 text-white px-4 py-2 rounded">Login</button>
        </nav>
      </header>
    );
  }
  