"use client";

import { useState } from "react";
import { KategoriProduk } from "@/components/sections/KategoriProduk";
import { ProductCatalog } from "@/components/sections/ProductCatalog";
import type { ProductCategory } from "@/types";

export function CatalogSection() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">("all");

  return (
    <>
      <KategoriProduk onSelect={setActiveCategory} />
      <ProductCatalog
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
    </>
  );
}
