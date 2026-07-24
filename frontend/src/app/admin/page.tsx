"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  ArrowUpRight,
  FileText,
  Building2,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  fetchAdminProperties,
  fetchAdminBlogs,
  fetchContactSubmissions,
  fetchDashboardStats,
  deleteProperty,
} from "@/lib/api";
import { Property, Blog, Inquiry, DashboardStats } from "@/types";

export default function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [leads, setLeads] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [propertiesRes, blogsRes, leadsRes, dashboardRes] =
        await Promise.all([
          fetchAdminProperties(0, 100),
          fetchAdminBlogs(),
          fetchContactSubmissions(),
          fetchDashboardStats(),
        ]);
      setProperties(propertiesRes.content || []);
      setBlogs(blogsRes || []);
      setLeads(leadsRes || []);
      setStats(dashboardRes);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteProperty = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    setDeletingId(String(id));
    const success = await deleteProperty(id);
    if (success) {
      setProperties((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } else {
      alert("Failed to delete property.");
    }
    setDeletingId(null);
  };

  const soldCount = stats?.totalSoldProperties ?? properties.filter((p) => p.status === "SOLD").length;
  const rentedCount = stats?.totalRentedProperties ?? properties.filter((p) => p.status === "RENTED").length;

  const statCards = [
    {
      title: "Total Properties",
      value: properties.length,
      icon: Building2,
      href: "/admin/projects",
      actionLabel: "Manage Properties",
    },
    {
      title: "Sold Properties",
      value: soldCount,
      icon: TrendingUp,
      href: "/admin/projects?status=SOLD",
      actionLabel: "View Sold",
    },
    {
      title: "Rented Properties",
      value: rentedCount,
      icon: IndianRupee,
      href: "/admin/projects?status=RENTED",
      actionLabel: "View Rented",
    },
    {
      title: "Active Blogs",
      value: blogs.length,
      icon: FileText,
      href: "/admin/blogs",
      actionLabel: "Manage Blogs",
    },
    {
      title: "New Leads",
      value: leads.length,
      icon: Users,
      href: "/admin/leads",
      actionLabel: "View Leads",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-syne text-accent-dark">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Live overview of your content &amp; activity.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            disabled={loading}
            className="shrink-0"
            title="Refresh data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
          <Link href="/admin/projects">
            <Button className="gap-2 bg-accent-dark hover:bg-accent-dark/90 text-white">
              <Plus size={16} /> Add Property
            </Button>
          </Link>
          <Link href="/admin/blogs/new">
            <Button variant="outline" className="gap-2">
              <Plus size={16} /> Add Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump to common tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/admin/projects">
              <Button
                variant="outline"
                className="w-full justify-between group h-12"
              >
                <span className="flex items-center gap-2">
                  <Building2 size={16} /> Add New Property
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
              </Button>
            </Link>
            <Link href="/admin/blogs/new">
              <Button
                variant="outline"
                className="w-full justify-between group h-12"
              >
                <span className="flex items-center gap-2">
                  <FileText size={16} /> Write New Blog
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
              </Button>
            </Link>
            <Link href="/admin/leads">
              <Button
                variant="outline"
                className="w-full justify-between group h-12"
              >
                <span className="flex items-center gap-2">
                  <Users size={16} /> View Inquiries
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
              </Button>
            </Link>
            <Link href="/" target="_blank">
              <Button
                variant="outline"
                className="w-full justify-between group h-12"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink size={16} /> View Live Site
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards - Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-gray-200 hover:border-gray-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100">
                  <stat.icon className="h-4 w-4 text-gray-900" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? (
                    <span className="inline-block w-8 h-8 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-xs text-accent-dark mt-2 font-medium group-hover:underline flex items-center gap-1">
                  {stat.actionLabel}
                  <ArrowUpRight className="h-3 w-3" />
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Properties with Delete */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Properties</CardTitle>
              <CardDescription>
                {properties.length} total properties
              </CardDescription>
            </div>
            <Link href="/admin/projects">
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                View All <ExternalLink size={12} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-gray-50 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Building2 className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No properties yet.</p>
                <Link href="/admin/projects">
                  <Button size="sm" className="mt-3 gap-1">
                    <Plus size={14} /> Add First Property
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {properties.slice(0, 8).map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-accent-dark/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-accent-dark" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {property.title || "Untitled"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {property.location || "—"} • {property.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          property.status === "AVAILABLE"
                            ? "bg-emerald-50 text-emerald-600"
                            : property.status === "SOLD"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {property.status}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          property.id && handleDeleteProperty(property.id)
                        }
                        disabled={deletingId === String(property.id)}
                      >
                        {deletingId === String(property.id) ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Blogs */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Blogs</CardTitle>
              <CardDescription>{blogs.length} total posts</CardDescription>
            </div>
            <Link href="/admin/blogs">
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                View All <ExternalLink size={12} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-gray-50 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No blogs yet.</p>
                <Link href="/admin/blogs/new">
                  <Button size="sm" className="mt-3 gap-1">
                    <Plus size={14} /> Write First Blog
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {blogs.slice(0, 8).map((blog) => (
                  <div
                    key={blog.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {blog.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {blog.author} • {blog.category}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {blog.createdAt
                        ? new Date(blog.createdAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>


    </div>
  );
}
