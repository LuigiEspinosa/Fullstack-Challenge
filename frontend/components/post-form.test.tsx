/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { PostForm } from "./post-form";

vi.mock("@/lib/api", () => ({ getSavedUsers: vi.fn() }));
import { getSavedUsers } from "@/lib/api";

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );

  Wrapper.displayName = "TestQueryClientProvider";
  return Wrapper;
}

describe("PostForm", () => {
  beforeEach(() => {
    vi.mocked(getSavedUsers).mockResolvedValue({ data: [] });
  });

  it("shows a title validation error when the title is too short", async () => {
    const user = userEvent.setup();
    render(<PostForm onSubmit={vi.fn()} />, { wrapper: makeWrapper() });

    await user.type(screen.getByLabelText("Title"), "Hi");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(
        screen.getByText("Title must be at least 3 characters."),
      ).toBeInTheDocument(),
    );
  });

  it("surfaces onSubmit errors as a root from error", async () => {
    const user = userEvent.setup();
    vi.mocked(getSavedUsers).mockResolvedValue({
      data: [
        {
          id: 4,
          email: "eve.holt@reqres.in",
          first_name: "Eve",
          last_name: "Holt",
          avatar: "",
          role: "ADMIN",
          saved_at: new Date().toISOString(),
        },
      ],
    });

    render(
      <PostForm
        onSubmit={vi.fn().mockRejectedValue(new Error("Server failure."))}
      />,
      { wrapper: makeWrapper() },
    );

    await user.type(screen.getByLabelText("Title"), "Valid Title");
    await user.type(screen.getByLabelText("Content"), "Valid content here.");
    const select = await screen.findByRole("combobox");
    await user.selectOptions(select, "4");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(screen.getByText("Server failure.")).toBeInTheDocument(),
    );
  });

  it("shows a hint when no saved users exist yet", async () => {
    render(<PostForm onSubmit={vi.fn()} />, { wrapper: makeWrapper() });
    expect(await screen.findByText(/No saved user yet/)).toBeInTheDocument();
  });
});
