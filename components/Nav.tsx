"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "売上管理" },
  { href: "/clients", label: "顧客カルテ" },
  { href: "/tasks", label: "タスク・議事録" },
  { href: "/local-info", label: "近隣情報" },
  { href: "/transactions", label: "取引一覧" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-primary shadow-md">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-3">
        <span className="mr-4 shrink-0 text-lg font-bold tracking-tight text-white">
          GYM MANAGER
        </span>
        <nav className="flex gap-1">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-primary-dark shadow-card"
                    : "text-white/85 hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
