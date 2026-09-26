import { HTMLAttributes, ReactNode, useState } from "react";
import { InputWrapper, InputWrapperProps } from "./InputWrapper";
import { cn } from "@/lib/frontend/util";

// Plain class strings (rather than a classed component) so that a passed
// `className` is merged with `cn` and can override these defaults.
const tagBaseClasses =
  "inline-flex items-center gap-1 max-w-full rounded-[7px] py-1 pl-2 text-xs leading-[16px] text-label-primary";

// Tags use the opposite surface of the input they sit under, so
// `variant` matches the variant of the surrounding form fields.
const tagVariantClasses = {
  primary: "bg-surface-quaternary border border-transparent",
  secondary: "bg-surface-primary border border-stroke-secondary",
} as const;

export type TagVariant = keyof typeof tagVariantClasses;

interface TagComponentProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  removable?: boolean;
}

export const TagComponent = ({
  variant = "primary",
  removable = false,
  className,
  ...rest
}: TagComponentProps) => (
  <span
    className={cn(
      tagBaseClasses,
      tagVariantClasses[variant],
      removable ? "pr-1" : "pr-2",
      className
    )}
    {...rest}
  />
);

interface TagListProps
  extends Partial<Pick<InputWrapperProps, "label" | "description">> {
  variant?: TagVariant;
  values: string[];
  /** When provided, each tag gets a remove button. */
  onRemove?: (value: string, index: number) => void;
  /** Shows this many tags and collapses the rest behind a "+N" toggle. */
  maxVisible?: number;
  /** Rendered when `values` is empty. Nothing is rendered by default. */
  emptyState?: ReactNode;
  disabled?: boolean;
  labelPosition?: "top" | "left";
  /** Extra classes for every tag, merged with (and able to override) the defaults. */
  tagClassName?: string;
  className?: string;
  "aria-label"?: string;
}

const AppTagList = ({
  values,
  variant,
  onRemove,
  maxVisible,
  emptyState = null,
  disabled = false,
  label,
  description,
  labelPosition = "top",
  tagClassName,
  className,
  "aria-label": ariaLabel = "Selected values",
}: TagListProps) => {
  const [expanded, setExpanded] = useState(false);

  const isCollapsible =
    maxVisible !== undefined && values.length > maxVisible;
  const visible =
    isCollapsible && !expanded ? values.slice(0, maxVisible) : values;
  const hiddenCount = values.length - visible.length;

  const list =
    values.length === 0 ? (
      emptyState && (
        <p className="text-xs leading-[16px] text-label-primary opacity-50">
          {emptyState}
        </p>
      )
    ) : (
      <ul className="flex flex-wrap gap-1" aria-label={ariaLabel}>
        {visible.map((value, index) => (
          <li key={value} className="max-w-full">
            <TagComponent
              variant={variant}
              removable={!!onRemove}
              className={tagClassName}
            >
              <span className="truncate" title={value}>
                {value}
              </span>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(value, index)}
                  disabled={disabled}
                  aria-label={`Remove ${value}`}
                  className="flex items-center justify-center w-4 h-4 rounded text-icon-primary opacity-60 hover:opacity-100 focus-visible:opacity-100 disabled:opacity-30"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </TagComponent>
          </li>
        ))}
        {isCollapsible && (
          <li>
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              className="rounded-[7px]"
            >
              <TagComponent
                variant={variant}
                className={cn("opacity-70 hover:opacity-100", tagClassName)}
              >
                {expanded ? "Show less" : `+${hiddenCount}`}
              </TagComponent>
            </button>
          </li>
        )}
      </ul>
    );

  // Without a label or description there's nothing for the wrapper to add.
  if (!label && !description) {
    return <div className={cn(className)}>{list}</div>;
  }

  return (
    <InputWrapper
      label={label}
      description={description}
      className={className}
      labelPosition={labelPosition}
    >
      {list}
    </InputWrapper>
  );
};

AppTagList.displayName = "AppTagList";

export { AppTagList };
