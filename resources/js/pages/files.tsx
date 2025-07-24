import { FileTableDef } from "@/components/files/file-table-def";
import { MainLayout } from "@/components/main-layout";
import { BreadcrumbItem, File } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Files',
        href: route('files.index'),
    },
];

interface FilesPageProps {
    files: File[];
}

export default function FilesPage({ files }: FilesPageProps) {

    return (
        <MainLayout title="Files" breadcrumbs={breadcrumbs}>

            <FileTableDef data={files}/>

        </MainLayout>
    )

}