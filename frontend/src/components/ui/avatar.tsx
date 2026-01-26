import * as React from "react";

import { cn } from "../../lib/utils";

type AvatarSize = "sm" | "md" | "lg";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: AvatarSize;
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "md", ...props }, ref) => (
    <div
      ref={ref}
      role="img"
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-neutral-200 text-neutral-700",
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Avatar.displayName = "Avatar";

export type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  alt: string;
};

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, alt, ...props }, ref) => (
    <img
      ref={ref}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      {...props}
    />
  ),
);

AvatarImage.displayName = "AvatarImage";

export type AvatarFallbackProps = React.HTMLAttributes<HTMLSpanElement>;

export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("flex h-full w-full items-center justify-center text-sm font-medium", className)}
      {...props}
    />
  ),
);

AvatarFallback.displayName = "AvatarFallback";
