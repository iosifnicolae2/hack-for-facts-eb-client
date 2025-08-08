import { useEffect, useState } from "react";
import { Chart } from "@/schemas/charts";

export const useChartAnimation = (delay: number = 500, chart: Chart) => {
    const [isAnimationActive, setIsAnimationActive] = useState(true);


    useEffect(() => {
        setIsAnimationActive(true);
        const timer = setTimeout(() => setIsAnimationActive(false), delay);
        return () => clearTimeout(timer);
    }, [delay, chart]);

    return { isAnimationActive, setIsAnimationActive };
};