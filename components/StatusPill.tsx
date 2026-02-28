import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusPillVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        applied: "bg-blue-100 text-blue-800",
        interview: "bg-yellow-100 text-yellow-800",
        offer: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        ghosted: "bg-gray-100 text-gray-800",
      },
    },
    defaultVariants: {
      variant: "applied",
    },
  }
)

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusPillVariants> {}

export function StatusPill({ className, variant, ...props }: StatusPillProps) {
  return (
    <div
      className={cn(statusPillVariants({ variant }), className)}
      {...props}
    />
  )
}