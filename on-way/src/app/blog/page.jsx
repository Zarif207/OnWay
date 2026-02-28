"use client";
import { useEffect, useState } from "react";
import axios from "axios";

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
      .catch((err) => {
        console.error("Error fetching blogs:", err);
        setLoading(false);
      });
  }, []);

  const filteredBlogs = blogData.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const featuredBlogs = filteredBlogs
    .filter((blog) => blog.featured)
    .slice(0, 3);

  // ✅ Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-xl">Loading Insights...</p>
      </div>
    );
  }

  return (
    <ScrollProgress>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold mb-4">OnWay Insights</h1>
            <p className="text-lg text-gray-300 mb-8">
              Stay updated with smart urban mobility, driver success stories,
              and future tech.
            </p>

            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search for Blogs..."
                className="w-full px-6 py-4 rounded-full bg-gray-900 text-white text-lg border-2 border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Featured Section */}
          {currentPage === 1 && featuredBlogs.length > 0 && !searchQuery && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-6">Featured Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredBlogs.map((blog) => (
                  <BlogCard key={blog._id || blog.id} blog={blog} />
                ))}
              </div>
            </div>
          )}

          {/* Blog Grid */}
          <section>
            <h2 className="text-2xl font-bold mb-8">Latest Updates</h2>

            {currentBlogs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentBlogs.map((blog) => (
                    <BlogCard key={blog._id || blog.id} blog={blog} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12 gap-2">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={`px-4 py-2 rounded-lg font-bold transition ${
                          currentPage === index + 1
                            ? "bg-yellow-400 text-black"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-gray-500 text-xl">
                No blogs found matching your search.
              </div>
            )}
          </section>
        </div>
      </div>
    </ScrollProgress>
  );
}
