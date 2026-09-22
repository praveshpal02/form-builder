"use client";

import { forwardRef, useId } from "react";

export const Toggle = forwardRef(
  (
    {
      checked = false,
      onChange,
      disabled = false,
      id,
      className = "",
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const toggleId = id || generatedId;

    return (
      <label
        htmlFor={toggleId}
        className={`inline-flex items-center cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        {...props}
      >
        <input
          ref={ref}
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={(e) => !disabled && onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
          aria-label={ariaLabel}
        />
        <div className="toggle-track" aria-hidden="true" />
      </label>
    );
  }
);

Toggle.displayName = "Toggle";

export const ToggleSwitch = ({ checked, onChange, disabled = false, id, "aria-label": ariaLabel, ...props }) => (
  <Toggle
    checked={checked}
    onChange={onChange}
    disabled={disabled}
    id={id}
    aria-label={ariaLabel}
    {...props}
  />
);

export default Toggle;