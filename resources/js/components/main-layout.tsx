import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { cn } from "@/lib/utils";
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
}

export const MainLayout = ({
    children,
    className = '',
    title = 'Dashboard',
    breadcrumbs = [],
}: MainLayoutProps) => {

    const { url } = usePage();
    const { success, error } = usePage().props.flash;

    useEffect(() => {
        if (success) toast.success(success);
        if (error) toast.error(error);
        if (success || error) {
            router.reload({ only: ['flash'] });
        }
    }, [success, error]);

    return (
        <>
            <Head title={title} />
            <Toaster
                position="bottom-right"
                reverseOrder={false}
            />
            <AppShell variant="sidebar">
                <AppSidebar />
                <AppContent variant="sidebar" className="overflow-x-hidden">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    <main className={cn("flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto", className)}>
                        {children}
                    </main>
                </AppContent>
            </AppShell>
        </>
    );
}
