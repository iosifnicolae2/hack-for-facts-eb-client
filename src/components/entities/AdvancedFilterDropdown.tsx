import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, FilterIcon } from "lucide-react";
import { Trans } from "@lingui/react/macro";


export type AdvancedFilterType = 
  | 'economic:personal' 
  | 'economic:goods' 
  | 'anomaly:missing' 
  | 'anomaly:value_changed';

interface AdvancedFilterDropdownProps {
  onSelect: (value: string | undefined) => void;
  currentFilter?: string;
}

export const AdvancedFilterDropdown: React.FC<AdvancedFilterDropdownProps> = ({ onSelect, currentFilter }) => {
  const handleSelect = (value: string) => {
    if (currentFilter === value) {
      onSelect(undefined);
    } else {
      onSelect(value);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <FilterIcon className="h-4 w-4" />
          <span className="sr-only"><Trans>Add Filter</Trans></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel><Trans>By Economic Category</Trans></DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleSelect('economic:personal')}>
            <Trans>Personal Spending</Trans>
            {currentFilter === 'economic:personal' && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSelect('economic:goods')}>
            <Trans>Goods and Services</Trans>
            {currentFilter === 'economic:goods' && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel><Trans>By Anomaly</Trans></DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleSelect('anomaly:missing')}>
            <Trans>Missing Items</Trans>
            {currentFilter === 'anomaly:missing' && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSelect('anomaly:value_changed')}>
            <Trans>Value Changed</Trans>
            {currentFilter === 'anomaly:value_changed' && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
