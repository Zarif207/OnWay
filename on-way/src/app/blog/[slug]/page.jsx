"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import blogData from "../../../../public/blogs.json";
import BlogCard from "@/app/components/BlogCard";


export default function BlogDetails() {
  const { slug } = useParams();
  const [scrollProgress, setScrollProgress] = useState(0);


  const blog = blogData.find((b) => b.slug === slug);


  useEffect(() => {
    const updateScroll = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((currentScroll / scrollHeight) * 100);
    };
    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);


  if (!blog) return <div className="p-20 text-center font-bold">Loading...</div>;


  const relatedPosts = blogData
    .filter((b) => b.category === blog.category && b.slug !== slug)
    .slice(0, 3);


  return (
    <article className=" min-h-screen">
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1.5 bg-primary z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />


      {/* Header Section: Pathao Style Clean Background */}
      <header className="p-10">
        <div className="container mx-auto px-2 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-8 uppercase tracking-[0.2em] hover:-translate-x-1 transition-transform"
          >
            ← Back to Updates
          </Link>


          <div className="flex justify-center mb-6">
            <span className="bg-primary/10 text-primary px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              {blog.category}
            </span>
          </div>


          <h1 className="text-2xl md:text-4xl font-black leading-tight text-neutral mb-10 tracking-tight">
            {blog.title.length > 50 ? blog.title.slice(0, 50) + "..." : blog.title}
          </h1>


          <div className="flex items-center justify-center gap-8 border-t border-gray-200 pt-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                {blog.author[0]}
              </div>
              <div className="text-left">
                <p className="text-neutral font-bold leading-none">{blog.author}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">Editorial Team</p>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
            <div className="text-left hidden sm:block">
              <p className="text-xs text-gray-400 uppercase font-bold">Published</p>
              <p className="text-sm font-bold text-neutral">{blog.publishedAt}</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-400 uppercase font-bold">Read Time</p>
              <p className="text-sm font-bold text-neutral">{blog.readTime}</p>
            </div>
          </div>
        </div>
      </header>


      {/* Hero Image with Negative Margin */}
      <div className="container mx-auto px-4 -mt-4 max-w-6xl">
        <img
          src={blog.featuredImage}
          alt={blog.title}
          className="w-full h-87.5 md:h-150 object-cover rounded-[2.5rem] shadow-xl border-12 border-white"
        />
      </div>


      {/* Main Content Area */}
      <div className="container mx-auto px-4 max-w-3xl py-20">
        <div className="prose prose-zinc lg:prose-xl max-w-none">
          {/* Leading Excerpt */}
          <p className="text-2xl md:text-3xl font-bold text-neutral/90 leading-relaxed mb-12 border-l-8 border-primary pl-8 py-2 italic">
            {blog.excerpt}
          </p>


          {/* Main Body Text */}
          <div className="text-gray-700 leading-loose space-y-8 text-xl font-normal">
            {blog.content}
          </div>
        </div>


        {/* Tags Section */}
        <div className="mt-16 pt-10 border-t border-gray-100 flex flex-wrap gap-3">
          {blog.tags.map((tag, i) => (
            <span key={i} className="px-6 py-2.5 bg-[#f8fafc] text-neutral border border-gray-100 rounded-xl text-sm font-black hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer shadow-sm">
              #{tag.toUpperCase()}
            </span>
          ))}
        </div>


        {/* Author Bio Card */}
        <div className="mt-20 p-10 bg-secondary rounded-4xl text-white flex items-center gap-8">
          <div className="w-24 h-24 bg-primary rounded-2xl rotate-3 shrink-0 flex items-center justify-center text-4xl font-black">
            {blog.author[0]}
          </div>
          <div>
            <h4 className="text-2xl font-black mb-2">Written by {blog.author}</h4>
            <p className="text-gray-400 leading-relaxed">
              Building the future of urban mobility at OnWay. Dedicated to providing insights into smart transportation and sustainable city living.
            </p>
          </div>
        </div>
      </div>


      {/* Related Content: Uber Style Grid */}
      {relatedPosts.length > 0 && (
        <section className=" py-10 border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black text-neutral">Keep Reading</h2>
                <p className="text-gray-500 mt-2 font-medium">Handpicked stories for you</p>
              </div>
              <Link href="/blog" className="hidden md:block font-black text-primary border-b-2 border-primary pb-1">
                View all posts
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {relatedPosts.map((post) => (
                <BlogCard key={post.id} blog={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

