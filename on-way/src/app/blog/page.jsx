"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { Search, X, Frown, Clock, Calendar, TrendingUp, BookOpen, ChevronRight } from "lucide-react";
import ScrollProgress from "../components/ScrollProgress";
import BlogCard from "../root-components/BlogCard";

// ─── Breaking news marquee ─────────────────────────────────────────────────────
function BreakingMarquee({ posts }) {
  const items = posts.length
    ? posts.map((p) => `📰 ${p.title}`)
    : ["🚗 New ride pricing update released", "📍 New routes launched in Sylhet", "🎉 Driver incentives increased this month"];

  const text = items.join("   ·   ");

  return (
    <div className="bg-[#011421] border-b border-white/5 flex items-stretch overflow-hidden">
      <div className="shrink-0 bg-[#2FCA71] px-4 flex items-center">
        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">Breaking</span>
      </div>
      <div className="flex-1 overflow-hidden py-2.5 px-4">
        <div className="marquee-track whitespace-nowrap text-gray-300 text-xs font-medium">
          <span>{text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Category nav ──────────────────────────────────────────────────────────────
const DEFAULT_CATS = ["All", "Trending", "Technology", "Pricing", "Drivers", "Community", "Support"];

function CategoryNav({ categories, active, onChange }) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className={`shrink-0 px-5 py-3.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all duration-200 ${
                active === cat
                  ? "border-[#2FCA71] text-[#2FCA71]"
                  : "border-transparent text-gray-500 hover:text-[#011421] hover:border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Featured hero post ────────────────────────────────────────────────────────
function FeaturedPost({ post }) {
  if (!post) return null;
  const href = `/blog/${post.slug || post._id}`;
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "Recent";

  return (
    <Link href={href} className="group relative block rounded-2xl overflow-hidden h-[420px] shadow-lg">
      <img
        src={post.featuredImage || "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop"}
        alt={post.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-8">
        <span className="inline-block bg-[#2FCA71] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit mb-3">
          {post.category || "Featured"}
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight line-clamp-3 mb-3 group-hover:text-[#2FCA71] transition-colors">
          {post.title}
        </h2>
        <div className="flex items-center gap-3 text-gray-400 text-xs">
          <Calendar className="w-3.5 h-3.5" /> {date}
          <span>·</span>
          <Clock className="w-3.5 h-3.5" /> {post.readTime || "5 min read"}
        </div>
      </div>
    </Link>
  );
}

// ─── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ label, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-[#011421]">
      {Icon && <Icon className="w-4 h-4 text-[#2FCA71]" />}
      <h2 className="text-sm font-black text-[#011421] uppercase tracking-widest">{label}</h2>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [blogData, setBlogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/blogs`)
      .then((res) => { setBlogData(res.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Derive categories from data
  const categories = useMemo(() => {
    const cats = [...new Set(blogData.map((b) => b.category).filter(Boolean))];
    return ["All", ...cats.slice(0, 6)].concat(
      DEFAULT_CATS.filter((c) => c !== "All" && !cats.includes(c)).slice(0, Math.max(0, 7 - cats.length - 1))
    );
  }, [blogData]);

  // Filter
  const filtered = useMemo(() => {
    let list = blogData;
    if (activeCategory !== "All") list = list.filter((b) => b.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((b) =>
        `${b.title} ${b.category || ""} ${b.excerpt || ""}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [blogData, activeCategory, searchQuery]);

  const isFiltering = searchQuery.trim() || activeCategory !== "All";

  // Layout slices (only when not filtering)
  const featured   = blogData[0];
  const latest     = blogData.slice(1, 5);   // left col list
  const popular    = blogData.slice(5, 9);   // center col
  const trending   = blogData.slice(9, 14);  // right sidebar
  const allArticles = blogData.slice(14);

  // Pagination for filtered/all-articles view
  const paginated = filtered.slice((currentPage - 1) * blogsPerPage, currentPage * blogsPerPage);
  const totalPages = Math.ceil(filtered.length / blogsPerPage);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#2FCA71] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <ScrollProgress>
      <div className="bg-[#f8f9fb] min-h-screen font-sans">

        {/* ── Masthead ── */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
            <div>
              <p className="text-[17px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">News & Blogs</p>
            </div>
            {/* Search */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#011421] placeholder-gray-400 outline-none focus:border-[#2FCA71] focus:ring-2 focus:ring-[#2FCA71]/20 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Breaking news ── */}
        <BreakingMarquee posts={blogData.slice(0, 6)} />

        {/* ── Category nav ── */}
        <CategoryNav
          categories={categories}
          active={activeCategory}
          onChange={(c) => { setActiveCategory(c); setCurrentPage(1); setSearchQuery(""); }}
        />

        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* ── FILTERED / SEARCH VIEW ── */}
          {isFiltering ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-[#011421]">
                  {searchQuery ? `Results for "${searchQuery}"` : activeCategory}
                  <span className="ml-2 text-sm font-bold text-gray-400">({filtered.length})</span>
                </h2>
                <button
                  onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                  className="text-xs font-black text-[#2FCA71] hover:underline uppercase tracking-widest"
                >
                  Clear
                </button>
              </div>

              {paginated.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                  <Frown className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="font-black text-gray-400">No articles found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginated.map((b) => <BlogCard key={b._id} blog={b} />)}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${currentPage === i + 1 ? "bg-[#011421] text-white" : "bg-white text-gray-400 border border-gray-200 hover:border-[#2FCA71]"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── NORMAL NEWS LAYOUT ── */
            <>
              {/* ── Row 1: Featured + Latest + Trending ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

                {/* LEFT — Featured + latest list */}
                <div className="lg:col-span-5">
                  <SectionHeading label="Latest News" icon={BookOpen} />
                  <FeaturedPost post={featured} />
                  <div className="mt-4 space-y-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    {latest.map((b) => <BlogCard key={b._id} blog={b} variant="row" />)}
                  </div>
                </div>

                {/* CENTER — Popular */}
                <div className="lg:col-span-4">
                  <SectionHeading label="Popular News" icon={TrendingUp} />
                  <div className="space-y-4">
                    {popular.slice(0, 1).map((b) => (
                      <Link key={b._id} href={`/blog/${b.slug || b._id}`} className="group block rounded-2xl overflow-hidden relative h-52 shadow-sm">
                        <img src={b.featuredImage || "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop"} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5">
                          <span className="text-[10px] font-black text-[#2FCA71] uppercase tracking-widest mb-1">{b.category || "General"}</span>
                          <h3 className="text-sm font-black text-white line-clamp-2 group-hover:text-[#2FCA71] transition-colors">{b.title}</h3>
                        </div>
                      </Link>
                    ))}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-0">
                      {popular.slice(1).map((b) => <BlogCard key={b._id} blog={b} variant="row" />)}
                    </div>
                  </div>
                </div>

                {/* RIGHT — Trending sidebar */}
                <div className="lg:col-span-3">
                  <SectionHeading label="Trending" icon={TrendingUp} />
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    {trending.map((b, i) => (
                      <div key={b._id} className="flex items-start gap-3 group">
                        <span className="text-2xl font-black text-gray-100 leading-none w-7 shrink-0 select-none">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-black text-[#2FCA71] uppercase tracking-widest">{b.category || "General"}</span>
                          <Link href={`/blog/${b.slug || b._id}`}>
                            <h4 className="text-xs font-black text-[#011421] leading-snug line-clamp-2 group-hover:text-[#2FCA71] transition-colors mt-0.5 cursor-pointer">
                              {b.title}
                            </h4>
                          </Link>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Must reads */}
                  <div className="mt-6">
                    <SectionHeading label="Must Reads" />
                    <div className="space-y-3">
                      {blogData.slice(0, 4).map((b) => <BlogCard key={b._id} blog={b} variant="compact" />)}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Row 2: All articles grid ── */}
              {allArticles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-[#011421]">
                    <h2 className="text-sm font-black text-[#011421] uppercase tracking-widest">All Articles</h2>
                    <span className="text-xs text-gray-400 font-bold">{allArticles.length} stories</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {allArticles.map((b) => <BlogCard key={b._id} blog={b} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Marquee CSS */}
      <style jsx global>{`
        .marquee-track {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </ScrollProgress>
  );
}
