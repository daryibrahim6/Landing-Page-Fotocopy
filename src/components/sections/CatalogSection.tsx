"use client";

import { useState } from "react";
import { KategoriProduk } from "@/components/sections/KategoriProduk";
import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { WavyDivider } from "@/components/shared/WavyDivider";
import type { ProductCategory } from "@/types";

export function CatalogSection() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">("all");

  return (
    <>
      <KategoriProduk onSelect={setActiveCategory} />
      <WavyDivider color="#F8FAFC" flip />
      <ProductCatalog
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
    </>
  );
}
