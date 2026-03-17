"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Search, X, Frown } from "lucide-react";
import ScrollProgress from "../components/ScrollProgress";
import BlogCard from "../root-components/BlogCard";

export default function BlogPage() {
  const [blogData, setBlogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/blogs`)
      .then((res) => {
        setBlogData(res.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Multi-word Search Logic
  const filteredBlogs = blogData.filter((blog) => {
    if (!searchQuery.trim()) return true;
    const keywords = searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const searchableText = `${blog.title} ${blog.category || ""} ${blog.excerpt || ""}`.toLowerCase();
    return keywords.every(word => searchableText.includes(word));
  });

  const isSearching = searchQuery.trim().length > 0;

  // Layout Logic
  const featured = blogData[0];
  const latestSix = blogData.slice(1, 7);
  const remainingBlogs = blogData.slice(7);
  const displayBlogs = isSearching ? filteredBlogs : remainingBlogs;
  const indexOfLast = currentPage * blogsPerPage;
  const indexOfFirst = indexOfLast - blogsPerPage;
  const currentBlogs = displayBlogs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(displayBlogs.length / blogsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <ScrollProgress>
      <div className="bg-white min-h-screen font-sans">

        <div className={`max-w-7xl mx-auto px-2 transition-all duration-500 ${isSearching ? 'pt-32 pb-10' : 'pt-28 pb-10'}`}>

          {!isSearching ? (
            <div className="max-w-7xl mx-auto px-4  pb-2">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                <div className="lg:col-span-2 relative group cursor-pointer overflow-hidden rounded-[2.5rem] h-130 shadow-2xl">
                  {featured && (
                    <>
                      <img
                        src={featured.featuredImage}
                        className="w-full h-full object-cover transition duration-1000 group-hover:scale-105"
                        alt={featured.title}
                      />
                      {/* Deep gradient for text readability */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-10 md:p-14">
                        <span className="bg-yellow-400 text-black text-[10px] font-black px-4 py-1.5 rounded-full w-fit mb-4 uppercase tracking-widest">
                          Featured Story
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-4">
                          {featured.title}
                        </h1>
                        <p className="text-gray-300 line-clamp-2 max-w-2xl text-lg hidden md:block">
                          {featured.excerpt || "Dive into our top pick of the week and explore deep insights."}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {/* Search Bar on Top of Sidebar */}
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl transition-all outline-none font-medium"
                    />
                  </div>

                  {/* Other Featured List */}
                  <div>
                    <h2 className="text-xl font-black mb-2 uppercase tracking-widest text-gray-400 flex items-center gap-3">
                      Must Reads <span className="h-px flex-1 bg-gray-100"></span>
                    </h2>
                    <div className="flex flex-col gap-6">
                      {latestSix.slice(0, 4).map((blog) => (
                        <div key={blog._id} className="flex gap-4 group cursor-pointer items-start">
                          <div className="w-24 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                            <img
                              src={blog.featuredImage}
                              className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                              alt={blog.title}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{blog.category || "Insight"}</span>
                            <h3 className="text-sm font-black leading-snug group-hover:text-gray-600 transition-colors line-clamp-2">
                              {blog.title}
                            </h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* --- COMPACT SEARCH HEADER (WHEN SEARCHING) --- */
            <div className="max-w-7xl mx-auto px-4  pb-4 text-center">
              <h1 className="text-4xl font-black mb-4 italic text-gray-900 tracking-tighter">Searching Our Journal</h1>
              <div className="relative max-w-2xl mx-auto group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type keywords..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-16 pr-16 py-6 border-2 border-black rounded-4xl focus:outline-none text-2xl shadow-2xl transition-all"
                />
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="max-w-7xl mx-auto px-6 -mt-5 py-4">

          {/* JODI SEARCH NA KORE - Show Latest Posts */}
          {!isSearching && currentPage === 1 && (
            <div className="mb-10">
              <h2 className="text-3xl font-black mb-5 flex items-center gap-4">
                Latest Posts <div className="h-1 w-20 bg-black rounded-full"></div>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                {latestSix.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            </div>
          )}

          {/* RESULTS GRID / ALL BLOGS */}
          <h2 className="text-3xl font-black mb-12 italic">
            {isSearching ? "Search Results" : "ALL Articles"}
          </h2>

          {currentBlogs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {currentBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          ) : (
            /* USER FRIENDLY NOT FOUND MESSAGE */
            <div className="text-center py-16 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
              <Frown className="w-16 h-16 mx-auto text-gray-300 mb-6" />
              <h3 className="text-3xl font-black text-gray-900 mb-2">No Stories Found</h3>
              <p className="text-gray-500 max-w-xs mx-auto text-lg">
                We couldn't find any articles matching **"{searchQuery}"**. Try different keywords.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-8 px-8 py-3 bg-black text-white rounded-xl font-bold hover:scale-105 transition-transform"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-24 gap-4">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-12 h-12 rounded-2xl font-black transition-all ${currentPage === i + 1
                    ? "bg-black text-white shadow-xl shadow-black/20 -translate-y-1"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollProgress>
  );
}