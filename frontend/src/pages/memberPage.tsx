import {useTable, tableFeatures, columnFilteringFeature, rowSortingFeature, rowPaginationFeature, createColumnHelper, type PaginationState, FlexRender, coreRowModelsFeature,} from "@tanstack/react-table"
import type { getMemberResponse } from "../types/types"
import { useGetMembers } from "../hooks/memberHook";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import {useTanStackTableDevtools} from '@tanstack/react-table-devtools';
import "../styles/memberPage.css"
import { useFetchDepartments } from "../hooks/departmentHook";
import UserActionsMenu from "../components/usersActionsMenu";
import Loader from "../components/loader";
import type { selectedUser } from "../contexts/chatContext";

const features = tableFeatures({
    columnFilteringFeature,
    rowPaginationFeature,
    rowSortingFeature,
    coreRowModelsFeature,
})

const columnHelper = createColumnHelper<typeof features, getMemberResponse>();

const MembersPage = () => {
    const [pagination, setPagination] = useState<PaginationState>({pageIndex:0, pageSize:10});
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [departmentFilter, setDepartmentFilter] = useState<number>();
    const departmentsQuery = useFetchDepartments();
    const query = useGetMembers(pagination.pageIndex, pagination.pageSize, {
        search: globalFilter,
        departmentId: departmentFilter,
        jobTitle: "",
    });

    const clearFilters = () => {
        setGlobalFilter("");
        setDepartmentFilter(undefined);
        setPagination(prev => ({
            ...prev,
            pageIndex: 0
        }
    ));};

    const columns = columnHelper.columns([
        columnHelper.accessor("firstName", {header:"FirstName", cell:(info)=>info.getValue()}),
        columnHelper.accessor("lastName", {header:"LastName", cell:(info)=>info.getValue()}),
        columnHelper.accessor("email", {header:"Email", cell:(info)=>info.getValue()}),
        columnHelper.accessor("dateJoined", {
            header: "DateJoined",
            cell: (info) => new Date(info.getValue()).toLocaleDateString(undefined, {
                year: "numeric", month: "short", day: "numeric",
            }),
        }),
        columnHelper.accessor("jobTitle", { header:"JobTitle", cell:(info)=>info.getValue()}),
        columnHelper.accessor("department", {header:"Department", cell:(info)=>info.getValue()}),
        columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: ({row}) => {
                const userId = row.original.memberId;
                const fullName = `${row.original.firstName} ${row.original.lastName}`;
                const user:selectedUser = {userId, fullName, profilePictureUrl:null}; //to be revisited
                return(
                    <UserActionsMenu user={user}/>
                )
            } 
        })
    ]);
    const defaultData = useMemo(()=>[],[]);
    const table = useTable({
        key: 'basic-use-table',
        features,
        columns,
        data: query.data?.items ?? defaultData,
        getRowId: (originalRow) => originalRow.memberId,
        state: {pagination},
        manualPagination: true,
        onPaginationChange: setPagination,
        pageCount: query.data?.totalPages,
        debugTable: true
    }, (state) => state
    )

    useTanStackTableDevtools(table)
    if(query.isLoading)return(<Loader />);
    if(query.isError) console.error(query.error);

    return(
        <div className="member-container">
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
                    <option value="">All Departments</option>
                    {departmentsQuery.data?.map((d) => (
                        <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                    ))}
                </select>
                <button
                    className="clear-filters-btn"
                    onClick={clearFilters}
                    disabled={!globalFilter && departmentFilter === undefined}
                >
                    Clear Filters
                </button>
            </div>
                <table>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder ? null : <FlexRender header={header}/>}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getAllCells().map(cell => (
                                    <td key={cell.id}>
                                        <FlexRender cell={cell}/>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="table-controls">
                    <button className="table-contols-btn" onClick={()=>table.firstPage()} disabled={!table.getCanPreviousPage()}>{<ChevronsLeft/>}</button>
                    <button className="table-contols-btn" onClick={()=>table.previousPage()} disabled={!table.getCanPreviousPage()}>{<ChevronLeft/>}</button>
                    <span>Page {table.state.pagination.pageIndex+1} of {table.getPageCount()}</span>
                    <button className="table-contols-btn" onClick={()=>table.nextPage()} disabled={!table.getCanNextPage()}>{<ChevronRight/>}</button>
                    <button className="table-contols-btn" onClick={()=>table.lastPage()} disabled={!table.getCanNextPage()}>{<ChevronsRight/>}</button>
                </div>
        </div>
    )
}

export default MembersPage