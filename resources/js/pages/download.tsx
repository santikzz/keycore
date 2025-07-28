import ASCIIText from "@/components/ascii-text";
import { ButtonLoader } from "@/components/custom/button-loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { File } from "@/types";
import axios from "axios";
import { set } from "date-fns";
import { ClockFadingIcon, DownloadIcon, KeyIcon, Loader2, SearchIcon } from "lucide-react";
import { useState } from "react";

export default function DownloadPage() {

    const [isLoading, setIsLoading] = useState(false);
    const [licenseKey, setLicenseKey] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState<string | null>(null);

    const showInfo = data !== null && data?.count > 0;

    const handleSearch = async (e: Event) => {
        e.preventDefault();
        setIsLoading(true);
        setData(null);
        setError(null);

        if (!licenseKey.trim()) {
            setError("Please enter a license key");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(route("download.search"), { license_key: licenseKey });

            // handle errors
            if (response.data.error) {
                setError(response.data.error);
            } else {
                setData(null);
                if (response.data.files && response.data.files.length === 0) {
                    setError("No files found for this license key");
                }
            }

            console.log("Search response:", response.data);
            setData(response.data);

        } catch (error: any) {
            console.error("Error fetching files:", error);
            if (error.response?.status === 403) {
                setError("Invalid or inactive license key");
            } else if (error.response?.status === 422) {
                setError("Invalid license key format");
            } else if (error.response?.status === 429) {
                setError("Too many requests. Please try again later.");
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError("Failed to search files. Please try again.");
            }
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDownload = async (file: File) => {
        try {
            setError(null);

            // make request for download
            const response = await axios.post(route("download.file"), {
                file_id: file.id,
                license_key: licenseKey
            }, {
                responseType: 'blob' // for file downloads
            });

            // create blob link and download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.custom_name || file.file_name || 'download');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error: any) {
            console.error("Error downloading file:", error);

            if (error.response?.status === 403) {
                setError("License key is invalid or expired");
            } else if (error.response?.status === 404) {
                setError("File not found");
            } else if (error.response?.status === 429) {
                setError("Too many requests. Please try again later.");
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError("Failed to download file. Please try again.");
            }
        }
    }

    return (
        <main className="flex justify-center items-center min-h-screen w-full">

            <ASCIIText text='Skynet' className="absolute inset-0 -translate-y-[12rem] overflow-hidden z-10" />

            <div className="flex flex-col gap-4 w-[40rem] z-50">

                {showInfo && (
                    <Card className="p-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">{data?.product_name}</span>

                            <div className="flex items-center gap-2">
                                <ClockFadingIcon className="size-4 text-primary" />
                                <span className="text-lg font-semibold">{data?.time_left_human}</span>
                            </div>
                        </div>
                    </Card>
                )}

                <Card className="p-4">

                    <form className="flex flex-row gap-2" onSubmit={handleSearch}>
                        <div className="relative w-full">
                            <Input className="peer ps-9 text-center flex-1"
                                placeholder="Enter your license key"
                                type="text"
                                value={licenseKey}
                                onChange={(e) => setLicenseKey(e.target.value)}
                            />
                            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                                <KeyIcon className="size-4" />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || !licenseKey}
                            className="w-9 z-40"
                        >
                            {isLoading ? (<Loader2 className="animate-spin size-4" />) : (<SearchIcon className="size-4" />)}
                        </Button>

                    </form>

                </Card>

                {showInfo && (
                    <Card className="p-4 flex flex-col gap-4 animate-in fade-in-50 slide-in-from-top-4 duration-500">
                        {data?.files?.map((file: File, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span>{file.custom_name}</span>
                                <Button
                                    className="size-8"
                                    onClick={() => handleDownload(file)}
                                >
                                    <DownloadIcon />
                                </Button>
                            </div>
                        ))}
                    </Card>
                )}

                {error && (
                    <Label className="text-red-600 text-center">
                        {error}
                    </Label>
                )}


            </div>

        </main>
    );
}