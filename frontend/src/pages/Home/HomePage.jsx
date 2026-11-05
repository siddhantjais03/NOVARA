import React, { useState } from 'react';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Navbar } from '../../components/Navbar/Navbar';
import { HeroSection } from '../../components/Hero/HeroSection';
import { Categories } from '../../components/Categories/Categories';
import { TrendingProducts } from '../../components/Trending/TrendingProducts';
import { SpecialOffers } from '../../components/SpecialOffers/SpecialOffers';
import { BestSellers } from '../../components/BestSellers/BestSellers';
import { TrustPerks } from '../../components/TrustPerks/TrustPerks';
import { Newsletter } from '../../components/Newsletter/Newsletter';
import { Footer } from '../../components/Footer/Footer';

export const HomePage = () => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);

  const handleSelectCategory = (categoryName) => {
    setActiveCategoryFilter(categoryName);
  };

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main>
        <HeroSection />
        <Categories onSelectCategory={handleSelectCategory} />
        <TrendingProducts
          activeCategoryFilter={activeCategoryFilter}
          setActiveCategoryFilter={setActiveCategoryFilter}
        />
        <SpecialOffers />
        <BestSellers />
        <TrustPerks />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
};

