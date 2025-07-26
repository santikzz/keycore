import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { License } from '@/types';
import { MAX_STALE_TIME } from '@/lib/utils';

const fetchLicense = async (licenseId: number): Promise<License> => {
    const { data } = await axios.get(route('api.licenses.show', { license: licenseId }));
    return data;
}

interface UseLicenseOptions {
    licenseId: number;
    enabled?: boolean;
}

export function useLicense({ licenseId, enabled = true }: UseLicenseOptions) {
    return useQuery<License, Error>({
        queryKey: ['license', licenseId],
        queryFn: () => fetchLicense(licenseId),
        staleTime: 10,
        enabled,
    });
}