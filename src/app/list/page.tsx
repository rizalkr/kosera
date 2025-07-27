import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import FilterBar from '@/components/common/FilterBar';
import FeaturedList from '@/components/common/FeaturedList';

export default function DaftarKosPage() {
  return (
    <div className="min-h-screen px-8 py-6 bg-[#A9E4DE] pt-20">
      <Header />
      <main className="mt-8 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-blue-400">Daftar Kos</h1>
        <FilterBar />
        <div className="mt-8">
          <FeaturedList />
        </div>
      </main>
      <Footer />
    </div>
  );
}