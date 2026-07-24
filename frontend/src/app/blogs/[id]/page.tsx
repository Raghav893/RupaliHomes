"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchBlogById, API_URL } from "@/lib/api";
import { Blog } from "@/types";
import { Calendar, User, ArrowLeft, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      async function loadBlog() {
        try {
          const data = await fetchBlogById(Number(id));
          setBlog(data);
        } catch (error) {
          console.error("Failed to load blog", error);
        } finally {
          setLoading(false);
        }
      }
      loadBlog();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
        <h1 className="text-4xl font-syne font-bold text-accent-dark mb-4">
          Blog Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The article you are looking for does not exist.
        </p>
        <Link
          href="/blogs"
          className="px-6 py-3 bg-accent-dark text-white rounded-lg hover:bg-gold transition-colors"
        >
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Blog Header Image */}
      <div className="relative h-[60vh] min-h-[400px] w-full mt-20">
        {blog.imageType ? (
          <Image
            src={`${API_URL}/blogs/${blog.id}/image`}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200"></div>
        )}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-4xl mx-auto text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex flex-wrap gap-4 text-sm font-medium uppercase tracking-wider"
          >
            <span className="bg-gold text-white px-3 py-1 rounded-full">
              {blog.category}
            </span>
            <span className="flex items-center gap-2">
              <Calendar size={16} />{" "}
              {new Date(blog.createdAt || Date.now()).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <User size={16} /> {blog.author}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-syne leading-tight"
          >
            {blog.title}
          </motion.h1>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-6 py-20 print:py-0 print:px-0">
        <div className="flex items-center justify-between mb-10 print:hidden">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-accent-dark transition-colors"
          >
            <ArrowLeft size={18} /> Back to Journal
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:text-gold hover:border-gold transition-colors"
          >
            <Download size={16} /> Download PDF
          </button>
        </div>

        <div className="prose prose-lg prose-headings:font-syne prose-headings:text-accent-dark prose-p:text-gray-600 prose-a:text-gold prose-img:rounded-2xl max-w-none">
          {/* 
               In a real app, this would likely be rendered from Markdown or HTML. 
               For now, we just display the text properly with line breaks.
            */}
          {blog.content.split("\n").map((paragraph, idx) => (
            <p key={idx} className="mb-6 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      <Footer />
    </main>
  );
}
