"use client";

import { useEffect, useCallback, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  titleIcon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxHeight?: string;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  titleIcon,
  children,
  footer,
  maxHeight = "85vh",
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startY: 0, currentY: 0, isDragging: false });
  const [translateY, setTranslateY] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setTranslateY(0);
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") handleClose();
      };
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, handleClose]);

  const handleDragStart = useCallback((clientY: number) => {
    dragRef.current = { startY: clientY, currentY: clientY, isDragging: true };
  }, []);

  const handleDragMove = useCallback((clientY: number) => {
    if (!dragRef.current.isDragging) return;
    const diff = clientY - dragRef.current.startY;
    if (diff > 0) {
      setTranslateY(diff);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    if (translateY > 100) {
      handleClose();
    } else {
      setTranslateY(0);
    }
  }, [translateY, handleClose]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => handleDragStart(e.touches[0].clientY),
    [handleDragStart]
  );
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => handleDragMove(e.touches[0].clientY),
    [handleDragMove]
  );
  const handleTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd]);

  if (!isOpen && !isClosing) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          isOpen && !isClosing ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out",
          isOpen && !isClosing ? "translate-y-0" : "translate-y-full",
          className
        )}
        style={{
          maxHeight,
          transform:
            isOpen && !isClosing
              ? `translateY(${translateY}px)`
              : "translateY(100%)",
        }}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="flex flex-col items-center pb-2 pt-3 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {title && (
          <div className="flex items-center justify-between border-b px-4 pb-3">
            <div className="flex items-center gap-2">
              {titleIcon}
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>

        {footer && <div className="border-t p-4">{footer}</div>}
      </div>
    </>
  );
}
