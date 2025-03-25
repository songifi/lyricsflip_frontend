'use client';

import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/atoms/dialog';
import { Button } from '../atoms/button';

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footerContent?: ReactNode
  primaryActionLabel?: string
  onPrimaryAction?: () => void
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
      <DialogContent className=" sm:max-w-md bg-amber-500 ]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4 ">{children}</div>
        
       


        {footerContent ? (
          footerContent
        ) : (
          <Button variant="purple" size="full" onClick={handlePrimaryAction}>
            {primaryActionLabel}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
