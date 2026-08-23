import Link from "next/link";
import SantaLogo from "./SantaLogo";

export default function Footer() {
  return (
    <footer className="mt-16 hidden border-t border-fuchsia-100/60 bg-white/50 md:block">
      <div className="mx-auto max-w-7xl px-8 py-10 text-sm text-slate-500">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <p className="flex items-center gap-1.5 text-lg font-extrabold text-fuchsia-600">
              <SantaLogo className="h-7 w-7 animate-santa-peek" />
              Santa<span className="text-slate-900">Claus</span>
            </p>
            <p className="mt-2 max-w-xs">Clothes and toys made for little adventurers, delivered anywhere in Bangladesh.</p>
          </div>
          <div className="flex gap-16">
            <div>
              <p className="mb-2 font-semibold text-slate-700">Shop</p>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/shop" className="hover:text-fuchsia-600">
                    All products
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-fuchsia-600">
                    Categories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-semibold text-slate-700">Account</p>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/account" className="hover:text-fuchsia-600">
                    My orders
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-fuchsia-600">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-slate-400">© {new Date().getFullYear()} Santa Claus. All rights reserved.</p>
        <p className="mt-1 text-xs text-slate-400">
          Powered by{" "}
          <a
            href="https://algocraftsoftware.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-500 hover:text-fuchsia-600"
          >
            Algo Craft Software LTD
          </a>
        </p>
      </div>
    </footer>
  );
}
