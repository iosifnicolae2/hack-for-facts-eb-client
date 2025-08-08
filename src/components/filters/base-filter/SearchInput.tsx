import { Input } from "@/components/ui/input";
import { Search, X, Info } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SearchInputProps {
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
    initialValue?: string;
    helpText?: string;
}

export function SearchInput({
    onChange,
    placeholder = "Search...",
    className,
    initialValue = "",
    helpText,
}: SearchInputProps) {
    const [search, setSearch] = useState(initialValue);
    const debounceMs = 300;
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handler = setTimeout(() => onChange(search), debounceMs);
        return () => clearTimeout(handler);
    }, [search, onChange, debounceMs]);

    const handleClearSearch = () => {
        setSearch("");
        inputRef.current?.focus();
    };

    return (
        <div className={cn("relative w-full p-0.5", className)}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                ref={inputRef}
                type="text"
                maxLength={80}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-16 py-2 text-sm" // Extra space for clear + info icons
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {search && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className="p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
                {helpText && (
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="p-1 text-muted-foreground hover:text-foreground"
                                    aria-label="Search help"
                                >
                                    <Info className="h-4 w-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="end">
                                {helpText}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </div>
    );
}