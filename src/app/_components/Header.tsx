"use client";

import { Search, ShoppingCart, UserRound, Clock, Trash2 } from "lucide-react";
import MobileMenu from "./MobileMenu";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect, useRef } from "react";
import { subscribeToUpdates, BasketCountFromAPI } from "@/lib/basket";
import { getAccessToken, refreshAccessToken } from "@/lib/auth";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Contact", href: "#" },
  { label: "About", href: "#" },
  { label: "Sign Up", href: "/signup" },
];

type SearchHistoryItem = {
  id?: string;
  title?: string;
  term?: string;
};

type ApiProduct = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  price?: number | string;
  amount?: number | string;
  image?: string;
  images?: string[];
  imageUrl?: string;
  thumbnail?: string;
};

type ProductSuggestion = {
  id: string;
  title: string;
  price: number;
  image: string;
};

const MAX_SUGGESTIONS = 5;
const SUGGESTION_DEBOUNCE_MS = 300;

export default function HeaderComponent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [basketCount, setBasketCount] = useState(0);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchFormRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchSearchHistory = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return;
    }

    setIsLoadingHistory(true);
    const baseUrl = "https://ilkinibadov.com/api/v1";

    try {
      let response = await fetch(`${baseUrl}/search/history`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        const newToken = await refreshAccessToken();

        if (newToken) {
          response = await fetch(`${baseUrl}/search/history`, {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });
        } else {
          setIsLoadingHistory(false);
          return;
        }
      }

      if (response.ok) {
        const data = await response.json();
        const history = Array.isArray(data)
          ? data
          : data.content || data.history || [];
        setSearchHistory(history);
      }
    } catch (error) {
      console.error("Failed to fetch search history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchSearchSuggestions = async (
    term: string,
    signal: AbortSignal
  ): Promise<ProductSuggestion[]> => {
    const baseUrl = "https://ilkinibadov.com/api/v1";
    const accessToken = getAccessToken();

    const headers: HeadersInit = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    let response = await fetch(
      `${baseUrl}/search?searchterm=${encodeURIComponent(term)}`,
      {
        cache: "no-store",
        headers,
        signal,
      }
    );

    if (response.status === 401 && accessToken) {
      const newToken = await refreshAccessToken();

      if (newToken) {
        response = await fetch(
          `${baseUrl}/search?searchterm=${encodeURIComponent(term)}`,
          {
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
            signal,
          }
        );
      }
    }

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const content: ApiProduct[] = Array.isArray(data)
      ? data
      : data.content || [];

    return content.slice(0, MAX_SUGGESTIONS).map((item, index) => {
      const rawPrice = item.price ?? item.amount;
      const parsedPrice =
        typeof rawPrice === "number"
          ? rawPrice
          : rawPrice
          ? Number.parseFloat(String(rawPrice))
          : 0;

      return {
        id: String(item._id ?? item.id ?? `suggestion-${index}`),
        title: item.title ?? item.name ?? "Unknown Product",
        price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
        image:
          item.image ??
          item.images?.[0] ??
          item.imageUrl ??
          item.thumbnail ??
          "/products/gamepad.jpg",
      };
    });
  };

  useEffect(() => {
    const loadBasketCount = async () => {
      const count = await BasketCountFromAPI();
      setBasketCount(count);
    };

    loadBasketCount();

    const unsubscribe = subscribeToUpdates((count) => {
      setBasketCount(count);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchFormRef.current &&
        !searchFormRef.current.contains(event.target as Node)
      ) {
        setShowHistory(false);
        setSuggestions([]);
      }
    };

    if (showHistory) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHistory]);

  useEffect(() => {
    if (!showHistory) {
      setSuggestions([]);
      return;
    }

    const term = searchTerm.trim();
    if (!term) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    const controller = new AbortController();
    setIsLoadingSuggestions(true);

    const timer = setTimeout(async () => {
      try {
        const nextSuggestions = await fetchSearchSuggestions(
          term,
          controller.signal
        );
        setSuggestions(nextSuggestions);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to load suggestions:", error);
        }
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, SUGGESTION_DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchTerm, showHistory]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowHistory(false);
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleInputFocus = () => {
    setShowHistory(true);
    fetchSearchHistory();
  };

  const handleHistoryClick = (historyItem: SearchHistoryItem) => {
    const term = historyItem.title || "";
    if (term) {
      setSearchTerm(term);
      setShowHistory(false);
      router.push(`/search?q=${encodeURIComponent(term)}`);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    setShowHistory(false);
    router.push(`/products/${productId}`);
  };

  const handleDeleteHistory = async (
    e: React.MouseEvent,
    historyId: string
  ) => {
    e.stopPropagation();

    const accessToken = getAccessToken();
    if (!accessToken) {
      return;
    }

    const baseUrl = "https://ilkinibadov.com/api/v1";

    try {
      let response = await fetch(`${baseUrl}/search/history/${historyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        const newToken = await refreshAccessToken();

        if (newToken) {
          response = await fetch(`${baseUrl}/search/history/${historyId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });
        } else {
          return;
        }
      }

      if (response.ok) {
        setSearchHistory((prev) =>
          prev.filter((item) => item.id !== historyId)
        );
      }
    } catch (error) {
      console.error("Failed to delete search history:", error);
    }
  };

  return (
    <header className="flex flex-wrap items-center gap-4 border-b border-[#efefef] px-6 py-6 sm:px-12 lg:px-20">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-2xl font-bold">
          {" "}
          Exclusive{" "}
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <form
          ref={searchFormRef}
          onSubmit={handleSearch}
          className="relative hidden md:block"
        >
          <input
            ref={searchInputRef}
            type="text"
            placeholder="What are you looking for?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            className="h-11 w-72 rounded-full border border-transparent bg-[#f5f5f5] pl-5 pr-12 text-sm text-[#4f4f4f] focus:border-[#db4444] focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4f4f4f] hover:text-[#db4444] transition"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {showHistory && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {searchTerm.trim() ? (
                isLoadingSuggestions ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#db4444] border-t-transparent"></div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {suggestions.map((product) => (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick(product.id)}
                          className="cursor-pointer flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-200 transition"
                        >
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-[#f5f5f5]">
                            <Image
                              src={product.image}
                              alt={product.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-1 flex-col">
                            <span className="text-sm font-medium text-gray-800 truncate">
                              {product.title}
                            </span>
                            <span className="text-xs font-semibold text-[#db4444]">
                              {PRICE_FORMATTER.format(product.price)}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    No products found
                  </div>
                )
              ) : isLoadingHistory ? (
                <div className="flex items-center justify-center p-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#db4444] border-t-transparent"></div>
                </div>
              ) : searchHistory.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Recent Searches
                  </div>
                  {searchHistory.map((item, index) => {
                    if (!item.id) return null;
                    return (
                      <div
                        key={item.id || index}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleHistoryClick(item)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleHistoryClick(item);
                          }
                        }}
                        className="group flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                      >
                        <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="flex-1 truncate">{item.title}</span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteHistory(e, item.id!)}
                          className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition"
                          aria-label="Delete search history"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No search history
                </div>
              )}
            </div>
          )}
        </form>
        <Link
          href="/basket"
          className="relative rounded-full border border-[#ededed] p-2 text-[#4f4f4f] hover:cursor-pointer hover:border-[#db4444] hover:text-[#db4444]"
          aria-label="Open cart"
        >
          <ShoppingCart className="h-5 w-5" />
          {basketCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#db4444] px-1 text-[10px] font-semibold text-white">
              {basketCount > 99 ? "99+" : basketCount}
            </span>
          )}
        </Link>
        <Link
          href="/profile"
          className="rounded-full border border-[#ededed] p-2 text-[#4f4f4f] hover:cursor-pointer hover:border-[#db4444] hover:text-[#db4444]"
          aria-label="Profile"
        >
          <UserRound className="h-5 w-5" />
        </Link>
        <MobileMenu links={NAV_LINKS} />
      </div>
    </header>
  );
}
