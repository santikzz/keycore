import { cn } from "@/lib/utils";

interface LicenseStatusBadgeProps {
    children: React.ReactNode;
}

export const LicenseStatusBadge = ({ children }: LicenseStatusBadgeProps) => {
    const status = children as string;
    return (
        <div className={cn("capitalize border w-18 text-center",
            status === 'active' ? 'bg-green-500/45 border-green-500/50 text-white' :
            status === 'expired' ? 'bg-red-500/45 border-red-500/50 text-white' :
            status === 'unused' ? 'bg-primary/45 border border-primary/50 text-white/70' :
            'bg-gray-500 text-white',
            "py-0.5 rounded-md text-xs font-semibold"
        )}>
            {status}
        </div>
    );
}