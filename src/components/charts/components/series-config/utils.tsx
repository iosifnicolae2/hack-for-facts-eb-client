import { DivideIcon, Minus, Sigma, X } from 'lucide-react';
import { Operation } from "@/schemas/charts";

export const operationIcons: Record<Operation, React.ReactNode> = {
    sum: <Sigma className="h-4 w-4" />,
    subtract: <Minus className="h-4 w-4" />,
    multiply: <X className="h-4 w-4" />,
    divide: <DivideIcon className="h-4 w-4" />,
};

export const operationLabels: Record<Operation, string> = {
    sum: 'Sum',
    subtract: 'Subtract',
    multiply: 'Multiply',
    divide: 'Divide',
};


export function getContextualOperandLabel(op: Operation, index: number): string | null {
    if (op === 'subtract') {
        return index === 0 ? 'From' : 'Subtract';
    }
    if (op === 'divide') {
        if (index === 0) return 'Numerator';
        if (index === 1) return 'Denominator';
        return `Divide by`;
    }
    return null;
}
