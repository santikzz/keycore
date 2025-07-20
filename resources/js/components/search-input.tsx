import { SearchIcon } from "lucide-react"
import { Input } from "./ui/input"
import { cn } from "@/lib/utils";

interface SearchInputProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const SearchInput = ({
    value = '',
    onChange = (value: string) => { },
    placeholder = 'Search...',
    className = '',
}: SearchInputProps) => {
    return (
        <div className={cn("relative", className)}>
            <Input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete="off"
                className="peer ps-9"
                placeholder={placeholder}
                aria-label="Search"
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                <SearchIcon size={16} aria-hidden="true" />
            </div>
        </div>
    )
}