"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  refreshAccessToken,
  clearAuthTokens,
  getAccessToken,
} from "@/lib/auth";
import { BasketCountFromAPI } from "@/lib/basket";

type AddToBasketButtonProps = {
  productId: string;
  count?: number;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "hover" | "mobile";
};

export default function AddToBasketButton({
  productId,
  count = 1,
  className = "",
  children,
  variant = "default",
}: AddToBasketButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = async (token: string): Promise<Response> => {
    const baseUrl = "https://ilkinibadov.com/api/v1";

    return fetch(`${baseUrl}/basket/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: productId,
        count: count,
      }),
    });
  };

  const handleAddToBasket = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response = await makeRequest(accessToken);

      if (response.status === 401) {
        const newToken = await refreshAccessToken();

        if (newToken) {
          response = await makeRequest(newToken);
        } else {
          clearAuthTokens();
          router.push("/login");
          return;
        }
      }

      let data;
      try {
        data = await response.json();
      } catch {
        const text = await response.text();
        throw new Error(text || "Failed to add product to basket");
      }

      if (response.ok || data.success === true) {
        await BasketCountFromAPI();
        return;
      }

      const errorMessage =
        data.message ||
        data.error ||
        "Failed to add product to basket. Please try again.";

      throw new Error(errorMessage);
    } catch (err) {
      console.error("Add to basket error:", err);

      if (err instanceof Error) {
        setError(err.message);

        if (
          err.message.includes("401") ||
          err.message.includes("Unauthorized")
        ) {
          clearAuthTokens();
          router.push("/login");
          return;
        }
      } else {
        setError("An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const defaultClassName =
    variant === "hover"
      ? "hidden md:absolute md:left-1/2 md:bottom-0 md:cursor-pointer md:flex md:w-full md:-translate-x-1/2 md:translate-y-full md:items-center md:justify-center md:bg-[#000000] md:py-4 md:text-sm md:font-semibold md:text-white md:opacity-0 md:transition-all md:duration-300 md:hover:bg-[#c03939] md:group-hover:translate-y-0 md:group-hover:opacity-100"
      : variant === "mobile"
      ? "mt-3 w-full rounded-md bg-[#db4444] py-2 text-sm font-semibold text-white md:hidden"
      : "rounded-md bg-[#db4444] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#c13a3a] disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <>
      <button
        type="button"
        onClick={handleAddToBasket}
        disabled={isLoading}
        className={`${defaultClassName} ${className}`}
      >
        {isLoading ? "Adding..." : children || "Add to basket"}
      </button>
      {error && variant !== "hover" && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </>
  );
}
