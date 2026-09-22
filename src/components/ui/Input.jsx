"use client";

import { forwardRef, useId } from "react";
import { Icon } from "./Icon";

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = "",
      id,
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
            {required && <span className="text-destructive ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`input ${error ? "input-error" : ""} ${className}`}
          {...props}
        />
        {error && (
          <p id={errorId} className="error-text" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="help-text">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = "",
      id,
      required = false,
      disabled = false,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || `textarea-${generatedId}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="label">
            {label}
            {required && <span className="text-destructive ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          rows={rows}
          className={`input resize-none ${error ? "input-error" : ""} ${className}`}
          {...props}
        />
        {error && (
          <p id={errorId} className="error-text" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="help-text">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = "",
      id,
      required = false,
      disabled = false,
      options = [],
      placeholder,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || `select-${generatedId}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="label">
            {label}
            {required && <span className="text-destructive ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`input appearance-none pr-10 ${error ? "input-error" : ""} ${className}`}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label || opt.value}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground">
            <Icon name="chevronDown" size="sm" className="text-muted-foreground" aria-hidden="true" />
          </div>
        </div>
        {error && (
          <p id={errorId} className="error-text" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="help-text">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Input;