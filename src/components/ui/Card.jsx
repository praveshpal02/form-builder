"use client";

import { forwardRef } from "react";

export const Card = forwardRef(
  ({ children, className = "", hover = false, padding = "p-5", ...props }, ref) => (
    <div
      ref={ref}
      className={`card ${hover ? "card-hover transition-shadow duration-200" : ""} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = "Card";

export const CardHeader = forwardRef(
  ({ children, className = "", ...props }, ref) => (
    <div ref={ref} className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef(
  ({ children, className = "", ...props }, ref) => (
    <h3 ref={ref} className={`text-lg font-semibold text-foreground ${className}`} {...props}>
      {children}
    </h3>
  )
);

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef(
  ({ children, className = "", ...props }, ref) => (
    <p ref={ref} className={`text-sm text-muted-foreground mt-1 ${className}`} {...props}>
      {children}
    </p>
  )
);

CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef(
  ({ children, className = "", ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef(
  ({ children, className = "", ...props }, ref) => (
    <div ref={ref} className={`mt-4 flex items-center gap-2 ${className}`} {...props}>
      {children}
    </div>
  )
);

CardFooter.displayName = "CardFooter";

export default Card;