"use client";

import Link from "next/link";
import { buttonVariants } from "../ui/button";
import ThemeToggle from "./theme-toggle";
import { FanIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "./user-avatar";

export default function Navbar() {
  const navLinks = [
    { id: 1, name: "Home", href: "/home" },
    { id: 2, name: "About", href: "/about" },
    { id: 3, name: "Contact", href: "/contact" },
  ];

  const link = navLinks.map((navLink) => (
    <li key={navLink.id}>
      <Link
        className={cn(
          buttonVariants({ variant: "link" }),
          "text-xl font-bold text-blue-700 transition-all duration-300 hover:text-white hover:no-underline hover:text-shadow-blue-500 hover:text-shadow-xs",
        )}
        href={navLink.href}
      >
        {navLink.name}
      </Link>
    </li>
  ));
  return (
    <div className="fixed top-0 container flex w-full items-center justify-between border bg-blue-300 px-5 py-3 shadow-md backdrop-blur-3xl">
      <Link href={"/"} className="group cursor-pointer">
        <FanIcon className="group-hover:animate-spin group-hover:text-blue-700 group-hover:transition-all group-hover:duration-300" />
      </Link>
      <nav>
        <ul className="hidden gap-x-4 text-xl font-bold sm:flex">{link}</ul>
      </nav>
      <div className="flex">
        <UserAvatar />
        <ThemeToggle />
      </div>
    </div>
  );
}
