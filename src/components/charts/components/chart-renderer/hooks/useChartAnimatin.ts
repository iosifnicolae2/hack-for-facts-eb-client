import { useEffect, useState } from "react";

export const useChartAnimation = (delay: number = 500) => {
    const [isAnimationActive, setIsAnimationActive] = useState(true);


    useEffect(() => {
        const timer = setTimeout(() => setIsAnimationActive(false), delay);

        return () => clearTimeout(timer);
    }, [delay]);

    return { isAnimationActive, setIsAnimationActive };
};