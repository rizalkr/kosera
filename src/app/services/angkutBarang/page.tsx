import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TitipBarangComingSoon() {
  return (
    <div className="min-h-screen px-8 py-6 bg-[#A9E4DE] pt-20 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center">
          <svg
            className="w-24 h-24 text-blue-300 mb-6 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 48 48"
          >
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="#E1F6F2" />
            <path
              d="M16 32v-8a8 8 0 0116 0v8"
              stroke="#60A5FA"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="24" cy="36" r="2" fill="#60A5FA" />
          </svg>
          <h1 className="text-4xl font-bold text-blue-400 mb-2 text-center">Coming Soon!</h1>
          <p className="text-blue-500 text-lg mb-4 text-center">
            Fitur <span className="font-semibold">Titip Barang</span> sedang dalam pengembangan.<br />
            Nantikan kehadirannya di KOSERA!
          </p>
          <span className="inline-block bg-blue-100 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold">
            Stay tuned 🚀
          </span>
        </div>
      </main>
      <Footer />
    </div>
  );
}