"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, X, Loader2, Sparkles, Tag } from "lucide-react";
import Swal from 'sweetalert2';


const CATEGORIES = ["Company", "Sustainability", "Technology", "Experience", "Safety"];

export default function BlogManager() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);

    const { register, handleSubmit, reset, setValue } = useForm();
    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/blogs`;

    const fetchBlogs = async () => {
        try {
            const res = await axios.get(API_URL);
            setBlogs(res.data.data || []);
            setLoading(false);
        } catch (err) {
            toast.error("Failed to load blogs");
            setLoading(false);
        }
    };

    useEffect(() => { fetchBlogs(); }, []);

    const openModal = (blog = null) => {
        if (blog) {
            setEditingBlog(blog);
            Object.keys(blog).forEach(key => {
                if (key === 'tags' && Array.isArray(blog[key])) {
                    setValue(key, blog[key].join(', '));
                } else {
                    setValue(key, blog[key]);
                }
            });
        } else {
            setEditingBlog(null);
            reset({
                title: "", slug: "", category: "Company", excerpt: "",
                content: "", featuredImage: "", featured: false,
                author: "OnWay Editorial Team", readTime: "5 min read",
                tags: "Mobility, Innovation"
            });
        }
        setIsModalOpen(true);
    };

    const onSubmit = async (data) => {
        const loadingToast = toast.loading(editingBlog ? "Updating Journal..." : "Publishing to Journal...");

        const finalData = {
            ...data,
            tags: typeof data.tags === 'string' ? data.tags.split(',').map(tag => tag.trim()) : data.tags
        };

        try {
            if (editingBlog) {
                await axios.patch(`${API_URL}/${editingBlog._id}`, finalData);
                toast.success("Article Updated!", { id: loadingToast });
            } else {
                await axios.post(API_URL, finalData);
                toast.success("New Article Published!", { id: loadingToast });
            }
            setIsModalOpen(false);
            fetchBlogs();
        } catch (err) {
            toast.error("Error saving article", { id: loadingToast });
        }
    };


    const handleDelete = async (id) => {
        // SweetAlert2 Confirmation Modal
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this article!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#000000',
            cancelButtonColor: '#f3f4f6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            background: '#ffffff',
            color: '#000000',
            customClass: {
                popup: 'rounded-[2rem]',
                confirmButton: 'rounded-xl px-6 py-3 font-bold uppercase tracking-widest text-xs',
                cancelButton: 'rounded-xl px-6 py-3 font-bold uppercase tracking-widest text-xs text-black'
            }
        });

        if (result.isConfirmed) {
            const loadingToast = toast.loading("Deleting article...");
            try {
                await axios.delete(`${API_URL}/${id}`);

                // Success Alert
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your article has been removed.',
                    icon: 'success',
                    confirmButtonColor: '#000000',
                    customClass: { popup: 'rounded-[2rem]' }
                });

                toast.success("Article Deleted", { id: loadingToast });
                fetchBlogs();
            } catch (err) {
                toast.error("Delete failed", { id: loadingToast });
                Swal.fire('Error!', 'Something went wrong.', 'error');
            }
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-black" size={40} /></div>;

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-3xl shadow-sm font-sans">
            <div className="flex justify-between items-center mb-8 px-2">
                <div>
                    <h2 className="text-4xl font-black italic tracking-tighter text-black uppercase">Journal Control</h2>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1 ml-1">OnWay Mobility Hub</p>
                </div>
                <button onClick={() => openModal()} className="bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95">
                    <Plus size={18} /> Add Story
                </button>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-[0.3em]">
                            <th className="pb-6 font-black pl-4">Article</th>
                            <th className="pb-6 font-black">Meta Data</th>
                            <th className="pb-6 font-black text-right pr-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogs.map((blog) => (
                            <tr key={blog._id} className="border-b border-gray-50 group hover:bg-gray-50/50 transition-all duration-300">
                                <td className="py-6 pl-4">
                                    <div className="flex items-center gap-5">
                                        <div className="relative overflow-hidden rounded-2xl w-24 h-16 shadow-sm">
                                            <img src={blog.featuredImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                            {blog.featured && (
                                                <div className="absolute top-1 right-1 bg-yellow-400 p-1 rounded-md shadow-sm">
                                                    <Sparkles size={10} className="text-black" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 leading-tight mb-1">{blog.title}</p>
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 rounded text-gray-500">{blog.category}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-6">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs font-bold text-gray-600">{blog.author}</p>
                                        <div className="flex gap-2 items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase italic">{blog.readTime}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-6 text-right pr-4">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openModal(blog)} className="p-3 bg-gray-50 hover:bg-black hover:text-white rounded-xl transition-all"><Pencil size={16} /></button>
                                        <button onClick={() => handleDelete(blog._id)} className="p-3 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex justify-center items-center z-50 p-4">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] p-10 relative max-h-[92vh] overflow-y-auto shadow-2xl">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-10 top-10 p-2 bg-gray-100 hover:bg-black hover:text-white rounded-full transition-all"><X size={20} /></button>

                        <div className="mb-12">
                            <h3 className="text-4xl font-black italic tracking-tighter uppercase">{editingBlog ? "Edit Masterpiece" : "Draft New Story"}</h3>
                            <div className="h-1.5 w-20 bg-black mt-2 rounded-full"></div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            {/* Row 1: Title & Category */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Article Title</label>
                                    <input {...register("title", { required: true })} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-black rounded-3xl outline-none font-bold text-lg transition-all" placeholder="Enter title..." />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Journal Category</label>
                                    <select {...register("category")} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-black rounded-3xl outline-none font-bold transition-all appearance-none cursor-pointer">
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Author & ReadTime (AI FIELDS) */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Author / Team</label>
                                    <input {...register("author", { required: true })} className="w-full p-5 bg-gray-100/50 border-2 border-transparent focus:border-black rounded-3xl outline-none font-bold transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Estimated Read Time</label>
                                    <input {...register("readTime", { required: true })} className="w-full p-5 bg-gray-100/50 border-2 border-transparent focus:border-black rounded-3xl outline-none font-bold transition-all" placeholder="e.g., 5 min read" />
                                </div>
                            </div>

                            {/* Row 3: Slug & Tags (AI FIELDS) */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Custom URL Slug</label>
                                    <input {...register("slug", { required: true })} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-black rounded-3xl outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest items-center gap-2">
                                        <Tag size={12} /> Keywords / Tags (Comma separated)
                                    </label>
                                    <input {...register("tags")} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-black rounded-3xl outline-none transition-all" placeholder="Mobility, Tech, AI" />
                                </div>
                            </div>

                            {/* Image & Featured */}
                            <div className="grid md:grid-cols-3 gap-8 items-end">
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Cover Image URL</label>
                                    <input {...register("featuredImage", { required: true })} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-black rounded-3xl outline-none transition-all" />
                                </div>
                                <div className="flex items-center justify-between bg-black text-white p-5 rounded-3xl h-17">
                                    <label className="text-xs font-black uppercase tracking-tighter">Feature Post?</label>
                                    <input type="checkbox" {...register("featured")} className="w-6 h-6 accent-yellow-400 cursor-pointer" />
                                </div>
                            </div>

                            {/* Text Areas */}
                            <div>
                                <label className="block text-[11px] font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Short Excerpt (SEO Summary)</label>
                                <textarea {...register("excerpt", { required: true })} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-black rounded-3xl outline-none h-24 resize-none" />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase text-gray-400 mb-3 ml-1 tracking-widest">Deep Content (Full Story)</label>
                                <textarea {...register("content", { required: true })} className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-black rounded-4xl outline-none h-60" />
                            </div>

                            <button type="submit" className="w-full py-6 bg-black text-white rounded-4xl font-black uppercase tracking-[0.4em] hover:bg-gray-800 transition-all shadow-2xl shadow-black/20 active:scale-95">
                                {editingBlog ? "Finalize Changes" : "Confirm Publication"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}