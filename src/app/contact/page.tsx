import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen px-8 py-6 bg-[#A9E4DE] pt-20">
      <Header />
      <main className="max-w-2xl mx-auto mt-12 bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-blue-400 mb-4">Contact & Profile</h1>
        <div className="flex flex-col items-center gap-4">
          <img
            src="/images/profile.jpg"
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
          />
          <div className="text-center">
            <div className="text-xl font-semibold text-blue-500">Rizal Kurnia</div>
            <div className="text-gray-600">Mahasiswa Informatika</div>
            <div className="text-gray-500">Universitas Semarang</div>
            <div className="mt-2 text-gray-700">
              <div>Email: <a href="mailto:rizalkurnia.me@gmail.com" className="text-blue-400 hover:underline">rizalkurnia.me@gmail.com</a></div>
              <div>Telepon: <a href="tel:085191294341" className="text-blue-400 hover:underline">0851-9129-4341</a></div>
            </div>
            <div className="mt-4 flex gap-3 justify-center">
              <a href="https://github.com/rizalkr" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">GitHub</a>
              <a href="https://www.linkedin.com/in/rizal-kurnia-83709a366/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">LinkedIn</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}