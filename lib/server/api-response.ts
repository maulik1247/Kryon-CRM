import { NextResponse } from "next/server";
import { AuthError } from "@/lib/server/auth-session";

export function apiError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Error) {
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message === "Not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export function apiJson<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
