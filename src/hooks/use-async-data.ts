"use client";

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type DependencyList,
	type Dispatch,
	type SetStateAction,
} from "react";
import { getErrorMessage } from "@/lib/data";

type AsyncState<T> = {
	data: T | null;
	loading: boolean;
	error: string | null;
};

export function useAsyncData<T>(fetcher: () => Promise<T>, deps: DependencyList = []) {
	const fetcherRef = useRef(fetcher);
	fetcherRef.current = fetcher;

	const [state, setState] = useState<AsyncState<T>>({
		data: null,
		loading: true,
		error: null,
	});

	const reload = useCallback(async (): Promise<T | undefined> => {
		setState((previous) => ({ ...previous, loading: true, error: null }));
		try {
			const data = await fetcherRef.current();
			setState({ data, loading: false, error: null });
			return data;
		} catch (error) {
			const message = getErrorMessage(error, "Unable to load data right now.");
			setState((previous) => ({ ...previous, loading: false, error: message }));
			return undefined;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	useEffect(() => {
		void reload();
	}, [reload]);

	const setData: Dispatch<SetStateAction<T | null>> = (value) => {
		setState((previous) => ({
			...previous,
			data: typeof value === "function"
				? (value as (current: T | null) => T | null)(previous.data)
				: value,
		}));
	};

	return { ...state, reload, setData };
}
