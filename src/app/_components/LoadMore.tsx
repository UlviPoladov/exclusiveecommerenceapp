"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AddToBasketButton from "./AddBasket";
import type { Product } from "@/types/product";

type LoadMoreProductsProps = {
  allProducts: Product[];
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const INITIAL_DISPLAY_COUNT = 8;
const LOAD_MORE_COUNT = 8;

export default function LoadMoreProducts({
  allProducts,
}: LoadMoreProductsProps) {
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  useEffect(() => {
    setDisplayCount(Math.min(INITIAL_DISPLAY_COUNT, allProducts.length));
  }, [allProducts]);
  const displayedProducts = allProducts.slice(0, displayCount);
  const hasMore = displayCount < allProducts.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) =>
      Math.min(prev + LOAD_MORE_COUNT, allProducts.length)
    );
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 px-0 md:grid-cols-2 lg:grid-cols-4 md:px-0">
        {displayedProducts.map((product) => (
          <article
            key={product.id}
            className="group rounded-lg border border-[#f0f0f0] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.05)]"
          >
            <div className="relative h-56 w-full overflow-hidden rounded-md bg-[#f5f5f5]">
              <Link
                href={`/products/${product.id}`}
                className="relative block h-full w-full"
              >
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-contain"
                />
              </Link>
              <AddToBasketButton productId={product.id} variant="hover">
                Add to basket
              </AddToBasketButton>
            </div>
            <AddToBasketButton productId={product.id} variant="mobile">
              Add to basket
            </AddToBasketButton>
            <Link
              href={`/products/${product.id}`}
              className="mt-4 flex flex-col gap-2"
            >
              <p className="pl-2 text-base font-medium">{product.title}</p>
              <p className="pl-2 pb-2 text-lg font-semibold text-[#db4444]">
                {formatter.format(product.price)}
              </p>
            </Link>
          </article>
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            className="hover:cursor-pointer hover:bg-[#c03939] rounded-md bg-[#db4444] px-20 py-3 text-sm font-semibold text-white transition"
          >
            View More
          </button>
        </div>
      )}
    </>
  );
}
