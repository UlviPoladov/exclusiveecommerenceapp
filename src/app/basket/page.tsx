"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, Heart } from "lucide-react";
import {
  getAccessToken,
  refreshAccessToken,
  clearAuthTokens,
} from "@/lib/auth";
import { updateBasketItemCount, deleteBasketItem } from "@/lib/basket";

type BasketItem = {
  _id: string;
  id?: string;
  productId?: string;
  product?: {
    _id: string;
    id?: string;
    title?: string;
    name?: string;
    price?: number | string;
    pricePerItem?: number | string;
    currency?: string;
    image?: string;
  };
  title?: string;
  count?: number;
  quantity?: number;
  price?: number | string;
  pricePerItem?: number | string;
  currency?: string;
  image?: string;
};

type BasketResponse = {
  content?: BasketItem[];
  products?: BasketItem[];
};

export default function BasketPage() {
  const router = useRouter();
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteProductIds, setFavoriteProductIds] = useState<Set<string>>(
    new Set()
  );
  const [favoriteIdMap, setFavoriteIdMap] = useState<Map<string, string>>(
    new Map()
  );

  const fetchBasketItems = useCallback(async () => {
    const baseUrl = "https://ilkinibadov.com/api/v1";

    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response = await fetch(`${baseUrl}/basket/products`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        const newToken = await refreshAccessToken();

        if (newToken) {
          response = await fetch(`${baseUrl}/basket/products`, {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });
        } else {
          router.push("/login");
          return;
        }
      }

      if (!response.ok) {
        throw new Error("Failed to fetch basket items");
      }

      const data: BasketResponse = await response.json();
      const items = Array.isArray(data)
        ? data
        : data.content || data.products || [];
      setBasketItems(items);
    } catch (err) {
      console.error("Failed to fetch basket:", err);
      setError(err instanceof Error ? err.message : "Failed to load basket");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const fetchFavorites = useCallback(async (): Promise<Map<string, string>> => {
    const baseUrl = "https://ilkinibadov.com/api/v1";

    const accessToken = getAccessToken();
    if (!accessToken) {
      return new Map();
    }

    try {
      let response = await fetch(`${baseUrl}/favorites/products`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        const newToken = await refreshAccessToken();

        if (newToken) {
          response = await fetch(`${baseUrl}/favorites/products`, {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });
        } else {
          return new Map();
        }
      }

      if (response.ok) {
        const data = await response.json();
        const favorites = Array.isArray(data) ? data : data.content || [];
        const favoriteIds = new Set<string>();
        const favoriteMap = new Map<string, string>();

        favorites.forEach(
          (fav: {
            id?: string;
            _id?: string;
            productId?: string;
            product?: { _id?: string; id?: string };
            favoriteId?: string;
          }) => {
            const productId =
              fav.id || fav.productId || fav.product?._id || fav.product?.id;

            const favoriteId = fav.favoriteId || fav._id || fav.id;

            if (productId) {
              favoriteIds.add(String(productId));
              favoriteMap.set(
                String(productId),
                String(favoriteId || productId)
              );
            }
          }
        );

        setFavoriteProductIds((prev) => {
          const merged = new Set(prev);
          favoriteIds.forEach((id) => merged.add(id));
          return merged;
        });
        setFavoriteIdMap((prev) => {
          const merged = new Map(prev);
          favoriteMap.forEach((value, key) => merged.set(key, value));
          return merged;
        });
        return favoriteMap;
      }
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
    }

    return new Map();
  }, []);

  useEffect(() => {
    fetchBasketItems();
    fetchFavorites();
  }, [fetchBasketItems, fetchFavorites]);

  const handleUpdateCount = async (itemId: string, newCount: number) => {
    if (newCount < 1) {
      return;
    }

    try {
      await updateBasketItemCount(itemId, newCount);
      fetchBasketItems().catch((err) => {
        console.error("Failed to refresh basket:", err);
      });
    } catch (err) {
      console.error("Failed to update item:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update item";

      if (
        errorMessage.includes("token") ||
        errorMessage.includes("authentication") ||
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("401")
      ) {
        router.push("/login");
        return;
      }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteBasketItem(itemId);
      fetchBasketItems().catch((err) => {
        console.error("Failed to refresh basket:", err);
      });
    } catch (err) {
      console.error("Failed to delete item:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete item";

      if (
        errorMessage.includes("token") ||
        errorMessage.includes("authentication") ||
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("401")
      ) {
        router.push("/login");
        return;
      }

      alert(errorMessage);
    }
  };

  const handleToggleFavorite = async (productId: string) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push("/login");
      return;
    }

    const baseUrl = "https://ilkinibadov.com/api/v1";
    const isFavorite = favoriteProductIds.has(productId);
    const favoriteId = favoriteIdMap.get(productId);

    try {
      let response;

      if (isFavorite && favoriteId) {
        response = await fetch(`${baseUrl}/favorites/delete/${favoriteId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 401) {
          const newToken = await refreshAccessToken();

          if (newToken) {
            response = await fetch(
              `${baseUrl}/favorites/delete/${favoriteId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );
          } else {
            clearAuthTokens();
            router.push("/login");
            return;
          }
        }

        if (response.ok) {
          setFavoriteProductIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
          setFavoriteIdMap((prev) => {
            const newMap = new Map(prev);
            newMap.delete(productId);
            return newMap;
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              errorData.error ||
              "Failed to remove from favorites"
          );
        }
      } else {
        response = await fetch(`${baseUrl}/favorites/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            productId: productId,
          }),
        });

        if (response.status === 401) {
          const newToken = await refreshAccessToken();

          if (newToken) {
            response = await fetch(`${baseUrl}/favorites/add`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`,
              },
              body: JSON.stringify({
                productId: productId,
              }),
            });
          } else {
            clearAuthTokens();
            router.push("/login");
            return;
          }
        }

        if (response.ok) {
          const data = await response.json();
          const newFavoriteId = data._id || data.id || data.favoriteId;

          setFavoriteProductIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(productId);
            return newSet;
          });

          if (newFavoriteId) {
            setFavoriteIdMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(productId, String(newFavoriteId));
              return newMap;
            });
          } else {
            const updatedFavoriteMap = await fetchFavorites();
            const favoriteIdFromApi = updatedFavoriteMap.get(productId);
            if (favoriteIdFromApi) {
              setFavoriteIdMap((prev) => {
                const newMap = new Map(prev);
                newMap.set(productId, favoriteIdFromApi);
                return newMap;
              });
            }
            setFavoriteProductIds((prev) => {
              const newSet = new Set(prev);
              newSet.add(productId);
              return newSet;
            });
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.message ||
            errorData.error ||
            "Failed to add to favorites";

          if (
            errorMessage.toLowerCase().includes("already in favorites") ||
            errorMessage.toLowerCase().includes("already exists")
          ) {
            const updatedFavoriteMap = await fetchFavorites();
            const favoriteIdToDelete = updatedFavoriteMap.get(productId);

            if (favoriteIdToDelete) {
              let deleteResponse = await fetch(
                `${baseUrl}/favorites/delete/${favoriteIdToDelete}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              if (deleteResponse.status === 401) {
                const newToken = await refreshAccessToken();

                if (newToken) {
                  deleteResponse = await fetch(
                    `${baseUrl}/favorites/delete/${favoriteIdToDelete}`,
                    {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${newToken}`,
                      },
                    }
                  );
                } else {
                  clearAuthTokens();
                  router.push("/login");
                  return;
                }
              }

              if (deleteResponse.ok) {
                setFavoriteProductIds((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(productId);
                  return newSet;
                });
                setFavoriteIdMap((prev) => {
                  const newMap = new Map(prev);
                  newMap.delete(productId);
                  return newMap;
                });
                return;
              } else {
                const deleteErrorData = await deleteResponse
                  .json()
                  .catch(() => ({}));
                throw new Error(
                  deleteErrorData.message ||
                    deleteErrorData.error ||
                    "Failed to remove from favorites"
                );
              }
            } else {
              await fetchFavorites();
              throw new Error(
                "Product is already in favorites, but favorite ID not found"
              );
            }
          }

          throw new Error(errorMessage);
        }
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to toggle favorite";

      if (
        errorMessage.includes("token") ||
        errorMessage.includes("authentication") ||
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("401")
      ) {
        router.push("/login");
        return;
      }

      alert(errorMessage);
    }
  };

  const getItemPrice = (item: BasketItem): number => {
    const pricePerItem = item.pricePerItem || item.product?.pricePerItem;
    const price = pricePerItem || item.price || item.product?.price || 0;
    return typeof price === "string" ? parseFloat(price) : price;
  };

  const getItemImage = (item: BasketItem): string => {
    if (item) {
      return item.image ? item.image : "/placeholder-product.jpg";
    }
    return "/placeholder-product.jpg";
  };

  const getItemTitle = (item: BasketItem): string => {
    if (item) {
      return item.title || "Product";
    }
    return "Product";
  };

  const getItemCount = (item: BasketItem): number => {
    return item.count || item.quantity || 1;
  };

  const calculateTotal = (): number => {
    return basketItems.reduce((total, item) => {
      const price = getItemPrice(item);
      const count = getItemCount(item);
      return total + price * count;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-20">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#db4444] border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Loading basket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-20">
        <div className="text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            onClick={fetchBasketItems}
            className="rounded-md bg-[#db4444] px-6 py-2 text-white hover:bg-[#c13a3a]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (basketItems.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-20">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Your basket is empty</h2>
          <p className="mb-6 text-gray-600">
            Add some products to your basket to get started.
          </p>
          <Link
            href="/"
            className="inline-block rounded-md bg-[#db4444] px-6 py-2 text-white hover:bg-[#c13a3a]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen px-6 py-8 sm:px-12 lg:px-20">
      <h1 className="mb-8 text-3xl font-bold">Shopping Basket</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Basket Items */}
        <div className="flex-1">
          <div className="space-y-4">
            {basketItems.map((item) => {
              const itemId = item._id || item.id || "";
              const productId =
                item.productId ||
                item.product?._id ||
                item.product?.id ||
                itemId;
              const count = getItemCount(item);
              const price = getItemPrice(item);
              const itemTotal = price * count;
              const image = getItemImage(item);
              const title = getItemTitle(item);
              const currency = item.currency || item.product?.currency || "$";
              const isFavorite = favoriteProductIds.has(String(productId));

              return (
                <div
                  key={itemId}
                  className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center"
                >
                  {/* Product Image */}
                  <div className="relative h-32 w-full flex-shrink-0 sm:h-24 sm:w-24">
                    <Link
                      href={`/products/${
                        item.productId ||
                        item.product?._id ||
                        item.product?.id ||
                        itemId
                      }`}
                      className="relative block h-full w-full"
                    >
                      <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, 96px"
                        className="rounded-md object-cover"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(String(productId))}
                      className={`absolute right-2 top-2 rounded-full bg-white p-2 shadow-md transition ${
                        isFavorite
                          ? "bg-red-50 text-red-600"
                          : "hover:bg-red-50 hover:text-red-600"
                      }`}
                      aria-label={
                        isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <Heart
                        fill={isFavorite ? "currentColor" : "none"}
                        className={`h-5 w-5 ${
                          isFavorite ? "text-red-600" : "text-gray-600"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-1 flex-col gap-2">
                    <Link
                      href={`/products/${
                        item.productId ||
                        item.product?._id ||
                        item.product?.id ||
                        itemId
                      }`}
                      className="text-lg font-semibold hover:text-[#db4444]"
                    >
                      {title}
                    </Link>
                    <p className="text-sm text-gray-600">
                      {currency} {price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-full border border-gray-300">
                      <button
                        type="button"
                        onClick={() => handleUpdateCount(itemId, count - 1)}
                        disabled={count <= 1}
                        className="flex h-10 w-10 items-center justify-center text-gray-600 hover:text-[#db4444] disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="flex h-10 w-12 items-center justify-center text-base font-semibold">
                        {count}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateCount(itemId, count + 1)}
                        className="flex h-10 w-10 items-center justify-center text-gray-600 hover:text-[#db4444]"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="min-w-[100px] text-right">
                      <p className="text-lg font-semibold">
                        {currency} {itemTotal.toFixed(2)}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(itemId)}
                      className="rounded-md p-2 text-red-600 hover:bg-red-50"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-80">
          <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Order Summary</h2>

            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            </div>

            <div className="mb-6 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button className="w-full rounded-md bg-[#db4444] py-3 text-white font-semibold hover:bg-[#c13a3a] transition">
              Proceed to Checkout
            </button>

            <Link
              href="/"
              className="mt-4 block text-center text-sm text-[#db4444] hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
