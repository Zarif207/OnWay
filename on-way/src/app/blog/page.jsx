"use client";
import { useEffect, useState } from "react";
import axios from "axios";

import ScrollProgress from "../components/ScrollProgress";
import BlogCard from "../root-components/BlogCard";

export default function BlogPage() {
  const [blogData, setBlogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios
      .get("/blogs.json")
      .then((res) => {
        setBlogData(res.data);
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

  const featuredBlogs = filteredBlogs.filter((blog) => blog.featured);
  const otherBlogs = filteredBlogs.filter((blog) => !blog.featured);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-xl">Loading Insights...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-gray-900 via-gray-800 to-black text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">OnWay Insights</h1>
          <p className="text-lg text-gray-300 mb-8">
            Stay updated with the latest in smart urban mobility, driver success
            stories, and future tech.
          </p>
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for Blogs..."
              className="w-full px-6 py-4 rounded-full bg-gray-900 text-white text-lg border-2 border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-yellow-400 text-black px-6 py-2 rounded-full font-medium">
              Search
            </div>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="container mx-auto px-4 md:px-6 mt-10 mb-20">
        {/* Featured Section */}
        {featuredBlogs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-yellow-400 rounded-full inline-block"></span>
              Featured Stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </div>
        )}

        {/* Regular Feed */}
        <section>
          <h2 className="text-2xl font-bold mb-8">Latest Updates</h2>
          {otherBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 text-xl">
              No blogs found matching your search.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
