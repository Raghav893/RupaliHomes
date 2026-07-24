"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    href: "/admin/projects",
    icon: Building2,
  },
  {
    title: "Blogs",
    href: "/admin/blogs",
    icon: BookOpen,
  },
  {
    title: "Inquiries",
    href: "/admin/leads",
    icon: Users,
  },
  {
    title: "Admins",
    href: "/admin/admins",
    icon: Settings,
  },
];

function AdminContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, pathname, router]);

  // If on login page, render children directly (no sidebar)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-dark"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-20">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-dark text-white rounded-lg flex items-center justify-center font-bold">
            R
          </div>
          <span className="font-syne font-bold text-lg text-accent-dark">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent-dark text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-accent-dark",
                )}
              >
                <item.icon size={18} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-dark text-white rounded-lg flex items-center justify-center font-bold">
              R
            </div>
            <span className="font-syne font-bold text-lg text-accent-dark">
              Admin
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-gray-800/50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="w-64 h-full bg-white shadow-xl p-4 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-8 p-2">
                <span className="font-syne font-bold text-xl text-accent-dark">
                  Menu
                </span>
              </div>
              <nav className="space-y-1 flex-1">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-accent-dark text-white"
                          : "text-gray-600 hover:bg-gray-100",
                      )}
                    >
                      <item.icon size={18} />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
              <Button
                variant="ghost"
                className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50 gap-2 mt-4"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Logout
              </Button>
            </div>
          </div>
        )}

        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminContent>{children}</AdminContent>
    </AdminAuthProvider>
  );
}
