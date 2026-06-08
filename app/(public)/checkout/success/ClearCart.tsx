"use client";

import { useEffect } from "react";

export function ClearCart() {
  useEffect(() => {
    localStorage.removeItem("pl_cart");
  }, []);

  return null;
}
