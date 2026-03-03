/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";
import LoginPage from "./page";

vi.mock("@/lib/api", () => ({ login: vi.fn() }));
import { login } from "@/lib/api";

describe("LoginPage", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    mockPush.mockClear();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);
  });

  it("shows an error paragraph when login fails", async () => {
    vi.mocked(login).mockRejectedValue(new Error("Invalid credentials."));
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "nobody@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText("Invalid credentials.")).toBeInTheDocument(),
    );
  });

  it("disables the button and changes label while submitting", async () => {
    vi.mocked(login).mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "eve.holt@reqres.in");
    await user.type(screen.getByLabelText("Password"), "pistol");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /signing in/i }),
      ).toBeDisabled(),
    );
  });

  it("shows a Zod validation error for an invalid email format", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "notanemail");
    await user.type(screen.getByLabelText("Password"), "pass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText("Enter a valid email.")).toBeInTheDocument(),
    );
  });

  it("navigates to /dashboard on successful login", async () => {
    vi.mocked(login).mockResolvedValue({
      data: { message: "Login successful.", role: "USER" },
    });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "george.bluth@reqres.in");
    await user.type(screen.getByLabelText("Password"), "hunter2");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
  });
});
