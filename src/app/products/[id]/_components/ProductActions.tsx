"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import AddToBasketButton from "../../../_components/AddBasket";

type ProductActionsProps = {
  productId: string;
};

export default function ProductActions({ productId }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="flex items-center rounded-full border border-[#d9d9d9]">
        <button
          type="button"
          onClick={handleDecrease}
          className="flex h-12 w-12 items-center justify-center text-lg text-[#6a6a6a] hover:text-[#db4444] transition"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="flex h-12 w-12 items-center justify-center text-base font-semibold">
          {quantity}
        </span>
        <button
          type="button"
          onClick={handleIncrease}
          className="flex h-12 w-12 items-center justify-center text-lg text-[#6a6a6a] hover:text-[#db4444] transition"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <AddToBasketButton productId={productId} count={quantity}>
        Add to Basket
      </AddToBasketButton>
    </div>
  );
}
