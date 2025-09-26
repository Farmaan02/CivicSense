import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import Image from "next/image"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        default: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
      },
      variant: {
        default: "bg-muted",
        ring: "ring-2 ring-primary ring-offset-2",
        shadow: "shadow-md",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size, variant, src, alt, fallback, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(avatarVariants({ size, variant, className }))}
        {...props}
      >
        {src ? (
          <Image
            src={src}
            alt={alt || "Avatar"}
            width={40}
            height={40}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <AvatarFallback>
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-sm font-medium">
                {fallback ? getInitials(fallback) : "U"}
              </span>
            </div>
          </AvatarFallback>
        )}
      </span>
    )
  }
)
Avatar.displayName = "Avatar"

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

function getInitials(name: string): string {
  const names = name.split(" ")
  let initials = names[0].substring(0, 1).toUpperCase()
  
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase()
  }
  
  return initials
}

export { Avatar, AvatarFallback, avatarVariants }