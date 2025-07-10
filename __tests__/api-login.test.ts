/**
 * @jest-environment node
 */
import { POST } from "@/app/api/login/route";
import { NextRequest } from "next/server";

describe("POST /api/login", () => {
  it("should return 400 if email is missing", async () => {
    const request = new NextRequest("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({ password: "password123" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Email is required");
  });

  // Unit test for POST /api/login if email is provided
  it("should return 400 if password is missing", async () => {
    const request = new NextRequest("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Password is required");
  });

  it("should return 400 if password is less than 6 characters", async () => {
    const request = new NextRequest("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "12345" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Password must be at least 6 characters.");
  });

  it("should return 200 and success message if email and password are correct", async () => {
    const request = new NextRequest("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "password123" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("Login successful!");
  });

  it("should return 401 and error message for invalid credentials", async () => {
    const request = new NextRequest("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({ email: "wrong@example.com", password: "wrongpassword" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Invalid credentials.");
  });
});
