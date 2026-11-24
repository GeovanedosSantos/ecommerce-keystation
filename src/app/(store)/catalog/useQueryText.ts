'use client'
import { useState } from "react";

/** Texto local do campo, que volta a mostrar o valor da URL quando ela muda. */
export function useQueryText(fromQuery: string) {
  const [text, setText] = useState(fromQuery);
  const [lastFromQuery, setLastFromQuery] = useState(fromQuery);

  if (fromQuery !== lastFromQuery) {
    setLastFromQuery(fromQuery);
    setText(fromQuery);
  }

  return [text, setText] as const;
}
