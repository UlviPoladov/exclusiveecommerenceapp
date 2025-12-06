import CategoryProductBrowser from "./_components/CategoryProduc";
import { ArrowUp, Truck, RefreshCcw, PhoneCall } from "lucide-react";
import type { Product } from "@/types/product";

type ApiProduct = {
  id?: string | number;
  _id?: string | number;
  name?: string;
  title?: string;
  price?: number | string;
  amount?: number | string;
  image?: string;
  images?: string[] | string;
  imageUrl?: string;
  thumbnail?: string;
  description?: string;
  category?: string;
};

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "dog-food",
    title: "Breed Dry Dog Food",
    price: 100,
    image: "/products/dog-food.jpg",
    category: "groceries",
  },
  {
    id: "camera",
    title: "CANON EOS DSLR Camera",
    price: 360,
    image: "/products/camera.jpg",
    category: "electronics",
  },
  {
    id: "laptop",
    title: "ASUS FHD Gaming Laptop",
    price: 700,
    image: "/products/laptop.jpg",
    category: "electronics",
  },
  {
    id: "skincare",
    title: "Curology Product Set",
    price: 500,
    image: "/products/skincare.jpg",
    category: "beauty",
  },
  {
    id: "toy-car",
    title: "Kids Electric Car",
    price: 960,
    image: "/products/toy-car.jpg",
    category: "toys",
  },
  {
    id: "cleats",
    title: "Jr. Zoom Soccer Cleats",
    price: 116,
    image: "/products/cleats.jpg",
    category: "sports",
  },
  {
    id: "gamepad",
    title: "GH12 Shooter USB Gamepad",
    price: 660,
    image: "/products/gamepad.jpg",
    category: "electronics",
  },
  {
    id: "jacket",
    title: "Quilted Satin Jacket",
    price: 960,
    image: "/products/jacket.jpg",
    category: "clothing",
  },
];

const FEATURE_CARDS = [
  {
    id: "delivery",
    title: "FREE AND FAST DELIVERY",
    description: "Free delivery for all orders over $50",
    icon: Truck,
  },
  {
    id: "support",
    title: "24/7 CUSTOMER SERVICE",
    description: "Friendly 24/7 customer support",
    icon: PhoneCall,
  },
  {
    id: "guarantee",
    title: "MONEY BACK GUARANTEE",
    description: "We return money within 30 days",
    icon: RefreshCcw,
  },
];

function normalizeProduct(raw: ApiProduct, index: number): Product {
  const fallback = FALLBACK_PRODUCTS[index % FALLBACK_PRODUCTS.length];
  const rawPrice = raw.price ?? raw.amount;
  const parsedPrice =
    typeof rawPrice === "number"
      ? rawPrice
      : rawPrice
      ? Number.parseFloat(rawPrice)
      : undefined;

  const resolvedId = raw.id ?? raw._id ?? `product-${index}`;
  const primaryImage = Array.isArray(raw.images) ? raw.images[0] : raw.images;

  return {
    id: String(resolvedId),
    title: raw.title ?? raw.name ?? fallback.title,
    price:
      parsedPrice && Number.isFinite(parsedPrice)
        ? parsedPrice
        : fallback.price,
    image:
      primaryImage ??
      raw.image ??
      raw.imageUrl ??
      raw.thumbnail ??
      fallback.image,
    category: raw.category ?? fallback.category,
  };
}

type ApiResponse = {
  success?: boolean;
  page?: number;
  totalPages?: number;
  totalProducts?: number;
  products?: ApiProduct[];
};

async function getAllProducts(): Promise<Product[]> {
  const baseUrl = "https://ilkinibadov.com/api/v1";

  try {
    const response = await fetch(`${baseUrl}/products`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to load products");
    }

    const data: ApiResponse | ApiProduct[] = await response.json();

    let productsArray: ApiProduct[] = [];
    if (Array.isArray(data)) {
      productsArray = data;
    } else if (data.products && Array.isArray(data.products)) {
      productsArray = data.products;
    } else {
      return FALLBACK_PRODUCTS;
    }

    const normalized = productsArray.map((item: ApiProduct, index: number) =>
      normalizeProduct(item, index)
    );

    return normalized.length ? normalized : FALLBACK_PRODUCTS;
  } catch (error) {
    console.error(error);
    return FALLBACK_PRODUCTS;
  }
}

export default async function Home() {
  const allProducts = await getAllProducts();

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a]">
      <main id="main" className="mx-auto bg-white">
        <CategoryProductBrowser allProducts={allProducts} />

        <section className="flex flex-wrap items-center justify-between gap-6 px-6 md:px-20 pb-12">
          {FEATURE_CARDS.map(({ id, title, description, icon: Icon }) => (
            <div
              key={id}
              className="flex flex-1 min-w-[240px] flex-col items-center gap-3 rounded-md border border-[#f0f0f0] px-6 py-8 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f5f5]">
                <Icon className="h-6 w-6 text-[#db4444]" />
              </div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-sm text-[#6a6a6a]">{description}</p>
            </div>
          ))}
        </section>
      </main>

      <a
        href="#main"
        className="fixed bottom-8 right-8 flex h-10 w-10 items-center justify-center rounded-full bg-[#db4444] text-white shadow-lg"
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </a>
    </div>
  );
}
