import { useState } from "react"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState, } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { File } from "@/types"
import { SearchInput } from "../search-input"
import { FileCreateDialog } from "./file-create-dialog"
import { Deferred } from "@inertiajs/react"
import { FileEditDialog } from "./file-edit-dialog"
import { Pagination, PaginationContent, PaginationItem, } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon, ArrowUpDown, EditIcon, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"

interface FileTableDefProps {
    data: File[];
}

export const FileTableDef = ({ data = [] }: FileTableDefProps) => {

    const columns: ColumnDef<File>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "custom_name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Custom Name
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <span>{row.getValue("custom_name")}</span>
            ),
        },
        {
            accessorKey: "file_name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        File Name
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <span>{row.getValue("file_name")}</span>,
        },
        {
            accessorKey: "is_hidden",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Hidden
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <span className="capitalize">{row.original.is_hidden ? 'hidden' : 'visible'}</span>,
        },
        {
            accessorKey: "is_downloadable",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Downloadable
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <span className="capitalize">{row.original.is_downloadable ? 'yes' : 'no'}</span>,
        },
        {
            accessorKey: "actions",
            header: ({ column }) => { },
            cell: ({ row }) =>
                <div className="flex justify-end pr-4">
                    <Button
                        className="size-8 text-primary"
                        variant="ghost"
                        onClick={() => handleRowClick(row)}
                    >
                        <EditIcon className="size-4" />
                    </Button>
                </div>,
        },

    ]

    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const [sorting, setSorting] = useState<SortingState>([])
    const [rowSelection, setRowSelection] = useState({})
    const [globalFilter, setGlobalFilter] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15, });

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        state: {
            sorting,
            rowSelection,
            globalFilter,
            pagination
        },
    })

    const handleRowClick = (row: any) => {
        const product = row.original as File;
        setSelectedFile(product);
        setEditDialogOpen(true);
    }

    return (
        <>
            <div className="w-full">
                <div className="flex items-center py-4 gap-4">
                    <FileCreateDialog />
                    <SearchInput
                        value={globalFilter ?? ""}
                        onChange={value => setGlobalFilter(value)}
                        className="w-96"
                    />
                </div>
                <div className="rounded-md border bg-background overflow-hidden">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-sidebar">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="odd:bg-muted/50 odd:hover:bg-muted/50 border-none hover:bg-transparent"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        <Deferred data="files" fallback={
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="animate-spin size-8 text-primary" />
                                            </div>
                                        }>
                                            No results.
                                        </Deferred>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between gap-8 py-4">
                    {/* Results per page */}
                    <div className="flex items-center gap-3">
                        <Label className="max-sm:sr-only">
                            Rows per page
                        </Label>
                        <Select
                            value={table.getState().pagination.pageSize.toString()}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="w-fit whitespace-nowrap">
                                <SelectValue placeholder="Select number of results" />
                            </SelectTrigger>
                            <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                                {[5, 10, 15, 25, 50, 100].map((pageSize) => (
                                    <SelectItem key={pageSize} value={pageSize.toString()}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Page number information */}
                    <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
                        <p
                            className="text-muted-foreground text-sm whitespace-nowrap"
                            aria-live="polite"
                        >
                            <span className="text-foreground">
                                {table.getState().pagination.pageIndex *
                                    table.getState().pagination.pageSize +
                                    1}
                                -
                                {Math.min(
                                    Math.max(
                                        table.getState().pagination.pageIndex *
                                        table.getState().pagination.pageSize +
                                        table.getState().pagination.pageSize,
                                        0
                                    ),
                                    table.getRowCount()
                                )}
                            </span>{" "}
                            of{" "}
                            <span className="text-foreground">
                                {table.getRowCount().toString()}
                            </span>
                        </p>
                    </div>

                    {/* Pagination buttons */}
                    <div>
                        <Pagination>
                            <PaginationContent>
                                {/* First page button */}
                                <PaginationItem>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="disabled:pointer-events-none disabled:opacity-50"
                                        onClick={() => table.firstPage()}
                                        disabled={!table.getCanPreviousPage()}
                                        aria-label="Go to first page"
                                    >
                                        <ChevronFirstIcon size={16} aria-hidden="true" />
                                    </Button>
                                </PaginationItem>
                                {/* Previous page button */}
                                <PaginationItem>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="disabled:pointer-events-none disabled:opacity-50"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                        aria-label="Go to previous page"
                                    >
                                        <ChevronLeftIcon size={16} aria-hidden="true" />
                                    </Button>
                                </PaginationItem>
                                {/* Next page button */}
                                <PaginationItem>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="disabled:pointer-events-none disabled:opacity-50"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                        aria-label="Go to next page"
                                    >
                                        <ChevronRightIcon size={16} aria-hidden="true" />
                                    </Button>
                                </PaginationItem>
                                {/* Last page button */}
                                <PaginationItem>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="disabled:pointer-events-none disabled:opacity-50"
                                        onClick={() => table.lastPage()}
                                        disabled={!table.getCanNextPage()}
                                        aria-label="Go to last page"
                                    >
                                        <ChevronLastIcon size={16} aria-hidden="true" />
                                    </Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>

            </div>

            {editDialogOpen && selectedFile &&
                <FileEditDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    file={selectedFile}
                />
            }

        </>
    );

}