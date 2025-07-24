import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { PlusIcon, Upload } from "lucide-react"
import { ButtonLoader } from "../custom/button-loader"
import { router } from "@inertiajs/react"
import { useState } from "react"
import { useProducts } from "@/hooks/api/use-products"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "../ui/switch"

const formSchema = z.object({
    product_id: z.string().min(1, "Product is required"),
    custom_name: z.string().min(1, "Custom name is required").max(100, "Custom name must be at most 100 characters long"),
    is_hidden: z.boolean(),
    is_downloadable: z.boolean(),
});

type FileFormData = z.infer<typeof formSchema>;

export const FileCreateDialog = () => {

    const [open, onOpenChange] = useState(false);
    const [pending, setPending] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const products = useProducts(open);

    const form = useForm<FileFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            product_id: "",
            custom_name: "",
            is_hidden: false,
            is_downloadable: true,
        }
    });

    function onSubmit(values: FileFormData) {
        if (!file) {
            alert("Please select a file to upload");
            return;
        }

        setPending(true);
        try {
            const formData = new FormData();
            formData.append('product_id', values.product_id);
            formData.append('custom_name', values.custom_name);
            formData.append('is_hidden', values.is_hidden ? '1' : '0');
            formData.append('is_downloadable', values.is_downloadable ? '1' : '0');
            formData.append('file', file);

            router.post(route('files.upload'), formData, {
                forceFormData: true,
                onSuccess: () => {
                    onOpenChange(false);
                    form.reset();
                    setFile(null);
                    console.log("File uploaded successfully");
                },
                onError: (error) => {
                    console.error("File upload failed", error);
                },
                onFinish: () => {
                    setPending(false);
                }
            })
        } catch (error) {
            console.error("Form submission error", error);
            setPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>

            <DialogTrigger asChild>
                <Button>
                    <PlusIcon />
                    Upload File
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="product_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a product" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {products.data?.map(product => (
                                                <SelectItem key={product.id} value={String(product.id)}>
                                                    {product.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="custom_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Custom Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Pixelbot v3.0"
                                            type="text"
                                            {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <label htmlFor="file-upload" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                File
                            </label>
                            <Input
                                id="file-upload"
                                type="file"
                                required
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (files && files.length > 0) {
                                        setFile(files[0]);
                                    } else {
                                        setFile(null);
                                    }
                                }}
                            />
                            {!file && (
                                <p className="text-sm text-red-500">File is required</p>
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="is_downloadable"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel>Downloadable</FormLabel>
                                        <FormDescription>
                                            If enabled, the file will be downloadable by users.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_hidden"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel>Hidden</FormLabel>
                                        <FormDescription>
                                            If hidden, the file will not be displayed in the file list.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <ButtonLoader
                                type="submit"
                                icon={Upload}
                                loading={pending}
                            >
                                Upload
                            </ButtonLoader>
                        </DialogFooter>

                    </form>
                </Form>

            </DialogContent>

        </Dialog>

    );
}