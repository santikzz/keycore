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
        <AuthLayout title="Log in to your KeyCore account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <ASCIIText text='KeyCore' />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
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
                        {/* <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )}
                        </div> */}
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

                    {/* <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div> */}

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        Log in
                        {processing ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <LogInIcon />}
                    </Button>
                </div>

                {/* <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Sign up
                    </TextLink>
                </div> */}

            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
