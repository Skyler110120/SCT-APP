import { Redirect, useLocalSearchParams } from "expo-router";
import React from "react";

/** Legacy path: redirect /join/sms?token= to /join?token= so email invite links work. */
export default function JoinSmsRedirect() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const q = token ? `?token=${encodeURIComponent(typeof token === "string" ? token : token?.[0] ?? "")}` : "";
  return <Redirect href={`/join${q}`} />;
}
