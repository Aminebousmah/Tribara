import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline";
}

const Badge: React.FC<BadgeProps> = ({ variant = "default", className, ...props }) => {
    const baseStyles =
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold transition-colors";

    const variantStyles = {
        default: "bg-blue-500 text-white",
        secondary: "bg-gray-500 text-white",
        destructive: "bg-red-500 text-white",
        outline: "border border-gray-500 text-gray-800",
    };

    const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${className || ""}`;

    return <div className={combinedStyles} {...props} />;
};

export { Badge };
