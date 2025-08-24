import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { License } from "@/types";
import { Textarea } from "../ui/textarea";
import CopyToClipboard from "../copy-to-clipboard";
import { useState } from "react";
import { usePage } from "@inertiajs/react";

export const LicenseExportResult = ({ licenses }: { licenses: License[] }) => {

    // const { created_licenses, is_export } = usePage().props.flash;

    // console.log("created_licenses", created_licenses);
    // console.log("is_export", is_export);

    // const [open, onOpenChange] = useState(is_export);
    const licensesText = licenses?.map(license => license.license_key).join("\n");

    return (


        <div className="pt-4 flex flex-col gap-4">

            <span>Exported {licenses?.length || 0} licenses</span>

            <Textarea
                value={licensesText}
                className="h-full"
            />

            <div className="flex justify-end items-center gap-2">
                <span className="text-sm">Copy to clipboard</span>
                <CopyToClipboard text={licensesText} />
            </div>

        </div>

    );
}