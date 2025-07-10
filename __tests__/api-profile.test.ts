import { PUT } from "@/app/api/profile/route";
import { NextResponse } from "next/server";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      ...data,
      json: () => Promise.resolve(data),
    })),
  },
}));

const getValidProfileData = () => ({
  username: "validuser",
  fullName: "Valid User",
  email: "valid@email.com",
  phone: "1234567890",
});

describe("API /api/profile", () => {
  beforeEach(() => {
    (NextResponse.json as jest.Mock).mockClear();
  });

  it("should return 400 if username is too short", async () => {
    const invalidData = { ...getValidProfileData(), username: "short" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { username: "Username must be at least 6 characters." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if fullName is missing", async () => {
    const invalidData = { ...getValidProfileData(), fullName: "" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { fullName: "Full name is required." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if email is missing", async () => {
    const invalidData = { ...getValidProfileData(), email: "" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { email: "Must be a valid email format." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if email format is invalid", async () => {
    const invalidData = { ...getValidProfileData(), email: "invalid-email" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { email: "Must be a valid email format." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if email is missing @ symbol", async () => {
    const invalidData = { ...getValidProfileData(), email: "invalidemail.com" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { email: "Must be a valid email format." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if email is missing domain", async () => {
    const invalidData = { ...getValidProfileData(), email: "user@" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { email: "Must be a valid email format." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if phone is missing", async () => {
    const invalidData = { ...getValidProfileData(), phone: "" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { phone: "Phone must be 10-15 digits." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if phone is too short (less than 10 digits)", async () => {
    const invalidData = { ...getValidProfileData(), phone: "123456789" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { phone: "Phone must be 10-15 digits." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if phone is too long (more than 15 digits)", async () => {
    const invalidData = { ...getValidProfileData(), phone: "1234567890123456" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { phone: "Phone must be 10-15 digits." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if phone contains non-digit characters", async () => {
    const invalidData = { ...getValidProfileData(), phone: "123-456-7890" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { phone: "Phone must be 10-15 digits." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if phone contains letters", async () => {
    const invalidData = { ...getValidProfileData(), phone: "12345abcde" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { phone: "Phone must be 10-15 digits." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if birth date is in the future", async () => {
    // Use a fixed future date to avoid timezone issues
    const futureDate = "2030-01-01"; // New Year 2030 - definitely in the future
    
    const invalidData = { ...getValidProfileData(), birthDate: futureDate };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { birthDate: "Birth date cannot be in the future." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if birth date is exactly tomorrow", async () => {
    // Use a fixed future date to avoid timezone issues
    const futureDate = "2025-12-25"; // Christmas 2025 - definitely in the future
    
    const invalidData = { ...getValidProfileData(), birthDate: futureDate };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { birthDate: "Birth date cannot be in the future." },
      },
      { status: 400 }
    );
  });

  it("should return 200 if birth date is today", async () => {
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];
    
    const validData = { ...getValidProfileData(), birthDate: todayDate };
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should return 200 if birth date is in the past", async () => {
    const pastDate = "1990-01-01";
    
    const validData = { ...getValidProfileData(), birthDate: pastDate };
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should return 200 if birth date is not provided (optional field)", async () => {
    const validData = { ...getValidProfileData(), birthDate: "" };
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should return 400 if bio is longer than 160 characters", async () => {
    const longBio = "a".repeat(161); // 161 characters, exceeds the 160 limit
    const invalidData = { ...getValidProfileData(), bio: longBio };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { bio: "Bio must be 160 characters or less." },
      },
      { status: 400 }
    );
  });

  it("should return 200 if bio is exactly 160 characters", async () => {
    const maxBio = "a".repeat(160); // Exactly 160 characters
    const validData = { ...getValidProfileData(), bio: maxBio };
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should return 200 on valid data", async () => {
    const validData = getValidProfileData();
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });
});
