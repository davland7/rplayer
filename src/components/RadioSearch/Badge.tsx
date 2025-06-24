import type React from "react";

interface BadgeProps {
	children: React.ReactNode;
	className?: string;
	title?: string;
}

const Badge = ({ children, className = "", title }: BadgeProps) => (
	<span
		className={`inline-block rounded px-2 py-0.5 text-xs truncate max-w-[70px] ${className}`}
		title={title}
	>
		{children}
	</span>
);

export default Badge;
