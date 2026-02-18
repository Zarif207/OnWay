import Link from "next/link";

export function Button({
  as = "button",
  href,
  onClick,
  children,
  variant = "primary",
  type = "button",
  className = "",
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2";

  const styles = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800",
    accent: "bg-yellow-400 text-zinc-950 hover:bg-yellow-300",
    outline:
      "border border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50",
    ghost: "bg-transparent text-zinc-900 hover:bg-zinc-100",
  };

  const cls = `${base} ${styles[variant] ?? styles.primary} ${className}`;

  if (as === "link") {
    return (
      <Link href={href ?? "#"} className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} onClick={onClick} type={type} {...rest}>
      {children}
    </button>
  );
}

export function Pill({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-4 py-2 text-xs font-semibold text-zinc-700 backdrop-blur ${className}`}
    >
      {children}
    </span>
  );
}


