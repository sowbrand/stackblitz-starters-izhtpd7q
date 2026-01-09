
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/suppliers', label: 'Fornecedores' },
    { href: '/compare', label: 'Comparador' },
    { href: '/manage', label: 'Gerenciar' },
  ];

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
      <Link href="/suppliers" className="font-helvetica text-2xl cursor-pointer">
        <span className="font-normal">Sow</span>
        <span className="font-bold">brand</span>
      </Link>
      <nav>
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "mx-2 sm:mx-4 font-semibold transition-colors duration-200",
              pathname.startsWith(href) ? "text-brand-green" : "text-[#545454] hover:text-black"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
};
