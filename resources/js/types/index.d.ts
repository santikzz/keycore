import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

declare module '@inertiajs/core' {
    interface PageProps {
        flash: {
            success?: string;
            error?: string;
        };
    }
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Product {
    id: number;
    name: string;
    product_code: string;
    license_count?: number;
    created_at: string;
    updated_at: string;
}

export interface License {
    id: number;
    product_id: number;
    license_key: string;
    duration: number;
    status: 'unused' | 'active' | 'expired';
    hwid: string | null;
    description: string | null;
    activated_at: Date | null;
    paused_at: Date | null;
    is_lifetime: boolean;
    created_at: Date;
    updated_at: Date;

    product: Product;
    duration_human: string;
    time_left: number;
    time_left_human: string;
    is_expired?: boolean;
    c_status: string;
}

export interface File {
    id: number;
    product_id: number | null;
    custom_name: string;
    file_name: string;
    file_path: string;
    is_hidden: boolean;
    is_downloadable: boolean;
    created_at: string;
    updated_at: string;

    product?: Product;
}