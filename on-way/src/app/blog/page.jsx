import BlogCard from "../components/BlogCard";
import blogData from "../../../public/blogs.json";


export default function BlogPage() {
    const featuredBlogs = blogData.filter((blog) => blog.featured);
    const otherBlogs = blogData.filter((blog) => !blog.featured);


    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-secondary text-white py-16 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-4">OnWay Insights</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Stay updated with the latest in smart urban mobility, driver success stories, and future tech.
                    </p>
                </div>
            </section>


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

