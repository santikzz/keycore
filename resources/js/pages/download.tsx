import { ButtonLoader } from "@/components/custom/button-loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { File } from "@/types";
import axios from "axios";
import { set } from "date-fns";
import { DownloadIcon, KeyIcon, Loader2, SearchIcon } from "lucide-react";
import { useState } from "react";

export default function DownloadPage() {

    const [isLoading, setIsLoading] = useState(false);
    const [licenseKey, setLicenseKey] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        setIsLoading(true);
        setFiles([]);
        setError(null);

        if (!licenseKey.trim()) {
            setError("Please enter a license key");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(route("download.search"), { license_key: licenseKey });

            if (response.data.error) {
                setError(response.data.error);
                setFiles([]);
            } else {
                setFiles(response.data.files || []);
                if (response.data.files && response.data.files.length === 0) {
                    setError("No files found for this license key");
                }
            }
            console.log("Files fetched:", response.data);
        } catch (error: any) {
            console.error("Error fetching files:", error);

            if (error.response?.status === 403) {
                setError("Invalid or inactive license key");
            } else if (error.response?.status === 422) {
                setError("Invalid license key format");
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError("Failed to search files. Please try again.");
            }
            setFiles([]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDownload = async (file: File) => {
        try {
            setError(null);

            // Make request for download
            const response = await axios.post(route("download.file"), {
                file_id: file.id,
                license_key: licenseKey
            }, {
                responseType: 'blob' // Important for file downloads
            });

            // Create blob link and download
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
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError("Failed to download file. Please try again.");
            }
        }
    }

    return (
        <main className="flex justify-center items-center min-h-screen w-full">

            <div className="flex flex-col gap-4 w-[40rem]">

                <Card className="p-4">

                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <Input className="peer ps-9 pe-9"
                                placeholder="Enter your license key"
                                type="text"
                                value={licenseKey}
                                onChange={(e) => setLicenseKey(e.target.value)}
                            />
                            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                                <KeyIcon className="size-4" />
                            </div>
                            {isLoading && (
                                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                                    <Loader2 className="animate-spin size-4 text-primary" />
                                </div>
                            )}
                        </div>

                        <Button
                            type="button"
                            onClick={handleSearch}
                            disabled={isLoading || !licenseKey}
                        >
                            {isLoading ? (<Loader2 className="animate-spin size-4" />) : (<SearchIcon className="size-4" />)}
                            Search
                        </Button>

                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}

                    </div>

                </Card>

                {files.length > 0 && (
                    <Card className="p-4 flex flex-col gap-4">
                        {files?.map((file: File, index) => (
                            <div className="flex justify-between items-center">
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

            </div>

        </main>
    );
}