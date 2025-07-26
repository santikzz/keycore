import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { CalendarIcon, CheckIcon, ClockIcon, ClockPlusIcon, CpuIcon, KeyIcon, Loader2, PauseIcon, PlayIcon, RotateCcwIcon, TrashIcon } from "lucide-react"
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
import { useLicense } from "@/hooks/api/use-licenses"

const addTimeSchema = z.object({
    duration_unit: z.string().min(1, "Duration unit is required"),
    duration_value: z.number().min(1, "Duration value is required"),
});

const updateSchema = z.object({
    status: z.string().min(1, "Status is required"),
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

    const [pendingResetHwid, setPendingResetHwid] = useState(false);
    const [pendingPause, setPendingPause] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(false);
    const [pendingAddTime, setPendingAddTime] = useState(false);
    const [previewTimeLeft, setPreviewTimeLeft] = useState<number | null>(null);

    const { data, isPending, refetch } = useLicense({ licenseId: license.id, enabled: open });

    const addTimeForm = useForm<z.infer<typeof addTimeSchema>>({
        resolver: zodResolver(addTimeSchema),
        defaultValues: {
            duration_unit: "hours",
            duration_value: 1,
        }
    });

    const updateForm = useForm<z.infer<typeof updateSchema>>({
        resolver: zodResolver(updateSchema),
        defaultValues: {
            status: data?.status || "active",
            description: data?.description || "",
        }
    });

    // Update form when data changes
    useEffect(() => {
        if (data) {
            updateForm.reset({
                status: data.status,
                description: data.description || "",
            });
            refetch();
        }
    }, [data, updateForm]);

    // Calculate preview time when form values change
    useEffect(() => {
        const subscription = addTimeForm.watch((values) => {
            if (values.duration_unit && values.duration_value && data?.time_left) {
                const additionalSeconds = humanToSeconds(values.duration_unit, values.duration_value);
                setPreviewTimeLeft(data.time_left + additionalSeconds);
            } else {
                setPreviewTimeLeft(null);
            }
        });
        return () => subscription.unsubscribe();
    }, [addTimeForm, data]);

    const isPaused = data?.paused_at !== null;
    const allowPause = data && (data.status === 'active');
    const allowResetHwid = data && (data.hwid !== null);

    function onAddTime(values: z.infer<typeof addTimeSchema>) {
        if (!data) return;
        setPendingAddTime(true);
        
        const additionalSeconds = humanToSeconds(values.duration_unit, values.duration_value);
        
        router.post(route('licenses.add-time', { license: data.id }), {
            seconds: additionalSeconds
        }, {
            onSuccess: () => {
                addTimeForm.reset();
                setPreviewTimeLeft(null);
            },
            onFinish: () => setPendingAddTime(false),
        });
    }

    function onUpdate(values: z.infer<typeof updateSchema>) {
        if (!data) return;
        setPendingUpdate(true);
        
        router.put(route('licenses.update', { license: data.id }), values, {
            onSuccess: () => {
               onOpenChange(false);
            },
            onFinish: () => setPendingUpdate(false),
        });
    }

    const handleResetHwid = () => {
        if (!data) return;
        setPendingResetHwid(true);
        router.post(route('licenses.reset-hwid', { license: data.id }), {}, {
            onSuccess: () => {
                onOpenChange(false);
            },
            onFinish: () => setPendingResetHwid(false),
        });
    };

    const handlePause = () => {
        if (!data) return;
        setPendingPause(true);
        
        const routeName = isPaused ? 'licenses.unpause' : 'licenses.pause';
        
        router.post(route(routeName, { license: data.id }), {}, {
            onSuccess: () => {
                // onOpenChange(false);
            },
            onFinish: () => setPendingPause(false),
        });
    };

    const handleDelete = () => {
        if (!data) return;
        setPendingDelete(true);
        router.delete(route('licenses.delete', { license: data.id }), {
            onSuccess: () => {
                onOpenChange(false);
            },
            onFinish: () => setPendingDelete(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>License Details</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                {isPending ? (

                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="size-12 animate-spin text-primary" />
                    </div>
                ) : (<>

                    {/* LICENSE KEY */}
                    <div className="flex flex-col gap-2">
                        <Label>License Key</Label>
                        <div className="relative">
                            <Input className="peer ps-9 pe-12" readOnly value={data?.license_key || ""} />
                            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                                <KeyIcon className="size-4" />
                            </div>
                            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-sm peer-disabled:opacity-50">
                                <LicenseStatusBadge status={data?.c_status || "unknown"}/>
                            </span>
                        </div>
                    </div>

                    {/* HWID */}
                    <div className="flex flex-col gap-2">
                        <Label>Hardware ID</Label>
                        <div className="flex gap-2">
                            <div className="relative w-full">
                                <Input className="peer ps-9" readOnly value={data?.hwid || "Not assigned"} />
                                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                                    <CpuIcon className="size-4" />
                                </div>
                            </div>
                            <ButtonLoader
                                onClick={handleResetHwid}
                                loading={pendingResetHwid}
                                icon={RotateCcwIcon}
                                disabled={!allowResetHwid}
                            >
                                Reset
                            </ButtonLoader>
                        </div>
                    </div>

                    {/* <Separator className="my-2" />

                    <Form {...addTimeForm}>
                        <form onSubmit={addTimeForm.handleSubmit(onAddTime)} className="space-y-4">
                            <div className="flex gap-4 items-end">

                                <FormField
                                    control={addTimeForm.control}
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
                                    control={addTimeForm.control}
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
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <ButtonLoader
                                    type="submit"
                                    loading={pendingAddTime}
                                    icon={ClockPlusIcon}
                                >
                                    Add Time
                                </ButtonLoader>

                            </div>
                        </form>
                    </Form>

                    <div className="rounded-md p-4 flex gap-2 items-center justify-center bg-secondary">
                        <ClockIcon />
                        <Label className="text-xl">
                            Time Left: <span className="font-bold">{data?.time_left_human || "Unknown"}</span>
                            {previewTimeLeft && (
                                <span className="text-green-600 ml-2">
                                    → Preview: {Math.floor(previewTimeLeft / 86400)}d {Math.floor((previewTimeLeft % 86400) / 3600)}h
                                </span>
                            )}
                        </Label>
                    </div> */}

                    <Separator className="my-2" />

                    {/* UPDATE FORM */}
                    <Form {...updateForm}>
                        <form onSubmit={updateForm.handleSubmit(onUpdate)} className="space-y-4">
                            
                            <FormField
                                control={updateForm.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Change Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="expired">Expired</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={updateForm.control}
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

                            <Separator className="my-2" />

                            <div className="flex w-full justify-between">
                                <div className="flex gap-4">

                                    <ButtonLoader
                                        onClick={handlePause}
                                        loading={pendingPause}
                                        icon={isPaused ? PlayIcon : PauseIcon}
                                        disabled={!allowPause}
                                        // disabled={true} // TODO: fix pause logic
                                    >
                                        {isPaused ? 'Unpause' : 'Pause'}
                                    </ButtonLoader>

                                    <ButtonLoader
                                        onClick={handleDelete}
                                        loading={pendingDelete}
                                        variant="destructive"
                                        icon={TrashIcon}
                                    >
                                        Delete
                                    </ButtonLoader>

                                </div>

                                <ButtonLoader
                                    type="submit"
                                    loading={pendingUpdate}
                                    icon={CheckIcon}
                                >
                                    Save Changes
                                </ButtonLoader>
                            </div>

                        </form>
                    </Form>

                </>)}
            </DialogContent>

        </Dialog >

    );
}