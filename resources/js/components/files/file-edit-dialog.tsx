import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Check, PlusIcon, TrashIcon } from "lucide-react"
import { ButtonLoader } from "../custom/button-loader"
import { router } from "@inertiajs/react"
import { useState, useEffect } from "react"
import { useProducts } from "@/hooks/api/use-products"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "../ui/switch"
import { File } from "@/types"

const formSchema = z.object({
    product_id: z.string().min(1, "Product is required"),
    custom_name: z.string().min(1, "Custom name is required").max(100, "Custom name must be at most 100 characters long"),
    is_hidden: z.boolean(),
    is_downloadable: z.boolean(),
});

type FileFormData = z.infer<typeof formSchema>;

interface FileEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: File;
}

export const FileEditDialog = ({
    open,
    onOpenChange,
    file,
}: FileEditDialogProps) => {

    // TODO: fix this

    const [pending, setPending] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(false);
    const products = useProducts(open);

    const form = useForm<FileFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            product_id: file.product_id ? String(file.product_id) : "",
            custom_name: file.custom_name || "",
            is_hidden: Boolean(file.is_hidden),
            is_downloadable: Boolean(file.is_downloadable),
        }
    });

    // Reset form when file changes (important for proper pre-population)
    useEffect(() => {
        form.reset({
            product_id: file.product_id ? String(file.product_id) : "",
            custom_name: file.custom_name || "",
            is_hidden: file.is_hidden,
            is_downloadable: file.is_downloadable,
        });
    }, [file, form]);

    function onSubmit(values: FileFormData) {

        setPending(true);
        try {
            const formData = new FormData();
            formData.append('product_id', values.product_id);
            formData.append('custom_name', values.custom_name);
            formData.append('is_hidden', values.is_hidden ? '1' : '0');
            formData.append('is_downloadable', values.is_downloadable ? '1' : '0');

            router.put(route('files.update', file.id), formData, {
                forceFormData: true,
                onSuccess: () => {
                    onOpenChange(false);
                    form.reset();
                },
                onError: (error) => {
                    console.error("File edit failed", error);
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

    const handleDelete = () => {
        setPendingDelete(true);
        router.delete(route('files.delete', file.id), {
            onSuccess: () => {
                onOpenChange(false);
                form.reset();
            },
            onError: (error) => {
                console.error("File delete failed", error);
            },
            onFinish: () => {
                setPendingDelete(false);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>

            <DialogTrigger asChild>
                <Button>
                    <PlusIcon />
                    Update File
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update File</DialogTitle>
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
                            <div className="flex justify-between w-full">
                                <ButtonLoader
                                    type="button"
                                    icon={TrashIcon}
                                    variant='destructive'
                                    loading={pendingDelete}
                                    onClick={handleDelete}
                                >
                                    Delete
                                </ButtonLoader>
                                <div className="flex gap-2">
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <ButtonLoader
                                        type="submit"
                                        icon={Check}
                                        loading={pending}
                                    >
                                        Save Changes
                                    </ButtonLoader>
                                </div>
                            </div>
                        </DialogFooter>

                    </form>
                </Form>

            </DialogContent>

        </Dialog>

    );
}