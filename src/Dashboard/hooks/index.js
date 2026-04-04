import React, { useCallback, useRef, useEffect } from "react";

export const useDebounce = (callback, delay = 500) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return debouncedCallback;
};

export const usePagination = (items, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = useCallback(
    (page) => {
      setCurrentPage(Math.min(Math.max(1, page), totalPages));
    },
    [totalPages],
  );

  const nextPage = useCallback(
    () => goToPage(currentPage + 1),
    [currentPage, goToPage],
  );
  const prevPage = useCallback(
    () => goToPage(currentPage - 1),
    [currentPage, goToPage],
  );

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
  };
};

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = window?.localStorage?.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window?.localStorage?.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
};

export const useAsync = (asyncFunction, immediate = true) => {
  const [state, setState] = React.useState({
    status: "idle",
    data: null,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ status: "pending", data: null, error: null });
    try {
      const response = await asyncFunction();
      setState({ status: "success", data: response, error: null });
      return response;
    } catch (error) {
      setState({ status: "error", data: null, error });
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
};

export const useFetch = (url) => {
  const [state, setState] = React.useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setState({ data: null, loading: true, error: null });
        // Simulated fetch - replace with actual fetch
        const response = await fetch(url);
        const data = await response.json();

        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ data: null, loading: false, error });
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
};
