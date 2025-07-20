import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@/types';
import { MAX_STALE_TIME } from '@/lib/utils';

const fetchProducts = async (): Promise<Product[]> => {
    const { data } = await axios.get(route('api.products.index'));
    return data;
}

export function useProducts(enabled: boolean = true) {
    return useQuery<Product[], Error>({
        queryKey: ['products'],
        queryFn: fetchProducts,
        staleTime: MAX_STALE_TIME,
        enabled,
    });
}