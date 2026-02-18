import Link from "next/link";


export default function BlogCard({ blog }) {
    return (
        <div className="group flex flex-col h-full bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-brand/30 transition-all duration-300">
            {/* Image Container */}
            <div className="relative h-52 w-full overflow-hidden">
                <img
                    src={blog.featuredImage}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-neutral text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {blog.category}
                    </span>
                </div>
            </div>


            {/* Content */}
            <div className="p-5 flex flex-col grow">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
                    <span>{blog.publishedAt}</span>
                    <span>•</span>
                    <span>{blog.readTime}</span>
                </div>


                <h3 className="text-xl font-bold mb-3 group-hover:text-brand transition-colors line-clamp-2">
                    {blog.title}
                </h3>


                <p className="text-gray-600 text-sm mb-6 line-clamp-3 grow">
                    {blog.excerpt}
                </p>


                <Link
                    href={`/blog/${blog.slug}`}
                    className="inline-flex items-center font-bold text-brand hover:gap-2 transition-all"
                >
                    Read Article <span className="ml-1">→</span>
                </Link>
            </div>
        </div>
    );
}

