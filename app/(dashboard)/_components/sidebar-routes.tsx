"use client";

import { Brain, Search, BarChart, BookOpen, Zap } from "lucide-react";
import { usePathname } from "next/navigation";

import { SidebarItem } from "./sidebar-item";

const guestRoutes = [
  {
    icon: Brain,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: Search,
    label: "Explorar IA",
    href: "/search",
  },
];

const teacherRoutes = [
  {
    icon: BookOpen,
    label: "Mis Cursos",
    href: "/teacher/courses",
  },
  {
    icon: BarChart,
    label: "Analytics",
    href: "/teacher/analytics",
  },
  {
    icon: Zap,
    label: "IA Tools",
    href: "/teacher/ai-tools",
  },
]

export const SidebarRoutes = () => {
  const pathname = usePathname();

  const isTeacherPage = pathname?.includes("/teacher");

  const routes = isTeacherPage ? teacherRoutes : guestRoutes;

  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
    </div>
  )
}