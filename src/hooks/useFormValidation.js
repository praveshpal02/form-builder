"use client";

import { useState, useCallback } from "react";

export function useFormValidation(initialValues = {}, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback(
    (name, value) => {
      const rule = validationRules[name];
      if (!rule) return "";

      if (rule.required && (!value || (typeof value === "string" && !value.trim()))) {
        return rule.message || `${name} is required`;
      }

      if (value && rule.pattern && !rule.pattern.test(value)) {
        return rule.message || `Invalid ${name}`;
      }

      if (value && rule.minLength && value.length < rule.minLength) {
        return rule.message || `${name} must be at least ${rule.minLength} characters`;
      }

      if (value && rule.maxLength && value.length > rule.maxLength) {
        return rule.message || `${name} must be at most ${rule.maxLength} characters`;
      }

      if (rule.custom) {
        return rule.custom(value, values);
      }

      return "";
    },
    [validationRules, values]
  );

  const handleChange = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      if (touched[name]) {
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (name) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name, values[name]);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField, values]
  );

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;
    Object.keys(validationRules).forEach((name) => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });
    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return isValid;
  }, [validateField, validationRules, values]);

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    validateField,
    reset,
    setFieldError,
    setValues,
  };
}

export default useFormValidation;