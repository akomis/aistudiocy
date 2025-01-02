"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-label";
import { Check, ChevronsUpDown } from "lucide-react";

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-full justify-between bg-black text-gray-400",
            { "text-white": Boolean(value) }
          )}
          disabled={disabled}
        >
          <Label className="tracking-tight text-[16px]">
            {value
              ? options.find((option) => option.value === value)?.label
              : `${title.toUpperCase()} *`}
          </Label>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full rounded-none">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setValue(option.value)}
            className="hover:cursor-pointer hover:opacity-75"
          >
            {option.label}
            {value === option.value && (
              <Check className="ml-auto opacity-100" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownPicker;
