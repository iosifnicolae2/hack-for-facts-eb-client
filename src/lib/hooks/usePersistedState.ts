import { useEffect, useState } from "react";

export const usePersistedState = <T>(key: string, initialValue: T) => {
    const [value, setValue] = useState<T>(() => {
        const storedValue = localStorage.getItem(key);
        try {
            return storedValue ? JSON.parse(storedValue) : initialValue;
        } catch (error) {
            console.error(`Error parsing stored value for key ${key}:`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue] as const;
};