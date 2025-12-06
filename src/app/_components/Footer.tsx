"use client";

import Link from "next/link";
import Image from "next/image";

import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ArrowRight,
} from "lucide-react";

const SOCIAL_LINKS = [
  { id: "facebook", icon: Facebook, href: "https://facebook.com" },
  { id: "twitter", icon: Twitter, href: "https://twitter.com" },
  { id: "instagram", icon: Instagram, href: "https://instagram.com" },
  { id: "youtube", icon: Youtube, href: "https://youtube.com" },
];

export default function FooterComponent() {
  return (
    <footer className="bg-[#0c0c0c] px-6 md:px-20 py-12 text-white text-center lg:text-left">
      <div className="grid gap-10 justify-items-center lg:grid-cols-[1.2fr_repeat(3,1fr)_1.2fr] lg:justify-items-start">
        <div className="space-y-4 w-full max-w-xs">
          <p className="text-2xl font-semibold">Exclusive</p>
          <p className="text-sm text-[#d4d4d4]">Get 10% off your first order</p>
          <div className="flex items-center rounded-md border border-white/30 px-3 py-1">
            <input
              className="h-11 flex-1 bg-transparent pr-3 text-sm text-white placeholder:text-white/60 focus:outline-none"
              placeholder="Enter your email"
            />
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-2 text-sm w-full max-w-xs">
          <p className="mb-3 text-base font-semibold">Support</p>
          <p>adress.adress.adress</p>
          <p>adress.adress.adress.</p>
          <p>important@gmail.com</p>
          <p>+9999999999</p>
        </div>

        <div className="space-y-2 text-sm w-full max-w-xs">
          <p className="mb-3 text-base font-semibold">Account</p>
          <p>My Account</p>
          <p>Login / Register</p>
          <p>Basket</p>
        </div>

        <div className="space-y-2 text-sm w-full max-w-xs">
          <p className="mb-3 text-base font-semibold">Quick Link</p>
          <p>Privacy Policy</p>
          <p>Terms Of Use</p>
        </div>

        <div className="space-y-4 w-full max-w-xs">
          <p className="text-base font-semibold">Download App</p>
          <p className="text-xs text-[#d4d4d4]">
            Save $3 with App New User Only
          </p>
          <div className="flex items-center justify-center gap-4 sm:justify-start">
            <Image src="/qr.png" alt="Download QR" width={96} height={96} />
            <div className="space-y-2 text-sm font-semibold w-32">
              <div
                className="flex h-10 w-full rounded-md border border-white/30 items-center justify-center bg-center bg-no-repeat"
                style={{
                  backgroundImage: "url('/PlayMarket.png')",
                  backgroundSize: "contain",
                }}
              ></div>
              <div
                className="flex h-10 w-full rounded-md border border-white/30 items-center justify-center bg-center bg-no-repeat"
                style={{
                  backgroundImage: "url('/AppStore.png')",
                  backgroundSize: "contain",
                }}
              ></div>
            </div>
          </div>
          <div className="flex justify-center gap-3 pt-1 lg:justify-start">
            {SOCIAL_LINKS.map(({ id, icon: Icon, href }) => (
              <Link
                key={id}
                href={href}
                className="p-2 rounded-full text-white transition hover:border-white hover:bg-white hover:text-[#0c0c0c]"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-white/60">
        © Copyright Rimel 2022. All right reserved
      </p>
    </footer>
  );
}
