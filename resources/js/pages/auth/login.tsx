import { Head, useForm } from '@inertiajs/react';
import { Loader2Icon, LockIcon, LogInIcon, UserIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import ASCIIText from '@/components/ascii-text';
import useScrollLock from '@/hooks/use-scroll-lock';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {

    const [isVisible, setIsVisible] = useState<boolean>(false)
    const toggleVisibility = () => setIsVisible((prevState) => !prevState)

    useScrollLock({ autoLock: true });

    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />
            <main className="flex max-h-screen">

                <div className="flex-1 bg-black border-r">
                    {/* <img src="/wallhaven-kxo391.jpg" className='w-full h-full object-cover' alt="KeyCore Background" /> */}
                    <img src="/wallhaven-je8qlp.jpg" className='w-full h-full object-cover brightness-75 saturate-125' alt="KeyCore Background" />
                </div>


                <form className="flex flex-col gap-4 flex-1 justify-center items-center relative overflow-hidden" onSubmit={submit}>

                    <ASCIIText text='Skynet' className="absolute inset-0 -translate-y-[12rem] overflow-hidden" />

                    <div className="flex flex-col gap-4 min-w-md">
                        <div className="grid gap-2">
                            {/* <Label htmlFor="email">Email address</Label> */}
                            <div className="relative">
                                <Input
                                    className="peer ps-9"
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                />
                                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                                    <UserIcon size={16} aria-hidden="true" />
                                </div>
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <div className="relative">
                                <Input
                                    className="peer ps-9"
                                    id="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Password"
                                    type={isVisible ? "text" : "password"}
                                />
                                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                                    <LockIcon size={16} aria-hidden="true" />
                                </div>
                                <button
                                    className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                                    type="button"
                                    onClick={toggleVisibility}
                                    aria-label={isVisible ? "Hide password" : "Show password"}
                                    aria-pressed={isVisible}
                                    aria-controls="password"
                                >
                                    {isVisible ? (
                                        <EyeOffIcon size={16} aria-hidden="true" />
                                    ) : (
                                        <EyeIcon size={16} aria-hidden="true" />
                                    )}
                                </button>
                            </div>

                            <InputError message={errors.password} />
                        </div>

                        <Button type="submit" className="w-full" tabIndex={4} disabled={processing}>
                            Log in
                            {processing ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <LogInIcon />}
                        </Button>
                    </div>

                </form>



            </main>

            <footer className='absolute bottom-0 right-0 px-4 py-2'>
                <span className='text-xs text-white/25'>This is a restricted dashboard. Unauthorized access is prohibited. You are being monitored.</span>
            </footer>

        </>
    );
}
