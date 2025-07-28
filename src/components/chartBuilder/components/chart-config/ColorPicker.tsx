import React from 'react';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
}

export const ColorPicker = React.memo(({ value, onChange }: ColorPickerProps) => (
    <div className="flex gap-2">
        <Input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-20 h-10 p-1 border rounded"
            aria-label="Color Picker"
        />
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#0000ff"
            className="flex-1"
        />
    </div>
)); 