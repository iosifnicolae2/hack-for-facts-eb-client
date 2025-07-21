import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

interface SearchToggleInputProps {
  active: boolean;
  initialSearchTerm: string;
  onToggle: (active: boolean) => void;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number; // target width in px
}

export const SearchToggleInput: React.FC<SearchToggleInputProps> = ({
  active,
  initialSearchTerm,
  onToggle,
  onChange,
  placeholder = "Search...",
  width = 160,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onChange(e.target.value);
  };

  return (
    <AnimatePresence initial={false} mode="wait">
      {active ? (
        <motion.div
          key="input"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex items-center overflow-hidden space-x-1"
        >
          <Input
            value={searchTerm}
            onChange={handleChange}
            placeholder={placeholder}
            className="h-8 text-sm flex-1 m-2"
            autoFocus
          />
          <X
            className="h-4 w-4 cursor-pointer text-muted-foreground flex-shrink-0"
            onClick={() => {
              onChange("");
              onToggle(false);
            }}
          />
        </motion.div>
      ) : (
        <motion.button
          key="icon"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => onToggle(true)}
          className="text-muted-foreground"
        >
          <Search className="h-4 w-4 cursor-pointer" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}; 