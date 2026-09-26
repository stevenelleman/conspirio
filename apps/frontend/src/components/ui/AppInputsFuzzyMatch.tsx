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
  useId,
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

const SuggestionList = classed.ul(
  "absolute left-0 right-0 top-full mt-1 z-10 max-h-60 overflow-auto rounded-[7px] py-1 shadow-sm",
  {
    variants: {
      variant: {
        primary: "bg-surface-primary border border-stroke-secondary",
        secondary: "bg-surface-quaternary border border-stroke-secondary",
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
 * Receives the current text and the options that haven't been added yet.
 * Returns the matching options, best match first.
 */
export type FuzzySearchFn = (query: string, options: string[]) => string[];

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
  /**
   * When provided, suggestions are shown while typing and only values
   * from `options` can be added.
   */
  fuzzySearch?: FuzzySearchFn;
  /** The allowed values. Only used together with `fuzzySearch`. */
  options?: string[];
  maxSuggestions?: number;
  icon?: React.ReactNode;
  labelPosition?: "top" | "left";
  action?: ReactNode;
}

const NO_OPTIONS: string[] = [];

const formatRejected = (values: string[]) => {
  const quoted = values.map((value) => `"${value}"`).join(", ");
  return values.length === 1
    ? `${quoted} isn't in the list.`
    : `${quoted} aren't in the list.`;
};

const AppInputsFuzzyMatch = forwardRef<TagsInputHandle, TagsInputProps>(
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
      onFocus,
      onKeyDown,
      disabled,
      rows = 1,
      fuzzySearch,
      options = NO_OPTIONS,
      maxSuggestions = 8,
      ...rest
    } = props;
    const { darkTheme } = useSettings();
    const listboxId = useId();
    const isRestricted = !!fuzzySearch;

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [tags, setTagsState] = useState<string[]>(defaultValue ?? []);
    const tagsRef = useRef<string[]>(tags);
    const [draft, setDraft] = useState("");
    const [rejected, setRejected] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [highlight, setHighlight] = useState(0);

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

    // Case-insensitive lookup so "github" resolves to the option "GitHub".
    const optionLookup = useMemo(
      () => new Map(options.map((option) => [option.toLowerCase(), option])),
      [options]
    );

    const suggestions = useMemo(() => {
      const query = draft.trim();
      if (!fuzzySearch || !query) return [];
      const available = options.filter((option) => !tags.includes(option));
      return fuzzySearch(query, available).slice(0, maxSuggestions);
    }, [fuzzySearch, draft, options, tags, maxSuggestions]);

    const listOpen = isRestricted && isOpen && suggestions.length > 0;
    const activeIndex = Math.min(highlight, suggestions.length - 1);

    /** Returns the value to store, or null if it isn't allowed. */
    const resolve = (raw: string): string | null => {
      const value = raw.trim();
      if (!value) return null;
      if (!isRestricted) return value;
      return optionLookup.get(value.toLowerCase()) ?? null;
    };

    const setTags = (next: string[]) => {
      tagsRef.current = next;
      setTagsState(next);
      onChange?.({ target: { name, value: next }, type: "change" });
    };

    /** Adds every allowed candidate and returns the ones that weren't. */
    const addTags = (candidates: string[]): string[] => {
      const current = tagsRef.current;
      const next = [...current];
      const notAllowed: string[] = [];

      candidates.forEach((candidate) => {
        const trimmed = candidate.trim();
        if (!trimmed) return;
        const value = resolve(trimmed);
        if (value === null) {
          notAllowed.push(trimmed);
        } else if (!next.includes(value)) {
          next.push(value);
        }
      });

      if (next.length !== current.length) setTags(next);
      return notAllowed;
    };

    /** Commits the current text, keeping it in place if it isn't allowed. */
    const commitDraft = () => {
      if (!draft.trim()) {
        setDraft("");
        return;
      }
      const notAllowed = addTags([draft]);
      setRejected(notAllowed);
      if (!notAllowed.length) setDraft("");
    };

    const selectSuggestion = (option: string) => {
      addTags([option]);
      setDraft("");
      setRejected([]);
      setIsOpen(false);
      textareaRef.current?.focus();
    };

    const removeTag = (index: number) => {
      setTags(tagsRef.current.filter((_, i) => i !== index));
    };

    // Any whitespace completes the text before it. Also handles pasting
    // several space-separated values at once. A value that isn't allowed
    // stays in the textarea so it can be corrected.
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const parts = e.target.value.split(/\s+/);
      const remainder = parts.pop() ?? "";
      const notAllowed = parts.length ? addTags(parts) : [];

      setRejected(notAllowed);
      setDraft(
        !remainder && notAllowed.length
          ? notAllowed[notAllowed.length - 1]
          : remainder
      );
      setIsOpen(true);
      setHighlight(0);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      if (listOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        const step = e.key === "ArrowDown" ? 1 : -1;
        setHighlight(
          (activeIndex + step + suggestions.length) % suggestions.length
        );
        return;
      }

      if (listOpen && e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (listOpen && suggestions[activeIndex]) {
          selectSuggestion(suggestions[activeIndex]);
        } else {
          commitDraft();
        }
        return;
      }

      if (e.key === "Backspace" && draft === "" && tagsRef.current.length) {
        e.preventDefault();
        removeTag(tagsRef.current.length - 1);
      }
    };

    const handleFocus = (e: FocusEvent<HTMLTextAreaElement>) => {
      onFocus?.(e);
      setIsOpen(true);
    };

    // Commit whatever is left so a final value isn't lost on submit.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleBlur = (_e: FocusEvent<HTMLTextAreaElement>) => {
      commitDraft();
      setIsOpen(false);
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
            <div className="relative">
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
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    darkMode={darkTheme}
                    variant={variant}
                    hasError={!!error || rejected.length > 0}
                    autoComplete="off"
                    role={isRestricted ? "combobox" : undefined}
                    aria-autocomplete={isRestricted ? "list" : undefined}
                    aria-expanded={isRestricted ? listOpen : undefined}
                    aria-controls={isRestricted ? listboxId : undefined}
                    aria-activedescendant={
                      listOpen ? `${listboxId}-${activeIndex}` : undefined
                    }
                  />
                  {icon && (
                    <div className="pointer-events-none w-8 h-8 absolute transform right-0 top-3">
                      <span className="text-icon-primary">{icon}</span>
                    </div>
                  )}
                </div>
              </label>

              {listOpen && (
                <SuggestionList
                  id={listboxId}
                  role="listbox"
                  variant={variant}
                >
                  {suggestions.map((option, index) => (
                    <li
                      key={option}
                      id={`${listboxId}-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      // Keep focus in the textarea so blur doesn't fire first.
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectSuggestion(option)}
                      onMouseEnter={() => setHighlight(index)}
                      className={cn(
                        "cursor-pointer px-3 py-1.5 text-sm leading-[20px] text-label-primary truncate",
                        index === activeIndex && "bg-surface-quaternary"
                      )}
                    >
                      {option}
                    </li>
                  ))}
                </SuggestionList>
              )}
            </div>

            {rejected.length > 0 && (
              <p className="text-xs leading-[16px] text-error" role="alert">
                {formatRejected(rejected)}
              </p>
            )}

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

AppInputsFuzzyMatch.displayName = "AppTagsInput";

export { AppInputsFuzzyMatch };
