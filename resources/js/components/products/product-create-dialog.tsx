import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { PlusIcon } from "lucide-react"
import { ButtonLoader } from "../custom/button-loader"
import { router } from "@inertiajs/react"
import { useState } from "react"

const formSchema = z.object({
    product_name: z.string().min(1, "Product name is required").max(100, "Product name must be at most 100 characters long"),
    product_code: z.string().min(1, "Product code is required").regex(/^[a-zA-Z0-9_-]+$/, "Product code can only contain letters, numbers, underscores, and hyphens").max(50, "Product code must be at most 50 characters long"),
});

export const ProductCreateDialog = () => {

    const [open, onOpenChange] = useState(false);
    const [pending, setPending] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setPending(true);
        try {
            router.post(route('products.create'), values, {
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
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>

            <DialogTrigger asChild>
                <Button>
                    <PlusIcon />
                    Create Product
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Product</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="product_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Name *</FormLabel>
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
                                    <FormLabel>Product Code *</FormLabel>
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
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <ButtonLoader
                                type="submit"
                                icon={PlusIcon}
                                loading={pending}
                            >
                                Create
                            </ButtonLoader>
                        </DialogFooter>

                    </form>
                </Form>

            </DialogContent>

        </Dialog>

    );
}