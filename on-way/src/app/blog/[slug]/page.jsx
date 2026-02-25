
"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import BlogCard from "@/app/components/BlogCard";
import { Calendar, Clock, ArrowLeft, Share2, Bookmark } from "lucide-react";

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
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-zinc-400">Loading Story...</p>
      </div>
    </div>
  );
  
  if (!blog) return <div className="p-20 text-center font-bold">Blog not found</div>;

  const relatedPosts = allBlogs
    .filter((b) => b.category === blog.category && (b.slug !== slug && b._id !== slug))
    .slice(0, 3);

  const displayDate = blog.publishedAt 
    ? new Date(blog.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : "Recently Published";

  return (
    <article className="min-h-screen ">
      <div className="container mx-auto flex flex-col lg:flex-row min-h-screen relative">
        
        {/* Left Side: Professional Sticky Image Section */}
        <div className="w-full lg:w-1/2 lg:sticky lg:top-0 lg:h-screen p-4 lg:p-10">
          <div className="relative h-100 lg:h-full w-full overflow-hidden rounded-2xl lg:rounded-2xl shadow-2xl group">
            <img
              src={blog.featuredImage || "https://placehold.co/1200x800?text=OnWay+Blog"}
              alt={blog.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Overlay Back Button */}
            <Link 
              href="/blog"
              className="absolute top-6 left-6 bg-white/90 backdrop-blur-md p-3 rounded-2xl text-black hover:bg-primary/40 transition-all shadow-lg group/btn"
            >
              <ArrowLeft className="w-5 h-5 group-hover/btn:-translate-x-1 transition-transform" />
            </Link>

            <div className="absolute bottom-10 left-10 right-10">
              <span className="bg-primary/80 text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block shadow-lg">
                {blog.category}
              </span>
              <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-md">
                {blog.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Content Section */}
        <div className="w-full lg:w-1/2 bg-white lg:rounded-l-[4rem] shadow-[-20px_0px_60px_-15px_rgba(0,0,0,0.05)] z-10 px-6 py-12 lg:px-20 lg:py-24">
          
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-6 mb-12 pb-8 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                {blog.author?.[0] || "O"}
              </div>
              <div>
                <p className="text-sm font-black text-zinc-900">{blog.author || "OnWay Team"}</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Author</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{displayDate}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{blog.readTime || "5 min read"}</span>
            </div>
          </div>

          {/* Main Article Content */}
          <div className="prose prose-zinc lg:prose-xl max-w-none prose-headings:font-black prose-p:leading-[1.8] prose-p:text-zinc-600">
            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-2xl font-bold text-zinc-900 leading-relaxed mb-10 border-l-4 border-primary pl-6 py-2 italic bg-zinc-50 rounded-r-2xl">
                {blog.excerpt}
              </p>
            )}

            {/* Content Body */}
            <div 
               className="blog-body-content text-lg"
               dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Tags */}
          {blog.tags && (
            <div className="mt-16 flex flex-wrap gap-2">
              {blog.tags.map((tag, i) => (
                <span key={i} className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-xl text-xs font-bold hover:bg-primary hover:text-black transition-all cursor-pointer">
                  #{tag.toUpperCase()}
                </span>
              ))}
            </div>
          )}

          {/* Share/Actions */}
          <div className="mt-12 flex items-center gap-4">
             <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:bg-primary hover:text-black transition-all">
                <Share2 className="w-4 h-4" /> Share Story
             </button>
             <button className="p-3 bg-zinc-100 text-zinc-600 rounded-2xl hover:bg-zinc-200 transition-all">
                <Bookmark className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>

      {/* Footer Related Posts (Full Width) */}
      {relatedPosts.length > 0 && (
        <section className="py-5 bg-white border-t border-zinc-100">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-4xl font-black text-zinc-900 tracking-tight">Next for you</h2>
                <p className="text-zinc-500 mt-4 font-medium">Stories you might have missed</p>
              </div>
              <Link href="/blog" className="px-6 py-3 hover:underline rounded-2xl font-bold text-zinc-900 transition-all">
                See all updates
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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