"use client";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Props = {
  options: Array<{ label: string; value: string }>;
  value: string;
  setValue: (value: string) => void;
  title: string;
  disabled?: boolean;
};

const DropdownPicker = ({
  options,
  value,
  setValue,
  title,
  disabled,
}: Props) => {
  return (
    <Select disabled={disabled} onValueChange={setValue} value={value}>
      <SelectTrigger
        className={cn(
          "w-full h-full justify-between bg-transparent text-gray-400 rounded-none text-[16px]",
          {
            "text-white": Boolean(value),
          }
        )}
      >
        <SelectValue placeholder={title.toUpperCase()} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DropdownPicker;
