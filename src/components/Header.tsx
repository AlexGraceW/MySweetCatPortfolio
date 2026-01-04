"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "About", exact: true },
  { href: "/works", label: "My Works" },
  { href: "/contacts", label: "Contact" }
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" style={{ fontWeight: 700, letterSpacing: 0.2 }}>
          Portfolio
        </Link>

        <nav className="nav">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "btn btn-primary" : "btn"}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
