import "@testing-library/jest-dom";
import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import PasswordPage from "../src/app/password/page";

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  toast: {
    loading: jest.fn(() => "toast-id"),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { toast } from "react-hot-toast";
const mockToast = toast as jest.Mocked<typeof toast>;

describe("PasswordPage", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock fetch with different responses based on request body
    global.fetch = jest.fn((input, init) => {
      const body = init && init.body ? JSON.parse(init.body.toString()) : {};
      const authHeader = init?.headers?.["Authorization"] || "";
      
      // Check authorization
      if (!authHeader) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: "Authorization token is required" }),
        } as Response);
      }
      
      if (authHeader === "Bearer invalid-token") {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: "Invalid or expired token" }),
        } as Response);
      }
      
      // Validation checks
      if (!body.currentPassword) {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: "Current password is required" }),
        } as Response);
      }
      
      if (!body.newPassword) {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: "New password is required" }),
        } as Response);
      }
      
      if (!body.confirmPassword) {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: "Password confirmation is required" }),
        } as Response);
      }
      
      if (body.newPassword.length < 6) {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: "New password must be at least 6 characters" }),
        } as Response);
      }
      
      if (body.newPassword !== body.confirmPassword) {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: "New password and confirm password do not match" }),
        } as Response);
      }
      
      if (body.newPassword === body.currentPassword) {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: "New password must be different from current password" }),
        } as Response);
      }
      
      if (body.currentPassword === "wrongpassword") {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: "Current password is incorrect" }),
        } as Response);
      }
      
      if (body.newPassword === "weakpass") {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" }),
        } as Response);
      }
      
      // Success case
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: "Password changed successfully" }),
      } as Response);
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render password change form with all required fields", () => {
    render(<PasswordPage />);
    
    expect(screen.getByRole("heading", { name: "Change Password" })).toBeInTheDocument();
    expect(screen.getByLabelText("Current Password")).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change Password" })).toBeInTheDocument();
  });

  it("should show error if current password is missing", async () => {
    render(<PasswordPage />);
    
    // Fill only new password fields, leave current password empty
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "newpassword123" },
    });
    
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));
    
    expect(screen.getByText("Current password is required.")).toBeInTheDocument();
  });

  it("should show error if new password is missing", async () => {
    render(<PasswordPage />);
    
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "oldpassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "newpassword123" },
    });
    
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));
    
    expect(screen.getByText("New password is required.")).toBeInTheDocument();
  });

  it("should show error if confirm password is missing", async () => {
    render(<PasswordPage />);
    
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "oldpassword123" },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "newpassword123" },
    });
    
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));
    
    expect(screen.getByText("Password confirmation is required.")).toBeInTheDocument();
  });

  it("should show error if new password is less than 6 characters", async () => {
    render(<PasswordPage />);
    
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "oldpassword123" },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "12345" },
    });
    
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));
    
    expect(screen.getByText("New password must be at least 6 characters.")).toBeInTheDocument();
  });

  it("should show error if passwords don't match", async () => {
    render(<PasswordPage />);
    
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "oldpassword123" },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "differentpassword123" },
    });
    
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));
    
    expect(screen.getByText("New password and confirm password do not match.")).toBeInTheDocument();
  });

  it("should show error if new password is same as current password", async () => {
    render(<PasswordPage />);
    
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "samepassword123" },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "samepassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "samepassword123" },
    });
    
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));
    
    expect(screen.getByText("New password must be different from current password.")).toBeInTheDocument();
  });

  it("should toggle password visibility for all password fields", () => {
    const { container } = render(<PasswordPage />);
    
    // Get inputs by their IDs directly from container
    const currentPasswordInput = container.querySelector("#currentPassword") as HTMLInputElement;
    const newPasswordInput = container.querySelector("#newPassword") as HTMLInputElement;
    const confirmPasswordInput = container.querySelector("#confirmPassword") as HTMLInputElement;
    
    const currentPasswordToggle = screen.getByLabelText("Show current password");
    const newPasswordToggle = screen.getByLabelText("Show new password");
    const confirmPasswordToggle = screen.getByLabelText("Show confirm password");
    
    // Initially all should be type password
    expect(currentPasswordInput).toHaveAttribute("type", "password");
    expect(newPasswordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
    
    // Click to show passwords
    fireEvent.click(currentPasswordToggle);
    fireEvent.click(newPasswordToggle);
    fireEvent.click(confirmPasswordToggle);
    
    expect(currentPasswordInput).toHaveAttribute("type", "text");
    expect(newPasswordInput).toHaveAttribute("type", "text");
    expect(confirmPasswordInput).toHaveAttribute("type", "text");
    
    // Click again to hide passwords
    fireEvent.click(currentPasswordToggle);
    fireEvent.click(newPasswordToggle);
    fireEvent.click(confirmPasswordToggle);
    
    expect(currentPasswordInput).toHaveAttribute("type", "password");
    expect(newPasswordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  it("should show success toast and reset form on successful password change", async () => {
    render(<PasswordPage />);
    
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "oldpassword123" },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "newpassword123" },
    });
    
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));
    
    await waitFor(() => {
      expect(mockToast.loading).toHaveBeenCalledWith("Changing password...");
      expect(mockToast.success).toHaveBeenCalledWith("Password changed successfully!", { id: "toast-id" });
    });
    
    // Form should be reset
    expect(screen.getByLabelText("Current Password")).toHaveValue("");
    expect(screen.getByLabelText("New Password")).toHaveValue("");
    expect(screen.getByLabelText("Confirm New Password")).toHaveValue("");
  });

  it("should show error toast on API error", async () => {
    render(<PasswordPage />);
    
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "newpassword123" },
    });
    
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));
    
    await waitFor(() => {
      expect(mockToast.loading).toHaveBeenCalledWith("Changing password...");
      expect(mockToast.error).toHaveBeenCalledWith("Current password is incorrect", { id: "toast-id" });
    });
  });

  it("should show error toast on weak password", async () => {
    render(<PasswordPage />);
    
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "oldpassword123" },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "weakpass" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "weakpass" },
    });
    
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));
    
    await waitFor(() => {
      expect(mockToast.loading).toHaveBeenCalledWith("Changing password...");
      expect(mockToast.error).toHaveBeenCalledWith(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        { id: "toast-id" }
      );
    });
  });

  it("should show error toast on network error", async () => {
    // Mock fetch to throw an error
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Network error");
    });

    render(<PasswordPage />);
    
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "oldpassword123" },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "newpassword123" },
    });
    
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));
    
    await waitFor(() => {
      expect(mockToast.loading).toHaveBeenCalledWith("Changing password...");
      expect(mockToast.error).toHaveBeenCalledWith("Network error occurred.", { id: "toast-id" });
    });
  });

  it("should call API with correct parameters", async () => {
    render(<PasswordPage />);
    
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "oldpassword123" },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "newpassword123" },
    });
    
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-token",
        },
        body: JSON.stringify({
          currentPassword: "oldpassword123",
          newPassword: "newpassword123",
          confirmPassword: "newpassword123",
        }),
      });
    });
  });

  it("should show fallback error message when API returns error response without error message", async () => {
    // Mock fetch to return an error response without error message
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}), // Empty response object - no error message
      } as Response)
    );

    render(<PasswordPage />);
    
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "oldpassword123" },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "newpassword123" },
    });
    
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));
    
    await waitFor(() => {
      expect(mockToast.loading).toHaveBeenCalledWith("Changing password...");
      expect(mockToast.error).toHaveBeenCalledWith("An error occurred.", { id: "toast-id" });
    });
  });
});
