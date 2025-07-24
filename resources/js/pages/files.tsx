import { MainLayout } from "@/components/main-layout";
import { ProductTableDef } from "@/components/products/product-table-def";
import { BreadcrumbItem, Product } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: route('products.index'),
    },
];

interface ProductsPageProps {
    products: Product[];
}

export default function ProductsPage({ products }: ProductsPageProps) {

    return (
        <MainLayout title="Files" breadcrumbs={breadcrumbs}>

            <ProductTableDef data={products}/>

        </MainLayout>
    )

}