import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { CheckIcon, TrashIcon } from "lucide-react"
import { ButtonLoader } from "../custom/button-loader"
import { router } from "@inertiajs/react"
import { useEffect, useState } from "react"
import { File, Product } from "@/types"

const formSchema = z.object({
    product_name: z.string().min(1, "Product name is required").max(100, "Product name must be at most 100 characters long"),
    product_code: z.string().min(1, "Product code is required").regex(/^[a-zA-Z0-9_-]+$/, "Product code can only contain letters, numbers, underscores, and hyphens").max(50, "Product code must be at most 50 characters long"),
});

interface ProductEditDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    file: File;
}

export const FileEditDialog = ({
    open = false,
    onOpenChange = () => { },
    file,
}: ProductEditDialogProps) => {

    const [pending, setPending] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setPending(true);
        try {
            router.put(route('products.update', product.id), values, {
                onSuccess: () => {
                    onOpenChange(false);
                },
                onFinish: () => {
                    setPending(false);
                }
            })
        } catch (error) {
            console.error("Form submission error", error);
        }
    }

    useEffect(() => {
        if (product) {
            form.reset({
                product_name: product.name,
                product_code: product.product_code,
            });
        }
    }, [product, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Product</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="product_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Pixelbot 3.0"
                                            type="text"
                                            {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="product_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="pixelbotv3"
                                            type="text"
                                            {...field} />
                                    </FormControl>
                                    <FormDescription>This will be used to identify the license key product on the applications</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <div className="flex justify-between w-full">
                                <ButtonLoader
                                    type="submit"
                                    icon={TrashIcon}
                                    variant='destructive'
                                    loading={pending}
                                >
                                    Delete
                                </ButtonLoader>

                                <div className="flex gap-2">
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <ButtonLoader
                                        type="submit"
                                        icon={CheckIcon}
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