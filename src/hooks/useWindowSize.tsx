import { useEffect, useState } from "react";

export function useWindowSize() {
    const [width, setWindowWidth] = useState(window.innerWidth);
    const [height, setWindowHeight] = useState(window.innerHeight);
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    return { width, height };
}