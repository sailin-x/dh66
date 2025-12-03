import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Darkest Hour
          </h1>

          <h2 className="text-2xl md:text-4xl font-semibold text-gray-300">
            Find Truly Dark Skies
          </h2>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Discover the darkest skies on Earth. Plan your stargazing adventures with
            real-time light pollution data and astronomical conditions.
          </p>

          <div className="pt-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4 h-auto font-semibold"
              >
                Explore Dark Skies
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
