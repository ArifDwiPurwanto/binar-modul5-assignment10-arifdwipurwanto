import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  if (!password) {
    return NextResponse.json(
      { error: "Password is required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  // Mock authentication logic
  if (email === "test@example.com" && password === "password123") {
    return NextResponse.json({ message: "Login successful!" });
  }

  return NextResponse.json(
    { error: "Invalid credentials." },
    { status: 401 }
  );
}
