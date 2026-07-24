"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Trash2, Calendar, User } from "lucide-react";
import { fetchAdminBlogs, deleteBlog } from "@/lib/api";
import { Blog } from "@/types";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminBlogs();
      setBlogs(data);
    } catch (error) {
      console.error("Failed to load blogs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      const success = await deleteBlog(id);
      if (success) {
        loadBlogs();
      } else {
        alert("Failed to delete blog");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-syne text-accent-dark">
            Blogs
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your journal entries and articles.
          </p>
        </div>
        <Link href="/admin/blogs/new">
          <Button className="gap-2 bg-accent-dark hover:bg-accent-dark/90 text-white">
            <Plus size={16} /> Add New Blog
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading blogs...
                </TableCell>
              </TableRow>
            ) : blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No blog posts found.
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium text-accent-dark">
                    {blog.title}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                      {blog.category}
                    </span>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    {blog.author}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar size={14} />
                      {new Date(
                        blog.createdAt || Date.now(),
                      ).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => blog.id && handleDelete(blog.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
