"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
    React.ElementRef<typeof ProgressPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
    <ProgressPrimitive.Root
        ref={ref}
        className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
        {...props}
    >
        <ProgressPrimitive.Indicator
            className="h-full w-full flex-1 transition-all"
            style={{
                transform: `translateX(-${100 - (value || 0)}%)`,
                background: `linear-gradient(90deg, 
          rgba(239,68,68,1) 0%, 
          rgba(234,179,8,1) 50%, 
          rgba(34,197,94,1) 100%)`,
            }}
        />
    </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

