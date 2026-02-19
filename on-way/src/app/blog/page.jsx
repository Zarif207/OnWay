import BlogCard from "../components/BlogCard";
import blogData from "../../../public/blogs.json";


export default function BlogPage() {
    const featuredBlogs = blogData.filter((blog) => blog.featured);
    const otherBlogs = blogData.filter((blog) => !blog.featured);


    return (
        <div className="min-h-screen">

            <div className="bg-linear-to-r from-gray-900 via-gray-800 to-black text-white py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-5xl font-bold mb-4">OnWay Insights</h1>
                    <p className="text-lg text-gray-300 mb-8">
                    Stay updated with the latest in smart urban mobility, driver success stories, and future tech.
                    </p>
                    <div className="relative max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search for Blogs..."
                            className="w-full px-6 py-4 rounded-full bg-gray-900 text-white text-lg border-2 border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-500 transition font-medium">
                            Search
                        </button>
                    </div>
                </div>
            </div>
         


            <div className="container mx-auto px-2 mt-10 mb-20">
                {/* Featured Section */}
                {featuredBlogs.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="w-8 h-1 bg-brand rounded-full inline-block"></span>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {otherBlogs.map((blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

