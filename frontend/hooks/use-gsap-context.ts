import gsap from "gsap";
import { useEffect, useRef } from "react";

export function useGsapContext<T extends HTMLElement>(fn: (ctx: gsap.Context) => void) {
	const ref = useRef<T>(null);

	useEffect(() => {
		const ctx = gsap.context(fn, ref);
		return () => ctx.revert();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return ref;
}
