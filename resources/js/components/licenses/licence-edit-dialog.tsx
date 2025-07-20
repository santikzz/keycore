import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { CalendarIcon, CheckIcon, ClockIcon, ClockPlusIcon, CpuIcon, KeyIcon, PauseIcon, RotateCcwIcon, TrashIcon } from "lucide-react"
import { ButtonLoader } from "../custom/button-loader"
import { router } from "@inertiajs/react"
import { useEffect, useState } from "react"
import { License } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { humanToSeconds } from "@/lib/utils"
import { Label } from "../ui/label"
import { Separator } from "../ui/separator"
import { LicenseStatusBadge } from "./license-status-badge"

const formSchema = z.object({
    product_id: z.number().min(1, "Product is required"),
    duration_unit: z.string().min(1, "Duration is required"),
    duration_value: z.number().min(1, "Duration value is required"),
    amount: z.number().min(1, "Amount is required"),
    description: z.string().optional(),
});

interface LicenseEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    license: License;
}

export const LicenseEditDialog = ({
    open,
    onOpenChange,
    license
}: LicenseEditDialogProps) => {

    const [pending, setPending] = useState(false);
    const [submitAction, setSubmitAction] = useState<'create' | 'export'>('create');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema)
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

    // useEffect(() => {
    //     if (license) {
    //         form.reset({
    //             product_id: license.product_id,
    //             duration_unit: license.duration_unit,
    //             duration_value: license.duration_value,
    //             amount: license.amount,
    //             description: license.description || ''
    //         });
    //     }
    // }, [license, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>License Details</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                {/* LICENSE KEY */}
                <div className="flex flex-col gap-2">
                    <Label>License Key</Label>
                    <div className="relative">
                        <Input className="peer ps-9 pe-12" readOnly value={license.license_key} />
                        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                            <KeyIcon className="size-4" />
                        </div>
                        <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-sm peer-disabled:opacity-50">
                            <LicenseStatusBadge>active</LicenseStatusBadge>
                        </span>
                    </div>
                </div>

                {/* HWID */}
                <div className="flex flex-col gap-2">
                    <Label>Hardware ID</Label>
                    <div className="flex gap-2">
                        <div className="relative w-full">
                            <Input className="peer ps-9" readOnly value='A1B2C3D4-E5F6-7890-ABCD-EF1234567890' />
                            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                                <CpuIcon className="size-4" />
                            </div>
                        </div>
                        <Button>
                            Reset
                            <RotateCcwIcon className="size-4" />
                        </Button>
                    </div>
                </div>

                <Separator className="my-2" />




                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex gap-4 items-end">

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
                                                        <SelectValue placeholder="Select" />
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

                            <Button>
                                Add Time
                                <ClockPlusIcon />
                            </Button>

                        </div>
                    </form>
                </Form>

                <div className=" rounded-md p-4 flex gap-2 items-center justify-center bg-secondary">
                    <ClockIcon />
                    <Label className="text-xl">Time Left: <span className="font-bold">34 days</span></Label>
                </div>

                <Separator className="my-2" />

                <div className="flex flex-col gap-2">
                    <Label>Change Status</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="hours">Active</SelectItem>
                            <SelectItem value="days">Expired</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    </form>
                </Form>

                <Separator className="my-2" />

                <div className="flex w-full justify-between">
                    <div className="flex gap-4">

                        <Button>
                            Pause
                            <PauseIcon fill="white" />
                        </Button>

                        <Button variant="destructive">
                            Delete
                            <TrashIcon />
                        </Button>

                    </div>

                    <Button>
                        Save Changes
                        <CheckIcon />
                    </Button>
                </div>

            </DialogContent>

        </Dialog >

    );
}