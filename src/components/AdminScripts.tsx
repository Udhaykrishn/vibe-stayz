"use client";
import { useEffect } from "react";
export default function AdminScripts() {
  useEffect(() => {
    void import("@/scripts/admin");
  }, []);
  return null;
}
