"use client";

import { useEffect } from "react";

export default function AuthPage() {
  useEffect(() => {
    // Redirect to login page
    window.location.replace("/auth/login");
  }, []);

  return null;
}
