"use client";

import { useMemo, useState } from "react";
import {
  Armchair,
  Book,
  Car,
  Dumbbell,
  Gamepad2,
  HeartHandshake,
  HelpCircle,
  Monitor,
  Shirt,
  ShoppingCart,
} from "lucide-react";
import LoadMoreProducts from "./LoadMore";
import SectionHeading from "./SectionHeading";
import type { Product } from "@/types/product";

const CATEGORY_CARDS = [
  { id: "all", label: "All", icon: HelpCircle },
  { id: "beauty", label: "Beauty", icon: HeartHandshake },
  { id: "electronics", label: "Electronics", icon: Monitor },
  { id: "clothing", label: "Clothing", icon: Shirt },
  { id: "books", label: "Books", icon: Book },
  { id: "furniture", label: "Furniture", icon: Armchair },
  { id: "toys", label: "Toys", icon: Gamepad2 },
  { id: "groceries", label: "Groceries", icon: ShoppingCart },
  { id: "sports", label: "Sports", icon: Dumbbell },
  { id: "automotive", label: "Automotive", icon: Car },
];

type CategoryProductBrowserProps = {
  allProducts: Product[];
};

export default function CategoryProductBrowser({
  allProducts,
}: CategoryProductBrowserProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") {
      return allProducts;
    }
    return allProducts.filter((product) => product.category === activeCategory);
  }, [activeCategory, allProducts]);

  const handleCategoryClick = (id: string) => {
    setActiveCategory((current) => (current === id ? "all" : id));
  };

  const activeLabel =
    CATEGORY_CARDS.find((category) => category.id === activeCategory)?.label ??
    "Our Products";

  return (
    <>
      <section className="space-y-8 px-6 md:px-20 py-12">
        <SectionHeading label="Categories" title="Browse By Category" />
        <div className="flex gap-4 overflow-x-auto pb-3 hide-scrollbar md:flex-wrap md:overflow-visible">
          {CATEGORY_CARDS.map(({ id, label, icon: Icon }) => {
            const isActive = id === activeCategory;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleCategoryClick(id)}
                className={`flex min-w-[94px] flex-col items-center gap-2 rounded-md border px-4 py-5 text-xs font-medium transition md:min-w-[180px] md:px-6 md:py-6 md:text-sm ${
                  isActive
                    ? "border-[#db4444] text-[#db4444]"
                    : "border-[#e1e1e1] text-[#1a1a1a]/80 hover:border-[#db4444] hover:text-[#db4444]"
                }`}
              >
                <Icon className="h-8 w-8 md:h-10 md:w-10" />
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <hr className="border-[#f2f2f2]" />

      <section className="space-y-8 px-6 md:px-20 py-12">
        <SectionHeading label={activeLabel} title="Explore Our Products" />
        <LoadMoreProducts allProducts={filteredProducts} />
      </section>
    </>
  );
}
