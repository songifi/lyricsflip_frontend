import type * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Card as BaseCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card';

interface CardProps extends React.ComponentPropsWithoutRef<typeof BaseCard> {
  title?: string
  description?: string
  icon?: React.ReactNode
  footer?: React.ReactNode
  variant?: 'default' | 'purple' | 'blue' | 'orange' | 'pink'
  children?: React.ReactNode
}

export function Card({
  title,
  description,
  icon,
  footer,
  variant = 'default',
  className,
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-white',
    purple: 'bg-purple-50',
    blue: 'bg-blue-50',
    orange: 'bg-orange-50',
    pink: 'bg-pink-50',
  };

  return (
    <BaseCard className={cn(variantStyles[variant], className)} {...props}>
      {(title || icon || description) && (
        <CardHeader>
          <div className="flex items-start gap-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
        </CardHeader>
      )}
      {children && <CardContent>{children}</CardContent>}
      {footer && <CardFooter>{footer}</CardFooter>}
    </BaseCard>
  );
}
