import { cn } from "@/lib/utils";

interface LicenseStatusBadgeProps {
    status: string;
}

export const LicenseStatusBadge = ({ status }: LicenseStatusBadgeProps) => {
    return (
        <div className={cn("capitalize border w-18 text-center",
            status === 'active' ? 'bg-green-500/45 border-green-500/50 text-white' :
            status === 'expired' ? 'bg-red-500/45 border-red-500/50 text-white' :
            status === 'unused' ? 'bg-primary/45 border border-primary/50 text-white/70' :
            status === 'paused' ? 'bg-yellow-500/45 border-yellow-500/50 text-white' :
            'bg-gray-500 text-white',
            "py-0.5 rounded-md text-xs font-semibold"
        )}>
            {status}
        </div>
    );
}