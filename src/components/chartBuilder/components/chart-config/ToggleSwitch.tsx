import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ToggleSwitchProps {
    id: string;
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

export const ToggleSwitch = React.memo(({ id, label, checked, onCheckedChange }: ToggleSwitchProps) => (
    <div className="flex items-center justify-between space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
)); 