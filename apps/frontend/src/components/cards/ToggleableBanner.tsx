"use client";

import { cn } from "@/lib/frontend/util";
import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";

interface ToggleableBannerProps {
  title?: ReactNode;
  description?: ReactNode;
  className?: ReactNode;
  textCenter?: boolean;
  italic?: boolean;
  defaultOpen?: boolean;
  buttonLabel?: ReactNode;
  buttonHref?: string;
  onButtonClick?: () => void;
}

const buttonClasses =
  "group/button inline-flex cursor-pointer items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-sm font-semibold not-italic text-white transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2";

export const ToggleableBanner = ({
  title,
  description,
  className,
  textCenter = true,
  italic = true,
  defaultOpen = false,
  buttonLabel = "Lets chat",
  buttonHref,
  onButtonClick,
}: ToggleableBannerProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const isToggleable = Boolean(description);
  const hasButton = Boolean(buttonHref || onButtonClick);
  const isExternal = Boolean(buttonHref && /^(https?:)?\/\//.test(buttonHref));
  const toggle = () => setIsOpen((prev) => !prev);

  // Keep track of the expandable content's natural height (updates if content/width changes)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const update = () => setContentHeight(el.scrollHeight);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [description, buttonLabel, hasButton]);

  const buttonContent = (
    <>
      {buttonLabel}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 transition-transform duration-200 group-hover/button:translate-x-1 motion-reduce:transition-none"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </>
  );

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't toggle the banner
    onButtonClick?.();
  };

  return (
    <div
      role={isToggleable ? "button" : undefined}
      tabIndex={isToggleable ? 0 : undefined}
      aria-expanded={isToggleable ? isOpen : undefined}
      onClick={isToggleable ? toggle : undefined}
      onKeyDown={
        isToggleable
          ? (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          }
          : undefined
      }
      className={cn(
        "group flex w-full flex-col p-4 rounded-lg bg-gradient-banner",
        textCenter && "text-center",
        italic && "italic",
        isToggleable && "cursor-pointer select-none",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2",
          textCenter ? "justify-center" : "justify-between"
        )}
      >
        <span className={cn("text-base font-bold  text-black/80")}>
          {title}
        </span>
        {isToggleable && (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "h-5 w-5 shrink-0 text-black/50 transition-[transform,color] duration-[2000ms] ease-in-out group-hover:text-black/80 motion-reduce:transition-none",
              isOpen && "rotate-180"
            )}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </div>
      {description && (
        <div
          aria-hidden={!isOpen}
          style={{
            height: isOpen ? (contentHeight || "auto") : 0,
          }}
          className={cn(
            "overflow-hidden transition-[height] duration-[2000ms] ease-in-out motion-reduce:transition-none",
            !isOpen &&
            "invisible [transition-property:height,visibility] [transition-delay:0s,2000ms]"
          )}
        >
          <div ref={contentRef} className="pt-2">
            <div
              className={cn(
                "flex flex-col gap-3 transition-opacity ease-in-out motion-reduce:transition-none",
                textCenter ? "items-center" : "items-start",
                isOpen
                  ? "opacity-100 duration-[2000ms] delay-500"
                  : "opacity-0 duration-700"
              )}
            >
              <span className="block text-base font-normal text-black/60">
                {description}
              </span>
              {hasButton &&
                (buttonHref ? (
                  <Link
                    href={buttonHref}
                    tabIndex={isOpen ? 0 : -1}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    onClick={handleButtonClick}
                    onKeyDown={(e) => e.stopPropagation()}
                    className={buttonClasses}
                  >
                    {buttonContent}
                  </Link>
                ) : (
                  <button
                    type="button"
                    tabIndex={isOpen ? 0 : -1}
                    onClick={handleButtonClick}
                    onKeyDown={(e) => e.stopPropagation()}
                    className={buttonClasses}
                  >
                    {buttonContent}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};