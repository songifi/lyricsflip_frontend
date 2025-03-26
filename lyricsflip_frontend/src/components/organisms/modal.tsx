'use client';

import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/atoms/dialog';
import { Button } from '../atoms/button';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footerContent?: ReactNode
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  bgColor?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footerContent,
  primaryActionLabel = 'Confirm',
  onPrimaryAction,
  bgColor = 'bg-amber-500',
}: ModalProps) {
  const handlePrimaryAction = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      {/* @ts-ignore */}
      <DialogContent className={cn("max-w-[28rem]", bgColor)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4 ">{children}</div>
        
        {footerContent ? (
          footerContent
        ) : (
          <Button variant="purple" size="full" asChild>
            <button onClick={handlePrimaryAction}>
              {primaryActionLabel}
            </button>
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
