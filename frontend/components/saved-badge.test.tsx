/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SavedBadge } from "./saved-badge";

describe("SavedBadge", () => {
  it('renders the "Saved locally" label', () => {
    render(<SavedBadge />);
    expect(screen.getByText("Saved locally")).toBeInTheDocument();
  });
});
