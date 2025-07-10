/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePage from "@/app/profile/page";

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  toast: {
    loading: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { toast } from "react-hot-toast";
const mockToast = toast as jest.Mocked<typeof toast>;

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
    ok: true,
  })
) as jest.Mock;

describe("ProfilePage", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<ProfilePage />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Birth Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Update/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty/invalid fields", async () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    expect(
      await screen.findByText(/Username must be at least 6 characters/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Must be a valid email format/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Phone must be 10-15 digits/i)).toBeInTheDocument();
  });

  it("submits valid form and shows success message", async () => {
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/profile",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });
});

describe("ProfilePage uncovered lines", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    ) as jest.Mock;
  });

  it("shows error for short username", async () => {
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    expect(
      await screen.findByText(/username must be at least 6 characters/i)
    ).toBeInTheDocument();
  });

  it("shows error for empty full name", async () => {
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "validuser" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
  });

  it("shows error for invalid email", async () => {
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Valid Name" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "invalid" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    expect(await screen.findByText(/must be a valid email format/i)).toBeInTheDocument();
  });

  it("shows error for invalid phone", async () => {
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Valid Name" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "valid@email.com" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    expect(await screen.findByText(/phone must be 10-15 digits/i)).toBeInTheDocument();
  });

  it("shows error for future birth date", async () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Valid Name" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "valid@email.com" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "081234567890" },
    });
    fireEvent.change(screen.getByLabelText(/birth date/i), {
      target: { value: future.toISOString().slice(0, 10) },
    });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    expect(await screen.findByText(/birth date cannot be in the future/i)).toBeInTheDocument();
  });

  it("shows error for long bio", async () => {
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Valid Name" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "valid@email.com" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "081234567890" },
    });
    fireEvent.change(screen.getByLabelText(/bio/i), {
      target: { value: "a".repeat(161) },
    });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    expect(await screen.findByText(/bio must be 160 characters or less/i)).toBeInTheDocument();
  });

  it("accepts valid past birth date", async () => {
    const past = new Date();
    past.setFullYear(past.getFullYear() - 25); // 25 years ago
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Valid Name" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "valid@email.com" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "081234567890" },
    });
    fireEvent.change(screen.getByLabelText(/birth date/i), {
      target: { value: past.toISOString().slice(0, 10) },
    });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    
    // Should not show birth date error since it's a valid past date
    await waitFor(() => {
      expect(screen.queryByText(/birth date cannot be in the future/i)).not.toBeInTheDocument();
    });
  });

  it("accepts birth date as today", async () => {
    const today = new Date();
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Valid Name" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "valid@email.com" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "081234567890" },
    });
    fireEvent.change(screen.getByLabelText(/birth date/i), {
      target: { value: today.toISOString().slice(0, 10) },
    });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    
    // Should not show birth date error since today is valid
    await waitFor(() => {
      expect(screen.queryByText(/birth date cannot be in the future/i)).not.toBeInTheDocument();
    });
  });

  it("shows error toast on failed update with API error message", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "Custom error" }),
      })
    ) as jest.Mock;
    
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Valid Name" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "valid@email.com" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "081234567890" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    
    await waitFor(() => {
      expect(mockToast.loading).toHaveBeenCalledWith("Updating profile...");
      expect(mockToast.error).toHaveBeenCalledWith("Custom error", expect.objectContaining({ id: expect.any(String) }));
    });
  });

  it("shows fallback error toast on failed update without API error message", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}), // No message property
      })
    ) as jest.Mock;
    
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Valid Name" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "valid@email.com" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "081234567890" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    
    await waitFor(() => {
      expect(mockToast.loading).toHaveBeenCalledWith("Updating profile...");
      expect(mockToast.error).toHaveBeenCalledWith("An error occurred.", expect.objectContaining({ id: expect.any(String) }));
    });
  });
});
