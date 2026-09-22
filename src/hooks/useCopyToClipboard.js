"use client";

import { useState, useCallback } from "react";

export function useCopyToClipboard({ timeout = 2000 } = {}) {
  const [copiedId, setCopiedId] = useState(null);

  const copy = useCallback(async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const input = document.createElement("input");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), timeout);
    }
  }, [timeout]);

  const isCopied = useCallback(
    (id) => copiedId === id,
    [copiedId]
  );

  return { copy, copiedId, isCopied };
}

export default useCopyToClipboard;