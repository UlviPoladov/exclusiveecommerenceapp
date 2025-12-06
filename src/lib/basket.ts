"use client";

import { getAccessToken, refreshAccessToken } from "./auth";

const BASKET_COUNT_KEY = "basketCount";
const BASKET_UPDATED_EVENT = "basketUpdated";

type BasketItem = {
  count?: number;
  quantity?: number;
};

export async function BasketCountFromAPI(): Promise<number> {
  const baseUrl = "https://ilkinibadov.com/api/v1";

  const accessToken = getAccessToken();
  if (!accessToken) {
    return 0;
  }

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
        return 0;
      }
    }

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();

    const items = Array.isArray(data) ? data : data.content || [];
    const totalCount = items.reduce((sum: number, item: BasketItem) => {
      return sum + (item.count || item.quantity || 1);
    }, 0);

    setBasketCount(totalCount);

    return totalCount;
  } catch (error) {
    console.error("Failed to fetch basket count:", error);
    return 0;
  }
}

export function getBasketCount(): number {
  if (typeof window === "undefined") return 0;
  const count = localStorage.getItem(BASKET_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

export function incBasketCount(amount: number = 1) {
  if (typeof window === "undefined") return;
  const currentCount = getBasketCount();
  const newCount = currentCount + amount;
  localStorage.setItem(BASKET_COUNT_KEY, newCount.toString());

  window.dispatchEvent(
    new CustomEvent(BASKET_UPDATED_EVENT, {
      detail: { count: newCount },
    })
  );
}

export function setBasketCount(count: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BASKET_COUNT_KEY, count.toString());

  window.dispatchEvent(
    new CustomEvent(BASKET_UPDATED_EVENT, {
      detail: { count },
    })
  );
}

export function clearBasketCount() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BASKET_COUNT_KEY);
  window.dispatchEvent(
    new CustomEvent(BASKET_UPDATED_EVENT, {
      detail: { count: 0 },
    })
  );
}

export function subscribeToUpdates(callback: (count: number) => void) {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ count: number }>;
    callback(customEvent.detail.count);
  };

  window.addEventListener(BASKET_UPDATED_EVENT, handler);

  return () => {
    window.removeEventListener(BASKET_UPDATED_EVENT, handler);
  };
}

export async function updateBasketItemCount(
  itemId: string,
  count: number
): Promise<boolean> {
  const baseUrl = "https://ilkinibadov.com/api/v1";

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  try {
    let response = await fetch(`${baseUrl}/basket/update/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        basketItemId: itemId,
        newCount: count,
      }),
    });

    if (response.status === 401) {
      const newToken = await refreshAccessToken();

      if (newToken) {
        response = await fetch(`${baseUrl}/basket/update/${itemId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
          },
          body: JSON.stringify({
            count: count,
          }),
        });
      } else {
        throw new Error("Failed to refresh token");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || errorData.error || "Failed to update basket item"
      );
    }

    await BasketCountFromAPI();

    return true;
  } catch (error) {
    console.error("Failed to update basket item:", error);
    throw error;
  }
}

export async function deleteBasketItem(itemId: string): Promise<boolean> {
  const baseUrl = "https://ilkinibadov.com/api/v1";

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  try {
    let response = await fetch(`${baseUrl}/basket/delete/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      const newToken = await refreshAccessToken();

      if (newToken) {
        response = await fetch(`${baseUrl}/basket/delete/${itemId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });
      } else {
        throw new Error("Failed to refresh token");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || errorData.error || "Failed to delete basket item"
      );
    }

    await BasketCountFromAPI();

    return true;
  } catch (error) {
    console.error("Failed to delete basket item:", error);
    throw error;
  }
}
