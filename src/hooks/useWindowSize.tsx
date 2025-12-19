import { useEffect, useState } from "react";

export function useWindowSize() {
    const hasWindow = typeof window !== "undefined";
    const [size, setSize] = useState(() => ({
        width: hasWindow ? window.innerWidth : 0,
        height: hasWindow ? window.innerHeight : 0,
    }));

    useEffect(() => {
        if (!hasWindow) return;
        const handleResize = () => {
            setSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [hasWindow]);

    return size;
}
