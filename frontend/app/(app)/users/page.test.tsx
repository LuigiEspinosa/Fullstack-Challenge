/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import UsersPage from "./page";

vi.mock("@/lib/api", () => ({
  getReqResUsers: vi.fn(),
  getSavedUsers: vi.fn(),
}));
import { getReqResUsers, getSavedUsers } from "@/lib/api";

const mockUser = {
  id: 1,
  email: "george.bluth@reqres.in",
  first_name: "George",
  last_name: "Bluth",
  avatar: "https://reqres.in/img/faces/1-image.jpg",
};

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

describe("UsersPage", () => {
  beforeEach(() => {
    vi.mocked(getReqResUsers).mockResolvedValue({
      page: 1,
      total_pages: 2,
      total: 12,
      per_page: 6,
      data: [mockUser],
    });
    vi.mocked(getSavedUsers).mockResolvedValue({ data: [] });
  });

  it("disables the Previous button when on page 1", async () => {
    render(<UsersPage />, { wrapper: makeWrapper() });
    const prev = await screen.findByRole("button", { name: /previous/i });
    expect(prev).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled();
  });

  it("disables the Next button when on the last page", async () => {
    vi.mocked(getReqResUsers)
      .mockResolvedValueOnce({
        page: 1,
        total_pages: 2,
        total: 12,
        per_page: 6,
        data: [mockUser],
      })
      .mockResolvedValueOnce({
        page: 2,
        total_pages: 2,
        total: 12,
        per_page: 6,
        data: [mockUser],
      });

    const user = userEvent.setup();
    render(<UsersPage />, { wrapper: makeWrapper() });

    await user.click(await screen.findByRole("button", { name: /next/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /next/i })).toBeDisabled(),
    );
    expect(
      screen.getByRole("button", { name: /previous/i }),
    ).not.toBeDisabled();
  });

  it("shows SavedBadge only for users present in the local DB", async () => {
    vi.mocked(getSavedUsers).mockResolvedValue({
      data: [
        {
          ...mockUser,
          role: "USER" as const,
          saved_at: new Date().toISOString(),
        },
      ],
    });
    render(<UsersPage />, { wrapper: makeWrapper() });
    const badge = await screen.findByText("Saved locally");
    expect(badge).toBeInTheDocument();
  });

  it("does not show SavedBadge for users that have not been saved", async () => {
    render(<UsersPage />, { wrapper: makeWrapper() });
    await screen.findByRole("button", { name: /previous/i });
    expect(screen.queryByText("Saved locally")).not.toBeInTheDocument();
  });

  it("filters the visible cards by search input", async () => {
    vi.mocked(getReqResUsers).mockResolvedValue({
      page: 1,
      total_pages: 1,
      total: 2,
      per_page: 6,
      data: [
        mockUser,
        {
          id: 2,
          email: "janet.weaver@reqres.in",
          first_name: "Janet",
          last_name: "Weaver",
          avatar: "",
        },
      ],
    });

    const user = userEvent.setup();
    render(<UsersPage />, { wrapper: makeWrapper() });

    await screen.findByText("George Bluth");
    await user.type(screen.getByPlaceholderText(/search/i), "Janet");

    expect(screen.getByText("Janet Weaver")).toBeInTheDocument();
    expect(screen.queryByText("George Bluth")).not.toBeInTheDocument();
  });
});
