import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { CalendarIcon, ClockIcon, DownloadIcon, Loader2, PlusIcon } from "lucide-react"
import { ButtonLoader } from "../custom/button-loader"
import { router, WhenVisible } from "@inertiajs/react"
import { useState } from "react"
import { Product } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { humanToSeconds } from "@/lib/utils"

const formSchema = z.object({
    product_id: z.number().min(1, "Product is required"),
    duration_unit: z.string().min(1, "Duration is required"),
    duration_value: z.number().min(1, "Duration value is required"),
    amount: z.number().min(1, "Amount is required"),
    description: z.string().optional(),
});

interface LicenseCreateDialogProps {
    products: Product[];
    disabled?: boolean;
}

export const LicenseCreateDialog = ({
    products,
    disabled = false
}: LicenseCreateDialogProps) => {

    const [open, onOpenChange] = useState(false);
    const [pending, setPending] = useState(false);
    const [submitAction, setSubmitAction] = useState<'create' | 'export'>('create');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            duration_unit: "months",
            duration_value: 1,
            amount: 1,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setPending(true);

        const _values = {
            ...values,
            duration: humanToSeconds(values.duration_unit, values.duration_value),
            is_lifetime: values.duration_unit === 'lifetime',
            is_export: submitAction === 'export'
        };

        try {
            router.post(route('licenses.create'), _values, {
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
                <Button disabled={disabled}>
                    <PlusIcon />
                    Create License
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create License</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                <WhenVisible data="products" fallback={
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="animate-spin size-12 text-primary" />
                    </div>
                }>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            <FormField
                                control={form.control}
                                name="product_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                            defaultValue={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a product" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {products.map((product) => (
                                                    <SelectItem key={product.id} value={product.id.toString()}>
                                                        {product.name} ({product.product_code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-4">

                                <FormField
                                    control={form.control}
                                    name="duration_value"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Duration Amount</FormLabel>
                                            <FormControl>
                                                <div className="flex rounded-md shadow-xs">
                                                    <span className="border-input bg-background text-muted-foreground -z-10 inline-flex items-center rounded-s-md border px-3 text-sm">
                                                        <ClockIcon className="size-4" />
                                                    </span>
                                                    <Input
                                                        {...field}
                                                        min={1}
                                                        type="number"
                                                        className="-ms-px rounded-s-none shadow-none"
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="duration_unit"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Duration Unit</FormLabel>

                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <div className="flex rounded-md shadow-xs">
                                                        <span className="border-input bg-background text-muted-foreground -z-10 inline-flex items-center rounded-s-md border px-3 text-sm">
                                                            <CalendarIcon className="size-4" />
                                                        </span>
                                                        <SelectTrigger className="-ms-px rounded-s-none shadow-none">
                                                            <SelectValue placeholder="Select a duration" />
                                                        </SelectTrigger>
                                                    </div>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="hours">Hours</SelectItem>
                                                    <SelectItem value="days">Days</SelectItem>
                                                    <SelectItem value="weeks">Weeks</SelectItem>
                                                    <SelectItem value="months">Months</SelectItem>
                                                    <SelectItem value="years">Years</SelectItem>
                                                    <SelectItem value="lifetime">Lifetime</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                min={1}
                                                max={100}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Kiroshi's License for Pixelbot 3.0"
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <ButtonLoader
                                    type="submit"
                                    icon={DownloadIcon}
                                    loading={pending}
                                    variant='outline'
                                    onClick={() => setSubmitAction('export')}
                                    disabled={true}
                                >
                                    Create & Export
                                </ButtonLoader>
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

                </WhenVisible >

            </DialogContent>

        </Dialog>

    );
}