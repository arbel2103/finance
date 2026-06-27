import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'subtle' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary: 'bg-sage-600 text-white hover:bg-sage-700 shadow-soft',
  subtle: 'bg-sage-50 text-sage-700 hover:bg-sage-100',
  ghost: 'bg-transparent text-ink-700 hover:bg-sand-100',
  outline: 'bg-white text-ink-700 border border-sand-200 hover:bg-sand-50',
  danger: 'bg-transparent text-red-600 hover:bg-red-50',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2 rounded-xl gap-2',
  lg: 'text-base px-5 py-2.5 rounded-xl gap-2',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
