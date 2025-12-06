"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showRegistered, setShowRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("registered") === "true") {
        setShowRegistered(true);
      }
    } catch (e) {}
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const baseUrl = "https://ilkinibadov.com/api/v1";

    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        const text = await response.text();
        throw new Error(text || "Failed to login");
      }

      if (response.ok || data.success === true) {
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
        }
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        router.push("/");
        return;
      }

      const errorMessage =
        data.message ||
        data.error ||
        (Array.isArray(data.errors)
          ? data.errors
              .map((e: { message?: string } | string) =>
                typeof e === "string" ? e : e.message || "Validation error"
              )
              .join(", ")
          : null) ||
        "Failed to login. Please check your credentials and try again.";

      throw new Error(errorMessage);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center px-4 pb-10 pt-4 text-[#1a1a1a] md:pt-4">
      <div className="mx-auto grid w-full max-w-5xl gap-6 rounded-md bg-white shadow-[0_25px_65px_rgba(0,0,0,0.12)] md:grid-cols-[1.05fr_1fr]">
        <div className="relative min-h-[260px] rounded-t-md md:rounded-l-md md:rounded-tr-none">
          <Image
            src="/signupimg.jpg"
            alt="Shopping cart with smartphone"
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            className="rounded-t-md object-cover md:rounded-l-md md:rounded-tr-none"
            priority
          />
        </div>

        <div className="space-y-8 px-8 py-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Log in to Exclusive
            </h1>
            <p className="text-sm text-[#6a6a6a]">Enter your details below</p>
          </div>

          {showRegistered && (
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-600">
              Account created successfully! Please log in.
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="block text-sm">
              <span className="sr-only">Email</span>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-b border-[#dcdcdc] pb-2 text-base text-[#4f4f4f] placeholder:text-[#b0b0b0] focus:border-[#db4444] focus:outline-none"
                required
              />
            </label>

            <label className="block text-sm">
              <span className="sr-only">Password</span>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border-b border-[#dcdcdc] pb-2 text-base text-[#4f4f4f] placeholder:text-[#b0b0b0] focus:border-[#db4444] focus:outline-none"
                required
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-[#db4444] py-3 text-sm font-semibold text-white transition hover:bg-[#c13a3a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-[#6a6a6a]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#1a1a1a] underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
