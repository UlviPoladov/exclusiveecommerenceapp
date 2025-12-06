"use client";

import Image from "next/image";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type ProductImageGalleryProps = {
  images: string[];
  productName: string;
};

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  const openModal = (index: number) => {
    setModalIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const navigateModal = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setModalIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      setModalIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        <div className="hidden flex-col gap-4 md:flex">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => handleThumbnailClick(index)}
              className={`relative h-20 w-20 overflow-hidden rounded-md border transition ${
                index === selectedIndex
                  ? "border-[#db4444]"
                  : "border-[#e5e5e5] hover:border-[#db4444]/50"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => openModal(selectedIndex)}
          className="relative h-64 w-full overflow-hidden rounded-md bg-[#f5f5f5] cursor-pointer transition hover:opacity-90 md:h-auto md:flex-1"
        >
          <Image
            src={images[selectedIndex]}
            alt={productName}
            fill
            className="object-contain p-6"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </button>

        <div className="grid grid-cols-4 gap-3 md:hidden">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => handleThumbnailClick(index)}
              className={`relative aspect-square w-full overflow-hidden rounded-md border transition ${
                index === selectedIndex
                  ? "border-[#db4444]"
                  : "border-[#e5e5e5]"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 80px"
              />
            </button>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeModal}
        >
          <button
            type="button"
            onClick={closeModal}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigateModal("prev");
            }}
            className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigateModal("next");
            }}
            className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            className="relative h-full w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[modalIndex]}
              alt={`${productName} - Image ${modalIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalIndex(index);
                }}
                className={`h-2 rounded-full transition ${
                  index === modalIndex ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

