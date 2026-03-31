"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCheck, Pencil, Trash2, X, Check } from "lucide-react";

export default function MessageBubble({
    m,
    isMine,
    bubbleClass,
    onEdit,
    onDelete,
    timeStr,
    senderLabel = null,
    senderLabelClass = "text-gray-400",
}) {
    const [showMenu, setShowMenu] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(m.message || "");
    const menuRef = useRef(null);
    const inputRef = useRef(null);

    // Close menu on outside click
    useEffect(() => {
        if (!showMenu) return;
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showMenu]);

    // Focus input when editing starts
    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    const handleEdit = () => {
        setShowMenu(false);
        setEditText(m.message || "");
        setEditing(true);
    };

    const handleEditSave = () => {
        if (editText.trim() && editText.trim() !== m.message) {
            onEdit?.(m._id, editText.trim());
        }
        setEditing(false);
    };

    const handleEditCancel = () => {
        setEditing(false);
        setEditText(m.message || "");
    };

    const handleDelete = () => {
        setShowMenu(false);
        onDelete?.(m._id);
    };

    // Deleted message
    if (m.deleted) {
        return (
            <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[80%] flex flex-col gap-1">
                    {senderLabel && !isMine && (
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 ${senderLabelClass}`}>
                            {senderLabel}
                        </span>
                    )}
                    <div className={`px-5 py-3 rounded-4xl ${isMine ? "rounded-tr-none" : "rounded-tl-none"} 
                                    bg-gray-100 border border-gray-200`}>
                        <p className="text-gray-400 text-xs italic font-medium">
                            🗑 Message deleted
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isMine ? "justify-end" : "justify-start"} group`}>
            <div className="max-w-[80%] flex flex-col gap-1">
                {/* Sender label */}
                {senderLabel && !isMine && (
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 ${senderLabelClass}`}>
                        {senderLabel}
                    </span>
                )}

                <div className="relative flex items-end gap-1.5">
                    {/* ── Action menu button — left of bubble for mine ── */}
                    {isMine && !editing && (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowMenu(p => !p)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity
                                           w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200
                                           flex items-center justify-center mb-1 shrink-0"
                            >
                                <span className="text-gray-500 text-lg leading-none mb-1">···</span>
                            </button>

                            {showMenu && (
                                <div className="absolute bottom-9 right-0 z-50 bg-white shadow-xl
                                                rounded-2xl border border-gray-100 overflow-hidden min-w-[130px]">
                                    {/* Edit — only for text messages */}
                                    {m.messageType !== "image" && (
                                        <button
                                            onClick={handleEdit}
                                            className="w-full flex items-center gap-2.5 px-4 py-3
                                                       hover:bg-emerald-50 text-gray-700 text-sm font-bold
                                                       transition-colors"
                                        >
                                            <Pencil size={14} className="text-emerald-600" />
                                            Edit
                                        </button>
                                    )}
                                    <button
                                        onClick={handleDelete}
                                        className="w-full flex items-center gap-2.5 px-4 py-3
                                                   hover:bg-red-50 text-red-500 text-sm font-bold
                                                   transition-colors"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Bubble ── */}
                    <div className={`p-5 rounded-4xl shadow-sm ${bubbleClass}
                                    ${isMine ? "rounded-tr-none" : "rounded-tl-none"}`}>
                        {editing ? (
                            /* Edit input */
                            <div className="flex flex-col gap-2 min-w-[180px]">
                                <textarea
                                    ref={inputRef}
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleEditSave();
                                        }
                                        if (e.key === "Escape") handleEditCancel();
                                    }}
                                    rows={2}
                                    className="bg-white/20 rounded-xl px-3 py-2 text-sm font-bold
                                               outline-none resize-none w-full border border-white/30
                                               placeholder-white/50"
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={handleEditCancel}
                                        className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30
                                                   flex items-center justify-center transition-colors"
                                    >
                                        <X size={13} className="text-white" />
                                    </button>
                                    <button
                                        onClick={handleEditSave}
                                        className="w-7 h-7 rounded-full bg-white/30 hover:bg-white/50
                                                   flex items-center justify-center transition-colors"
                                    >
                                        <Check size={13} className="text-white" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Normal message */
                            m.messageType === "image" ? (
                                <img
                                    src={m.fileUrl}
                                    alt="attachment"
                                    className="rounded-xl max-h-60 object-cover"
                                />
                            ) : (
                                <p className="font-bold text-sm leading-relaxed">{m.message}</p>
                            )
                        )}

                        {/* Time + read + edited */}
                        {!editing && (
                            <div className="mt-2 flex items-center gap-2 justify-end opacity-60 text-[9px] font-black uppercase">
                                {m.edited && (
                                    <span className="italic opacity-70">edited</span>
                                )}
                                {timeStr}
                                {isMine && (
                                    <CheckCheck
                                        size={12}
                                        className={m.isRead ? "text-emerald-300" : "text-white/50"}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}