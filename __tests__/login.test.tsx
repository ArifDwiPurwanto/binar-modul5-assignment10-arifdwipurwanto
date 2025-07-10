import "@testing-library/jest-dom";
import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import LoginPage from "../src/app/login/page"; // Adjusted the import path to match the workspace structure

describe("LoginPage", () => {
  beforeEach(() => {
    global.fetch = jest.fn((input, init) => {
      const body = init && init.body ? JSON.parse(init.body.toString()) : {};
      if (body.email === 'test@example.com' && body.password === 'password123') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Login successful!' }),
          // minimal Response shape
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          redirected: false,
          type: 'basic',
          url: '',
          clone: () => this,
          body: null,
          bodyUsed: false,
          arrayBuffer: async () => new ArrayBuffer(0),
          blob: async () => new Blob(),
          formData: async () => new FormData(),
          text: async () => '',
        } as Response);
      } else {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Invalid credentials' }),
          status: 401,
          statusText: 'Unauthorized',
          headers: new Headers(),
          redirected: false,
          type: 'basic',
          url: '',
          clone: () => this,
          body: null,
          bodyUsed: false,
          arrayBuffer: async () => new ArrayBuffer(0),
          blob: async () => new Blob(),
          formData: async () => new FormData(),
          text: async () => '',
        } as Response);
      }
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should handle login form submission", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    // Use a more specific label to avoid multiple matches
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Instead of checking for a toast, check for a successful login message or UI change
    await waitFor(() => {
      // Use a flexible matcher to find the toast or any element containing 'login successful'
      expect(
        screen.getByText((content) =>
          content.toLowerCase().includes('login successful')
        )
      ).toBeInTheDocument();
    });
  });

  it("should show error if email is missing", async () => {
    render(<LoginPage />);
    // Only fill password, leave email empty
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    // Check for the email required error message
    expect(
      screen.getByText((content) =>
        content.toLowerCase().includes("email is required")
      )
    ).toBeInTheDocument();
  });

  it("should show error if password is less than 6 characters", async () => {
    render(<LoginPage />);
    // Only fill email, use short password
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    // Check for the password length error message
    expect(
      screen.getByText((content) =>
        content.toLowerCase().includes("password must be at least 6 characters")
      )
    ).toBeInTheDocument();
  });

  it("should show success toast on successful login", async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    // Wait for the success toast or message
    await waitFor(() => {
      expect(
        screen.getByText((content) =>
          content.toLowerCase().includes("login successful")
        )
      ).toBeInTheDocument();
    });
  });

  it("should show error toast on failed login", async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalid@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    // Wait for the error toast or message
    await waitFor(() => {
      expect(
        screen.getByText((content) =>
          content.toLowerCase().includes("an error occurred") ||
          content.toLowerCase().includes("invalid") ||
          content.toLowerCase().includes("error")
        )
      ).toBeInTheDocument();
    });
  });

  it("should show success toast on successful login and error toast on failed login", async () => {
    render(<LoginPage />);
    // Success case
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    await waitFor(() => {
      expect(
        screen.getByText((content) =>
          content.toLowerCase().includes("login successful")
        )
      ).toBeInTheDocument();
    });
    // Error case
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalid@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    await waitFor(() => {
      expect(
        screen.getByText((content) =>
          content.toLowerCase().includes("an error occurred") ||
          content.toLowerCase().includes("invalid") ||
          content.toLowerCase().includes("error")
        )
      ).toBeInTheDocument();
    });
  });

  it("should toggle password visibility when show/hide button is clicked", () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const toggleButton = screen.getByRole("button", {
      name: /show password|hide password/i,
    });
    // Initially should be type password
    expect(passwordInput).toHaveAttribute("type", "password");
    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    // Click again to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should show default error toast if API returns no message", async () => {
    // Mock fetch to return an error without a message
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
        redirected: false,
        type: 'basic',
        url: '',
        clone: () => undefined,
        body: null,
        bodyUsed: false,
        arrayBuffer: async () => new ArrayBuffer(0),
        blob: async () => new Blob(),
        formData: async () => new FormData(),
        text: async () => '',
      } as unknown as Response)
    );
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "noerror@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "somepassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    await waitFor(() => {
      expect(
        screen.getByText((content) =>
          content.toLowerCase().includes("an error occurred")
        )
      ).toBeInTheDocument();
    });
  });
});