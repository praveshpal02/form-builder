"use client";

import { forwardRef } from "react";
import { Icon } from "./Icon";

const variantStyles = {
  primary: "badge badge-primary",
  success: "badge badge-success",
  warning: "badge badge-warning",
  destructive: "badge badge-destructive",
  muted: "badge badge-muted",
  outline: "badge badge-outline",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-[11px]",
  lg: "px-3 py-0.5 text-[12px]",
};

export const Badge = forwardRef(
  (
    {
      children,
      variant = "muted",
      size = "md",
      className = "",
      dot = false,
      dotColor,
      ...props
    },
    ref
  ) => (
    <span ref={ref} className={`${variantStyles[variant]} ${sizeStyles[size]} ${className}`} {...props}>
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: dotColor || "currentColor",
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
);

Badge.displayName = "Badge";

export const StatusBadge = forwardRef(
  (
    {
      status,
      className = "",
      size = "md",
      showDot = true,
      ...props
    },
    ref
  ) => {
    const config = {
      published: { variant: "success", label: "Live", dotColor: "var(--success)" },
      draft: { variant: "muted", label: "Draft", dotColor: "var(--muted-foreground)" },
      pending: { variant: "warning", label: "Pending", dotColor: "var(--warning)" },
      closed: { variant: "destructive", label: "Closed", dotColor: "var(--destructive)" },
      active: { variant: "success", label: "Active", dotColor: "var(--success)" },
      inactive: { variant: "muted", label: "Inactive", dotColor: "var(--muted-foreground)" },
      error: { variant: "destructive", label: "Error", dotColor: "var(--destructive)" },
      success: { variant: "success", label: "Success", dotColor: "var(--success)" },
    };

    const cfg = config[status] || config.draft;

    return (
      <Badge
        ref={ref}
        variant={cfg.variant}
        size={size}
        className={className}
        dot={showDot}
        dotColor={cfg.dotColor}
        {...props}
      >
        {cfg.label}
      </Badge>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export default Badge;