"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, ChevronRight } from "lucide-react";
import BlogCard from "@/app/root-components/BlogCard";

export default function BlogDetails() {
  const { slug } = useParams();
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs`);
        setAllBlogs(res.data.data || []);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const blog = allBlogs.find((b) => b.slug === slug || b._id === slug);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!blog) return <div className="p-20 text-center font-bold text-gray-400">Blog not found</div>;

  const relatedPosts = allBlogs
    .filter((b) => b.category === blog.category && (b.slug !== slug && b._id !== slug))
    .slice(0, 3);

  const displayDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : "March 14, 2026";

  return (
    <article className="min-h-screen mt-12 px-2 bg-white">
      {/* 1. Main Page Wrapper */}
      <div className="container mx-auto flex flex-col lg:flex-row min-h-screen relative mb-4">

        {/* LEFT SIDE: Content Details (Scrollable) */}
        <div className="w-full lg:w-3/5  lg:px-20  bg-white z-10">

          {/* Back Button & Breadcrumb */}
          <div className="flex items-center gap-4 my-6  group">
            <Link href="/blog" className="p-2 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-all duration-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
              <span>Blog</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-black font-semibold">{blog.category}</span>
            </div>
          </div>

          {/* Title & Header */}
          <div className="mb-12">
            <h1 className="text-4xl lg:text-6xl font-black text-gray-900 leading-[1.1] mb-8">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-8 py-6 border-y border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold">
                  {blog.author?.[0] || "A"}
                </div>
                <span className="font-bold text-gray-900">{blog.author || "OnWay Team"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar className="w-4 h-4" /> {displayDate}
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Clock className="w-4 h-4" /> {blog.readTime || "5 min read"}
              </div>
            </div>
          </div>

          {/* Main Prose Content */}
          <div className="prose prose-zinc lg:prose-xl max-w-none 
            prose-p:text-gray-600 prose-p:leading-[1.9] prose-p:text-[1.15rem]
            prose-headings:text-gray-900 prose-headings:font-black
            prose-strong:text-gray-900">

            {blog.excerpt && (
              <p className="text-2xl font-bold text-gray-900 mb-6 leading-relaxed border-l-4 border-black pl-8 italic bg-gray-50 py-4 rounded-r-2xl">
                {blog.excerpt}
              </p>
            )}

            <div
              className="blog-body-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Tags & Interaction */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags?.map((tag, i) => (
                <span key={i} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-bold hover:scale-105 transition-transform active:scale-95">
                <Share2 className="w-5 h-5" /> Share Article
              </button>
              <button className="p-4 bg-gray-100 text-gray-900 rounded-2xl hover:bg-gray-200 transition-all">
                <Bookmark className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Hero Image (Sticky) */}
        <div className="w-full lg:w-2/5 lg:sticky lg:top-0 lg:h-screen p-4 lg:p-8">
          <div className="relative h-100 lg:h-full w-full overflow-hidden rounded-4xl ">
            <img
              src={blog.featuredImage || "https://placehold.co/1200x800"}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/40"></div>

            {/* Category Tag on Image */}
            <div className="absolute top-10 right-10">
              <span className="bg-white/90 backdrop-blur-md text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                {blog.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-8 ">
          <div className="container mx-auto px-2">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight italic">Recommended</h2>
                <p className="text-gray-500 mt-2">More stories from {blog.category}</p>
              </div>
              <Link href="/blog" className="font-bold text-black border-b-2 border-black pb-1 hover:text-blue-400 hover:border-gray-400 transition">
                Explore All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {relatedPosts.map((post) => (
                <BlogCard key={post._id} blog={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
