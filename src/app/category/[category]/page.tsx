import Image from "next/image";
import Link from "next/link";
import AddToBasketButton from "../../_components/AddBasket";

type ProductApi = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  price?: number | string;
  currency?: string;
  amount?: number | string;
  images?: string[];
  image?: string;
  imageUrl?: string;
  thumbnail?: string;
};

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
};

function productNormalize(raw: ProductApi, index: number): Product {
  const theRawPrice = raw.price ?? raw.amount;
  const pPrice =
    typeof theRawPrice === "number"
      ? theRawPrice
      : theRawPrice
      ? Number.parseFloat(String(theRawPrice))
      : 0;

  const image =
    raw.images?.[0] ??
    raw.image ??
    raw.imageUrl ??
    raw.thumbnail ??
    "/products/gamepad.jpg";

  return {
    id: String(raw._id ?? raw.id ?? `product-${index}`),
    title: raw.title ?? raw.name ?? "Unknown Product",
    price: pPrice && Number.isFinite(pPrice) ? pPrice : 0,
    image: image,
  };
}

async function getCategoryProducts(category: string): Promise<Product[]> {
  const baseUrl = "https://ilkinibadov.com/api/v1";

  try {
    const response = await fetch(`${baseUrl}/products/category/${category}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch category products");
    }

    const data: ProductApi[] = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item, index) => productNormalize(item, index));
  } catch (error) {
    console.error("Error fetching category products:", error);
    return [];
  }
}

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="h-7 w-1 rounded-full bg-[#db4444]" />
        <p className="text-sm font-medium text-[#db4444]">{label}</p>
      </div>
      <h2 className="text-2xl font-semibold text-[#1a1a1a]">{title}</h2>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  beauty: "Beauty",
  electronics: "Electronics",
  clothing: "Clothing",
  books: "Books",
  furniture: "Furniture",
  toys: "Toys",
  groceries: "Groceries",
  sports: "Sports",
  automotive: "Automotive",
  other: "Other",
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const products = await getCategoryProducts(category);
  const categoryLabel = CATEGORY_LABELS[category] || category;

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a]">
      <main id="main" className="mx-auto bg-white">
        <section className="space-y-8 px-6 md:px-20 py-12">
          <SectionHeading
            label={categoryLabel}
            title={`${categoryLabel} Products`}
          />

          {products.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg text-[#6a6a6a]">
                No products found in this category.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-md bg-[#db4444] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#c13a3a]"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 px-0 md:grid-cols-2 lg:grid-cols-4 md:px-0">
              {products.map((product) => (
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
                        className="object-cover"
                      />
                    </Link>
                    <AddToBasketButton productId={product.id} variant="hover">
                      Add to basket
                    </AddToBasketButton>
                  </div>
                  <AddToBasketButton productId={product.id} variant="mobile">
                    Add to basket
                  </AddToBasketButton>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-base font-medium hover:text-[#db4444]"
                    >
                      {product.title}
                    </Link>
                    <p className="text-lg font-semibold text-[#db4444]">
                      {formatter.format(product.price)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
