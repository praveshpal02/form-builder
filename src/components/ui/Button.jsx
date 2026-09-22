"use client";

import { forwardRef } from "react";
import { Icon } from "./Icon";

const variantStyles = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  destructive: "btn btn-destructive",
  ghost: "btn btn-ghost",
  outline: "btn btn-secondary",
  outlineDestructive: "btn btn-outline-destructive",
};

const sizeStyles = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  icon: "btn-icon",
};

export const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className = "",
      disabled = false,
      loading = false,
      leftIcon,
      rightIcon,
      type = "button",
      onClick,
      fullWidth = false,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const isIconOnly = !children && (leftIcon || rightIcon);
    const effectiveSize = isIconOnly ? "icon" : size;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={`${variantStyles[variant]} ${sizeStyles[effectiveSize]} ${fullWidth ? "w-full" : ""} ${className}`}
        aria-label={ariaLabel || (loading ? "Loading" : undefined)}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Icon name="loader" size="sm" className="animate-spin" aria-hidden="true" />
        ) : (
          <>
            {leftIcon && <Icon name={leftIcon} size={effectiveSize === "icon" ? "md" : "sm"} aria-hidden="true" />}
            {children}
            {rightIcon && <Icon name={rightIcon} size={effectiveSize === "icon" ? "md" : "sm"} aria-hidden="true" />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;