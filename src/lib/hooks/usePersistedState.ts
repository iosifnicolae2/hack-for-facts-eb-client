import { useEffect, useState } from "react";

export const usePersistedState = <T>(key: string, initialValue: T) => {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const storedValue = window.localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : initialValue;
        } catch (error) {
            console.error(`Error parsing stored value for key ${key}:`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue] as const;
};

export const getPersistedState = <T>(key: string, initialValue: T) => {
    if (typeof window === 'undefined') return initialValue;
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialValue;
};
