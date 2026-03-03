import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
}));

vi.mock("next/image", () => ({
  default: (_props: unknown) => null,
}));

vi.mock("@/hooks/use-gsap-context", () => ({
  useGsapContext: () => ({ current: null }),
}));
