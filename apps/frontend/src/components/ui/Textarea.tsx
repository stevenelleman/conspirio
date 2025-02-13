import type * as Classed from "@tw-classed/react";
import { classed } from "@tw-classed/react";
import {
  ForwardedRef,
  TextareaHTMLAttributes,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import { InputWrapper, InputWrapperProps } from "./InputWrapper";

const TextareaComponent = classed.textarea(
  "rounded-[7px] py-2 px-3 placeholder-black/40 text-sm leading-[20px] w-full text-label-primary !outline-none shadow-none focus:border focus:ring-0 focus:outline-none focus:shadow-none focus:outline-offset-0 focus:ring-offset-0 disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-surface-primary border border-stroke-secondary",
        secondary: "bg-surface-quaternary border border-transparent",
      },
      hasError: {
        true: "!border-b-error",
      },
    },
    defaultVariants: {
      variant: "primary",
      hasError: false,
    },
  }
);

type TextareaComponentVariants = Classed.VariantProps<typeof TextareaComponent>;

interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "ref">,
    TextareaComponentVariants,
    Pick<InputWrapperProps, "label" | "description" | "error"> {
  loading?: boolean;
  icon?: React.ReactNode;
  textSize?: "xs" | "sm" | undefined;
  autoExpand?: boolean;
  rows?: number;
}

const AppTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props: TextareaProps, ref: ForwardedRef<HTMLTextAreaElement>) => {
    const {
      label,
      variant,
      placeholder,
      description,
      icon,
      error,
      className,
      autoExpand,
      rows,
    } = props;

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
      if (autoExpand && textareaRef.current) {
        const textarea = textareaRef.current;
        const adjustHeight = () => {
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight}px`;
        };

        textarea.addEventListener("input", adjustHeight);
        adjustHeight(); // Initial adjustment

        return () => textarea.removeEventListener("input", adjustHeight);
      }
    }, [autoExpand]);

    return (
      <InputWrapper
        label={label}
        description={description}
        error={error}
        className={className}
      >
        <label className="relative form-control w-full">
          <div className="relative">
            {icon && (
              <div className="pointer-events-none w-8 h-8 absolute top-[3.5px] transform left-1">
                <span className="text-gray-10">{icon}</span>
              </div>
            )}
            <TextareaComponent
              ref={(node) => {
                if (typeof ref === "function") {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
                textareaRef.current = node;
              }}
              {...props}
              placeholder={placeholder}
              variant={variant}
              hasError={!!error}
              autoComplete="off"
              rows={rows}
            />
          </div>
        </label>
      </InputWrapper>
    );
  }
);

AppTextarea.displayName = "AppTextarea";

export { AppTextarea };
