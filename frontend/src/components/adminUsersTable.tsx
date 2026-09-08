import {
    useTable, tableFeatures, columnFilteringFeature, rowSortingFeature,
    rowPaginationFeature, rowSelectionFeature, createColumnHelper, FlexRender,
    coreRowModelsFeature, type PaginationState,
    type RowSelectionState,
    globalFilteringFeature,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useGetMembers, useDeleteMember } from "../hooks/memberHook";
import type { getMemberResponse } from "../types/types";
import { useFetchDepartments } from "../hooks/departmentHook";
import { useFetchRoles } from "../hooks/loginHook";

const features = tableFeatures({
    columnFilteringFeature,
    globalFilteringFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    coreRowModelsFeature,
});

const columnHelper = createColumnHelper<typeof features, getMemberResponse>();

type AdminUsersTableProps = {
    onEdit: (member: getMemberResponse) => void;
};

const AdminUsersTable = ({ onEdit }: AdminUsersTableProps) => {
    const [pagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 1000 });
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [departmentFilter, setDepartmentFilter] = useState<number>();
    const [roleFilter, setRoleFilter] = useState("");
    const departmentsQuery = useFetchDepartments();
    const rolesQuery = useFetchRoles();
    const query = useGetMembers(pagination.pageIndex, pagination.pageSize, {
        search: globalFilter,
        departmentId: departmentFilter,
        jobTitle: "",
    });
    const deleteMember = useDeleteMember();

    const handleDelete = async (member: getMemberResponse) => {
        if (!window.confirm(`Delete ${member.firstName} ${member.lastName}? This can't be undone.`)) return;
        await deleteMember.mutateAsync(member.memberId);
    };

    const columns = useMemo(() => columnHelper.columns([
        columnHelper.display({
            id:"select", 
            header: ({table}) => 
                (<input 
                    ref={(element) => {
                    if (element) {
                        element.indeterminate = table.getIsSomeRowsSelected();
                    }
                }}
                type="checkbox" 
                onChange={table.getToggleAllRowsSelectedHandler()}
                checked={table.getIsAllRowsSelected()}
            />),
            cell: ({row}) => 
                (<input 
                type="checkbox"
                onChange={row.getToggleSelectedHandler()} 
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
            />)
        }),
        columnHelper.accessor("firstName", { header: "First Name", cell: (info) => info.getValue() }),
        columnHelper.accessor("lastName", { header: "Last Name", cell: (info) => info.getValue() }),
        columnHelper.accessor("email", { header: "Email", cell: (info) => info.getValue() }),
        columnHelper.accessor("jobTitle", { header: "Job Title", cell: (info) => info.getValue() }),
        columnHelper.accessor("department", { header: "Department", cell: (info) => info.getValue() }),
        columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="admin-row-actions">
                    <button className="table-contols-btn" onClick={() => onEdit(row.original)} aria-label="Edit">
                        <Pencil size={14} />
                    </button>
                    <button className="table-contols-btn danger" onClick={() => handleDelete(row.original)} aria-label="Delete">
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        }),
    ]), [onEdit]);

    const defaultData = useMemo(() => [], []);

    const table = useTable({
        key: "admin-users-table",
        features,
        columns,
        data: query.data?.items ?? defaultData,
        getRowId: (originalRow) => originalRow.memberId,
        state: { pagination, rowSelection, globalFilter},
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        manualPagination: true,
        manualFiltering: true,
        pageCount: -1,
    }, (state) => state);

    if (query.isLoading) return <div className="loading"></div>;
    if (query.isError) return <div className="admin-empty">Couldn't load members.</div>;

    return (
    <div>
        <div className="admin-filters">
                <div className="admin-search">
                    <Search size={15} />
                    <input
                        placeholder="Search by name or email..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>
                <select 
                    value={departmentFilter ?? ""} 
                    onChange={(e) => {
                        const value = e.target.value;
                        setDepartmentFilter(value === "" ? undefined : Number(value))
                    }}
                    >
                    {departmentsQuery.isLoading ? "Loading departments…" : "All Departments"}
                    {departmentsQuery.data?.map((d) => (
                        <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                    ))}
                </select>
                <select 
                    value={roleFilter} 
                    onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="">All roles</option>
                    {rolesQuery.data?.map((r) => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                </select>
            </div>
        <div className="table-container">
            <table>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} colSpan={header.colSpan}>
                                    {header.isPlaceholder ? null : <FlexRender header={header} />}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getAllCells().map((cell) => (
                                <td key={cell.id}>
                                    <FlexRender cell={cell} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
};

export default AdminUsersTable;