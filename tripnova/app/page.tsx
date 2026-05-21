'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, Search, MapPin, Star, Calendar, Palmtree, Mountain, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories list
  const categories = [
    { id: 'all', label: 'All Places', icon: Compass },
    { id: 'beaches', label: 'Beaches', icon: Palmtree },
    { id: 'mountains', label: 'Mountains', icon: Mountain },
    { id: 'heritage', label: 'Historical', icon: Shield },
  ];

  // Destinations database
  const destinations = [
    {
      id: 1,
      title: 'Maldives Private Resort',
      category: 'beaches',
      location: 'Maldives',
      rating: 4.9,
      price: '₹45,000/Pax',
      img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      desc: 'White sands, crystal clear blue lagoons, and private overwater villas.',
    },
    {
      id: 2,
      title: 'Swiss Alps Ski Lodge',
      category: 'mountains',
      location: 'Switzerland',
      rating: 4.8,
      price: '₹62,000/Pax',
      img: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      desc: 'Breathtaking glacier views, premium ski trails, and cozy fireplace cabins.',
    },
    {
      id: 3,
      title: 'Colosseum Heritage Walk',
      category: 'heritage',
      location: 'Rome, Italy',
      rating: 4.7,
      price: '₹18,500/Pax',
      img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      desc: 'Explore the ancient wonders of the Roman Empire with expert archeologists.',
    },
    {
      id: 4,
      title: 'Bali Sanctuary Stays',
      category: 'beaches',
      location: 'Bali, Indonesia',
      rating: 4.9,
      price: '₹22,000/Pax',
      img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      desc: 'Lush tropical forests, historic temple gates, and spiritual yoga resorts.',
    },
    {
      id: 5,
      title: 'Manali Snow Trekking',
      category: 'mountains',
      location: 'Himachal Pradesh, India',
      rating: 4.6,
      price: '₹8,999/Pax',
      img: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      desc: 'Adventurous winter hikes through Solang Valley and frozen waterfalls.',
    },
    {
      id: 6,
      title: 'Taj Mahal Guided Walk',
      category: 'heritage',
      location: 'Agra, India',
      rating: 4.9,
      price: '₹2,500/Pax',
      img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      desc: 'Behold the monument of eternal love under the morning sun with historians.',
    },
  ];

  // Filtering Logic
  const filtered = destinations.filter((dest) => {
    const matchesCategory = activeCategory === 'all' || dest.category === activeCategory;
    const matchesSearch =
      dest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#070614]">
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-36 px-4 flex flex-col items-center text-center overflow-hidden border-b border-zinc-900/60">
        {/* Neon Light rings */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Travel Recommendations</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Explore the World with{' '}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              TripNova
            </span>
          </h1>

          <p className="text-base md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Configure your personalized travel interests, build dynamic day-by-day itineraries, and secure premium tour packages instantly.
          </p>

          {/* Quick Search Input */}
          <div className="max-w-xl mx-auto w-full pt-4">
            <div className="relative flex items-center bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <Search className="absolute left-4.5 h-5 w-5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city, country or attraction..."
                className="w-full bg-transparent border-0 pl-12 pr-4 py-3.5 text-zinc-100 text-sm focus:outline-none placeholder:text-zinc-500"
              />
              <Link href="/login">
                <Button size="sm" className="hidden sm:inline-flex rounded-xl whitespace-nowrap">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs & Grid Catalog */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Featured Destinations</h2>
            <p className="text-sm text-zinc-400 mt-1">Curated places with matching itineraries and booking packages.</p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-violet-600/10 border-violet-500/40 text-violet-400'
                      : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid Catalog */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dest) => (
            <Card
              key={dest.id}
              variant="default"
              className="group border-zinc-850/60 bg-zinc-950/20 hover:border-zinc-800 hover:bg-zinc-900/10 transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-video overflow-hidden bg-zinc-900">
                <img
                  src={dest.img}
                  alt={dest.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-[10px] font-bold font-mono text-zinc-400 uppercase">
                  {dest.category}
                </div>
                <div className="absolute top-3 right-3 bg-violet-600 text-white px-2.5 py-1 rounded-lg text-xs font-extrabold">
                  {dest.price}
                </div>
              </div>

              <CardHeader className="p-5 pb-2">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                    {dest.location}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-yellow-400">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {dest.rating}
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-white mt-2 group-hover:text-violet-400 transition-colors">
                  {dest.title}
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 leading-relaxed mt-1">
                  {dest.desc}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-4 border-t border-zinc-900/60 flex justify-between items-center bg-zinc-950/10">
                <Link href="/login" className="w-full">
                  <Button size="sm" variant="outline" className="w-full h-10 text-xs border-zinc-850 hover:bg-zinc-900">
                    Unlock Packages
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-zinc-500 text-xs italic">
              No matching destinations found.
            </div>
          )}
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-5xl w-full mx-auto px-4 py-16">
        <Card variant="glow" className="p-8 md:p-12 text-center space-y-6 relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-950 to-violet-950/20 border-violet-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(139,92,246,0.03),transparent)]" />
          <h2 className="text-2xl md:text-4xl font-extrabold text-white z-10 relative">
            Ready to Begin Your Adventure?
          </h2>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto z-10 relative leading-relaxed">
            Create an account in less than a minute. Specify your interests, build a day-by-day flight & hotel itinerary, and find matching activities.
          </p>
          <div className="flex gap-4 justify-center pt-2 z-10 relative">
            <Link href="/signup">
              <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
                Register Account
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
