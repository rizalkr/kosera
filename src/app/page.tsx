import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import FeaturedList from '@/components/FeaturedList';
import MapSection from '@/components/MapSection';
import RecommendationCarousel from '@/components/RecommendationCarousel';

export default function HomePage() {
  return (
    <div className="min-h-screen px-8 py-6 bg-white">
      <Header />
      <main className="mt-8">
        <h1 className="text-5xl font-bold mb-6 text-blue-900">Temukan Kos Idealmu!</h1>
        <FilterBar />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">Featured Rooms</h2>
            <FeaturedList />
          </div>
          <div className="space-y-8">
            <MapSection />
            <section>
              <RecommendationCarousel />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}