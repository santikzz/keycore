import { LicenseTableDef } from "@/components/licenses/licenses-table-def";
import { MainLayout } from "@/components/main-layout";
import { BreadcrumbItem, License, Product } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Licenses',
        href: route('licenses.index'),
    },
];

interface LicensesPageProps {
    licenses: License[];
    products: Product[];
}

export default function LicensesPage({
    licenses,
    products
}: LicensesPageProps) {

    return (
        <MainLayout title="Licenses" breadcrumbs={breadcrumbs}>

            <LicenseTableDef
                data={licenses}
                products={products}
            />

        </MainLayout>
    )

}