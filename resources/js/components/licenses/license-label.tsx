import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, } from "@/components/ui/tooltip"

interface LicenseLabelProps {
    children: React.ReactNode;
}

export const LicenseLabel = ({ children }: LicenseLabelProps) => {

    const [open, onOpenChange] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        // copy to clipboard
        navigator.clipboard.writeText(children as string);

        onOpenChange(!open);
        setTimeout(() => {
            onOpenChange(false);
        }, 1000);
    }

    return (
        <Tooltip open={open}>
            <TooltipTrigger>
                <label
                    onClick={handleClick}
                    className="px-2 py-1 rounded hover:text-white hover:bg-neutral-800 cursor-pointer transition-colors duration-200">
                    {children}
                </label>
            </TooltipTrigger>
            <TooltipContent>
                <p>Copied to clipboard!</p>
            </TooltipContent>
        </Tooltip>
    )

}