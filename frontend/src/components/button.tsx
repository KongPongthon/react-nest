import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import * as Slot from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'
import { variants } from '@/lib/cn-constant'
import { LoaderCircle } from 'lucide-react'

const customButtonVariants =
  'hover:opacity-80 text-white cursor-pointer shadow-xs'

const buttonVariants = cva(
  `${customButtonVariants} focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive rounded-md  bg-clip-padding text-sm font-medium focus-visible:ring-[3px] aria-invalid:ring-[3px] [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none`,
  {
    variants: {
      variant: {
        default: variants.background.gradient,
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        destructive:
          'bg-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive/40 ',
        outline:
          'border border-border bg-background text-foreground hover:bg-accent hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground hover:opacity-100',
        icon: 'border border-border bg-background text-foreground hover:bg-accent hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground hover:opacity-100 p-2',
        ghost:
          'shadow-none hover:shadow-xs hover:bg-accent hover:text-foreground  aria-expanded:bg-muted aria-expanded:text-foreground text-foreground hover:opacity-100',
        link: 'shadow-none text-blue-500 underline-offset-4 hover:underline ',
      },
      size: {
        default:
          'h-9 gap-2 px-4 py-2 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        icon: 'size-9',
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  loading = false,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  const effectiveSize = variant === 'icon' && size === 'default' ? 'icon' : size

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={effectiveSize}
      className={cn(
        buttonVariants({ variant, size: effectiveSize, className }),
      )}
      {...props}
    >
      {loading ? (
        <>
          <LoaderCircle className="w-4 h-4 animate-spin" /> {children}
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
