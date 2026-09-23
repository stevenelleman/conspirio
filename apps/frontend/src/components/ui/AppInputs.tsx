// NOTE: This element was claude-generated from AppInput.tsx

import type * as Classed from "@tw-classed/react";
import { classed } from "@tw-classed/react";
import {
  ChangeEvent,
  FocusEvent,
  ForwardedRef,
  KeyboardEvent,
  ReactNode,
  TextareaHTMLAttributes,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { InputWrapper, InputWrapperProps } from "./InputWrapper";
import { cn } from "@/lib/frontend/util";
import useSettings from "@/hooks/useSettings";

const TextareaComponent = classed.textarea(
  "rounded-[7px] min-h-5 py-2 px-3 text-sm leading-[20px] w-full text-label-primary resize-none !outline-none shadow-none focus:border focus:ring-0 focus:outline-none focus:shadow-none focus:outline-offset-0 focus:ring-offset-0 disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-surface-primary border border-stroke-secondary",
        secondary: "bg-surface-quaternary border border-transparent",
      },
      darkMode: {
        true: "placeholder-white/50",
        false: "placeholder-black/50",
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

// Tags use the opposite surface of the textarea so they stand out against it.
const TagComponent = classed.span(
  "inline-flex items-center gap-1 max-w-full rounded-[7px] py-1 pl-2 pr-1 text-xs leading-[16px] text-label-primary",
  {
    variants: {
      variant: {
        primary: "bg-surface-quaternary border border-transparent",
        secondary: "bg-surface-primary border border-stroke-secondary",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

type TextareaComponentVariants = Classed.VariantProps<typeof TextareaComponent>;

/** Event shape compatible with react-hook-form's `register()` handlers. */
export type TagsInputEvent = {
  target: { name?: string; value: string[] };
  type: "change" | "blur";
};

/**
 * What the forwarded ref receives. react-hook-form reads `value` on
 * register and writes to it on `reset()` / `setValue()`, and calls
 * `focus()` when the field has a validation error.
 */
export interface TagsInputHandle {
  value: string[];
  focus: () => void;
  select: () => void;
  setCustomValidity: (message: string) => void;
  reportValidity: () => boolean;
}

interface TagsInputProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "ref" | "value" | "defaultValue" | "onChange" | "onBlur" | "name"
  >,
    TextareaComponentVariants,
    Pick<InputWrapperProps, "label" | "description" | "error"> {
  name?: string;
  defaultValue?: string[];
  onChange?: (event: TagsInputEvent) => unknown;
  onBlur?: (event: TagsInputEvent) => unknown;
  icon?: React.ReactNode;
  labelPosition?: "top" | "left";
  action?: ReactNode;
}

const AppTagsInput = forwardRef<TagsInputHandle, TagsInputProps>(
  (props: TagsInputProps, ref: ForwardedRef<TagsInputHandle>) => {
    const {
      label,
      variant,
      placeholder,
      description,
      icon,
      error,
      className,
      labelPosition = "top",
      action = null,
      name,
      defaultValue,
      onChange,
      onBlur,
      onKeyDown,
      disabled,
      rows = 1,
      ...rest
    } = props;
    const { darkTheme } = useSettings();

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [tags, setTagsState] = useState<string[]>(defaultValue ?? []);
    const tagsRef = useRef<string[]>(tags);
    const [draft, setDraft] = useState("");

    // Stable handle so react-hook-form doesn't re-register on every render.
    const handle = useMemo<TagsInputHandle>(
      () => ({
        get value() {
          return tagsRef.current;
        },
        set value(next: string[]) {
          const normalized = Array.isArray(next) ? next : [];
          tagsRef.current = normalized;
          setTagsState(normalized);
        },
        focus: () => textareaRef.current?.focus(),
        select: () => textareaRef.current?.select(),
        setCustomValidity: (message: string) =>
          textareaRef.current?.setCustomValidity(message),
        reportValidity: () => textareaRef.current?.reportValidity() ?? true,
      }),
      []
    );

    useImperativeHandle(ref, () => handle, [handle]);

    const setTags = (next: string[]) => {
      tagsRef.current = next;
      setTagsState(next);
      onChange?.({ target: { name, value: next }, type: "change" });
    };

    const addTags = (candidates: string[]) => {
      const current = tagsRef.current;
      const next = [...current];
      candidates
        .map((candidate) => candidate.trim())
        .filter(Boolean)
        .forEach((candidate) => {
          if (!next.includes(candidate)) next.push(candidate);
        });
      if (next.length !== current.length) setTags(next);
    };

    const removeTag = (index: number) => {
      setTags(tagsRef.current.filter((_, i) => i !== index));
    };

    // Any whitespace completes the text before it. Also handles pasting
    // several space-separated values at once.
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const parts = e.target.value.split(/\s+/);
      const remainder = parts.pop() ?? "";
      if (parts.length) addTags(parts);
      setDraft(remainder);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      if (e.key === "Enter") {
        e.preventDefault();
        addTags([draft]);
        setDraft("");
        return;
      }

      if (e.key === "Backspace" && draft === "" && tagsRef.current.length) {
        e.preventDefault();
        removeTag(tagsRef.current.length - 1);
      }
    };

    // Commit whatever is left so a final value isn't lost on submit.
    const handleBlur = (_e: FocusEvent<HTMLTextAreaElement>) => {
      if (draft.trim()) addTags([draft]);
      setDraft("");
      onBlur?.({ target: { name, value: tagsRef.current }, type: "blur" });
    };

    return (
      <div className={cn(action && "grid grid-cols-[1fr_100px] gap-1")}>
        <InputWrapper
          label={label}
          description={description}
          error={error}
          className={className}
          labelPosition={labelPosition}
        >
          <div className="flex flex-col gap-2 w-full">
            <label className="relative form-control w-full">
              <div className="relative">
                <TextareaComponent
                  ref={textareaRef}
                  {...rest}
                  rows={rows}
                  disabled={disabled}
                  value={draft}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  placeholder={placeholder}
                  darkMode={darkTheme}
                  variant={variant}
                  hasError={!!error}
                  autoComplete="off"
                />
                {icon && (
                  <div className="pointer-events-none w-8 h-8 absolute transform right-0 top-3">
                    <span className="text-icon-primary">{icon}</span>
                  </div>
                )}
              </div>
            </label>

            {tags.length > 0 && (
              <ul className="flex flex-wrap gap-1" aria-label="Added values">
                {tags.map((tag, index) => (
                  <li key={tag} className="max-w-full">
                    <TagComponent variant={variant}>
                      <span className="truncate">{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        disabled={disabled}
                        aria-label={`Remove ${tag}`}
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
                    </TagComponent>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </InputWrapper>
        {action && (
          <div className={cn("self-start ", label ? "mt-[26px]" : "")}>
            {action}
          </div>
        )}
      </div>
    );
  }
);

AppTagsInput.displayName = "AppTagsInput";

export { AppTagsInput };