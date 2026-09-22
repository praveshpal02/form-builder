"use client";

import { forwardRef } from "react";
import { Icon } from "./Icon";

const variantIcons = {
  error: "alertCircle",
  success: "checkCircle",
  warning: "alertTriangle",
  info: "info",
};

const variantStyles = {
  error: "alert alert-error",
  success: "alert alert-success",
  warning: "alert alert-warning",
  info: "alert alert-info",
};

export const Alert = forwardRef(
  (
    {
      children,
      variant = "info",
      className = "",
      title,
      dismissible = false,
      onDismiss,
      showIcon = true,
      ...props
    },
    ref
  ) => {
    const IconName = variantIcons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={`${variantStyles[variant]} ${dismissible ? "justify-between" : ""} ${className}`}
        {...props}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {showIcon && (
            <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
              <Icon name={IconName} size="md" className={variant === "error" ? "text-destructive" : variant === "success" ? "text-success" : variant === "warning" ? "text-warning" : "text-info"} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && <p className="font-medium text-sm">{title}</p>}
            <p className="text-sm mt-0.5">{children}</p>
          </div>
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
            aria-label="Dismiss"
          >
            <Icon name="x" size="sm" className="text-muted-foreground" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";

export default Alert;