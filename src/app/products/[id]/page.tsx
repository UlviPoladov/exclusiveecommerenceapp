import Image from "next/image";
import Link from "next/link";
import { RefreshCcw, Truck } from "lucide-react";
import ProductImageGallery from "./_components/ProductImageGallery";
import ProductActions from "./_components/ProductActions";

type ApiProductDetail = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  price?: number | string;
  currency?: string;
  description?: string;
  category?: string;
  stock?: number;
  images?: string[];
  image?: string;
  imageUrl?: string;
  thumbnail?: string;
};

type ProductDetail = {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  status: string;
  gallery: string[];
};

type RelatedItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  highlight?: boolean;
};

function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "$" ? "USD" : currency,
    maximumFractionDigits: 2,
  }).format(price);
}

const FALLBACK_PRODUCT: ProductDetail = {
  id: "gamepad",
  name: "Havic HV G-92 Gamepad",
  price: 192,
  currency: "USD",
  description:
    "PlayStation 5 controller skin. High quality vinyl with air channel adhesive for easy bubble-free install and mess-free removal. Pressure sensitive and scratch resistant.",
  status: "In Stock",
  gallery: [
    "/products/controller-1.jpg",
    "/products/controller-2.jpg",
    "/products/controller-3.jpg",
    "/products/controller-4.jpg",
  ],
};

function normalizeProductDetail(raw: ApiProductDetail): ProductDetail {
  if (!raw) {
    return FALLBACK_PRODUCT;
  }
  const rawPrice = raw.price;
  const parsedPrice =
    typeof rawPrice === "number"
      ? rawPrice
      : rawPrice
      ? Number.parseFloat(String(rawPrice))
      : FALLBACK_PRODUCT.price;

  const images =
    raw.images && raw.images.length > 0
      ? raw.images
      : raw.image
      ? [raw.image]
      : raw.imageUrl
      ? [raw.imageUrl]
      : raw.thumbnail
      ? [raw.thumbnail]
      : [];
  const hasImages = images.length > 0;

  return {
    id: String(raw._id ?? raw.id ?? "unknown"),
    name: raw.title ?? raw.name ?? FALLBACK_PRODUCT.name,
    price:
      parsedPrice && Number.isFinite(parsedPrice)
        ? parsedPrice
        : FALLBACK_PRODUCT.price,
    currency: raw.currency ?? FALLBACK_PRODUCT.currency,
    description: raw.description ?? FALLBACK_PRODUCT.description,
    status: raw.stock && raw.stock > 0 ? "In Stock" : "Out of Stock",
    gallery: hasImages ? images : FALLBACK_PRODUCT.gallery,
  };
}

async function getProductDetails(id: string): Promise<ProductDetail> {
  const baseUrl = "https://ilkinibadov.com/api/v1";

  try {
    const response = await fetch(`${baseUrl}/products/${id}/details`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to load product details");
    }

    const data: ApiProductDetail = await response.json();
    return normalizeProductDetail(data);
  } catch (error) {
    console.error("Error fetching product details:", error);
    return FALLBACK_PRODUCT;
  }
}

const FALLBACK_RELATED_ITEMS: RelatedItem[] = [
  {
    id: "gamepad-red",
    name: "HAVIT HV-G92 Gamepad",
    price: 120,
    image: "/products/gamepad.jpg",
  },
  {
    id: "keyboard",
    name: "AK-900 Wired Keyboard",
    price: 960,
    image: "/products/keyboard.jpg",
    highlight: true,
  },
  {
    id: "monitor",
    name: "IPS LCD Gaming Monitor",
    price: 370,
    image: "/products/monitor.jpg",
  },
  {
    id: "cooler",
    name: "RGB Liquid CPU Cooler",
    price: 160,
    image: "/products/cooler.jpg",
  },
];

function normalizeRelatedItem(raw: ApiProductDetail): RelatedItem {
  const rawPrice = raw.price;
  const parsedPrice =
    typeof rawPrice === "number"
      ? rawPrice
      : rawPrice
      ? Number.parseFloat(String(rawPrice))
      : 0;

  const image =
    raw.images?.[0] ??
    raw.image ??
    raw.imageUrl ??
    raw.thumbnail ??
    "/products/gamepad.jpg";

  return {
    id: String(raw._id ?? raw.id ?? "unknown"),
    name: raw.title ?? raw.name ?? "Unknown Product",
    price: parsedPrice && Number.isFinite(parsedPrice) ? parsedPrice : 0,
    image: image,
    highlight: false,
  };
}

async function getSimilarProducts(id: string): Promise<RelatedItem[]> {
  const baseUrl = "https://ilkinibadov.com/api/v1";

  try {
    const response = await fetch(`${baseUrl}/products/${id}/similar`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to load similar products");
    }

    const data: ApiProductDetail[] = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return FALLBACK_RELATED_ITEMS;
    }

    const normalized = data.map((item) => normalizeRelatedItem(item));
    return normalized.length > 0 ? normalized : FALLBACK_RELATED_ITEMS;
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return FALLBACK_RELATED_ITEMS;
  }
}

const SHIPPING_OPTIONS = [
  {
    id: "delivery",
    title: "Free Delivery",
    description: "Enter your postal code for Delivery Availability",
    icon: Truck,
  },
  {
    id: "return",
    title: "Return Delivery",
    description: "Free 30 Days Delivery Returns. Details",
    icon: RefreshCcw,
  },
];

export default async function ProductDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, relatedItems] = await Promise.all([
    getProductDetails(id),
    getSimilarProducts(id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[440px_1fr]">
        <ProductImageGallery
          images={product.gallery}
          productName={product.name}
        />

        <div className="space-y-6">
          <div className="space-y-2">
            <p
              className={`text-sm ${
                product.status === "In Stock"
                  ? "text-[#2d8a4d]"
                  : "text-[#db4444]"
              }`}
            >
              {product.status}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold">
              {formatPrice(product.price, product.currency)}
            </p>
          </div>
          <p className="text-sm leading-6 text-[#6a6a6a] whitespace-pre-line">
            {product.description}
          </p>
          <ProductActions productId={product.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            {SHIPPING_OPTIONS.map(({ id, title, description, icon: Icon }) => (
              <div
                key={id}
                className="flex items-start gap-3 rounded-md border border-[#d9d9d9] px-4 py-3"
              >
                <Icon className="mt-1 h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-sm text-[#6a6a6a]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-16 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-7 w-1 rounded-full bg-[#db4444]" />
            <p className="text-sm font-medium text-[#db4444]">Related Items</p>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {relatedItems.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className="rounded-lg border border-[#efefef] p-4 transition hover:border-[#db4444]/50 hover:shadow-md"
            >
              <div className="relative mb-4 h-48 w-full overflow-hidden rounded-md bg-[#f8f8f8]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <p className="text-base font-medium">{item.name}</p>
              <p className="text-lg font-semibold text-[#db4444]">
                {formatPrice(item.price)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
