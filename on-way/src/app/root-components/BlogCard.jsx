import Link from "next/link";
import { Clock, Calendar } from "lucide-react";

export default function BlogCard({ blog, variant = "default" }) {
  const formattedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recent";

  const href = `/blog/${blog.slug || blog._id}`;
  const image = blog.featuredImage || "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop";
  const category = blog.category || "General";

  // ── Horizontal compact (for sidebar / trending list) ──
  if (variant === "compact") {
    return (
      <Link href={href} className="flex gap-3 group items-start">
        <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
          <img src={image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-black text-[#2FCA71] uppercase tracking-widest">{category}</span>
          <h4 className="text-xs font-black text-[#011421] leading-snug line-clamp-2 group-hover:text-[#2FCA71] transition-colors mt-0.5">
            {blog.title}
          </h4>
          <p className="text-[10px] text-gray-400 mt-1">{formattedDate}</p>
        </div>
      </Link>
    );
  }

  // ── Horizontal medium (for popular / latest list rows) ──
  if (variant === "row") {
    return (
      <Link href={href} className="flex gap-4 group items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
        <div className="w-28 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
          <img src={image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="inline-block text-[10px] font-black text-[#2FCA71] uppercase tracking-widest mb-1">{category}</span>
          <h4 className="text-sm font-black text-[#011421] leading-snug line-clamp-2 group-hover:text-[#2FCA71] transition-colors">
            {blog.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
            <Calendar className="w-3 h-3" /> {formattedDate}
            <span>·</span>
            <Clock className="w-3 h-3" /> {blog.readTime || "5 min"}
          </div>
        </div>
      </Link>
    );
  }

  // ── Default card (grid layout) ──
  return (
    <Link href={href} className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3">
          <span className="bg-[#2FCA71] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            {category}
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
          <Calendar className="w-3 h-3" /> {formattedDate}
          <span>·</span>
          <Clock className="w-3 h-3" /> {blog.readTime || "5 min read"}
        </div>
        <h3 className="text-base font-black text-[#011421] leading-snug line-clamp-2 mb-2 group-hover:text-[#2FCA71] transition-colors">
          {blog.title}
        </h3>
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 flex-1">
          {blog.excerpt || blog.content?.substring(0, 100) + "..."}
        </p>
        <div className="mt-3 flex items-center gap-1 text-[#2FCA71] text-xs font-black uppercase tracking-widest group-hover:gap-2 transition-all">
          Read More <span>→</span>
        </div>
      </div>
    </Link>
  );
}
