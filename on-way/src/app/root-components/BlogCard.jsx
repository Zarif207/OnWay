
import Link from "next/link";

export default function BlogCard({ blog }) {
    const formattedDate = blog.publishedAt
        ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : "Recent Post";

    return (
        <div className="group flex flex-col h-full bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-yellow-400/50 hover:shadow-md transition-all duration-300">
            <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                <img
                    src={blog.featuredImage || "https://via.placeholder.com/600x400?text=OnWay+Blog"}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                    <span className="bg-secondary/60 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        {blog.category || "General"}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col grow">
                <div className="flex items-center gap-2 text-gray-400 text-[11px] mb-3 font-medium">
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span>{blog.readTime || "5 min read"}</span>
                </div>

                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                </h3>

                <p className="text-gray-600 text-sm mb-6 line-clamp-3 grow">
                    {blog.excerpt || blog.content?.substring(0, 120) + "..."}
                </p>

                <Link
                    href={`/blog/${blog.slug || blog._id}`}
                    className="inline-flex items-center font-bold text-sm text-zinc-900 group-hover:text-primary transition-all"
                >
                    Read Article
                    <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                </Link>
            </div>
        </div>
    );
}