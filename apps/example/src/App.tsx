import {
  ColumnDef,
  PaginationState,
  Row,
  TableState,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { TableKey } from "./contracts/keys";
import { TuTable } from "@tjernstad-utvikling/table-tw";
import { useTableState } from "./hooks/useTableState";
import usersData from "./data.json";

type Columns = {
  id: number;
  name: string;
  email: string;
  phone: string;
  isLocked: boolean;
};

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<
    {
      id: number;
      name: string;
      email: string;
      phone: string;
      isLocked: boolean;
    }[]
  >([]);

  const [selected, setSelected] = useState<number[]>();
  const [paginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  function updateSelected(rows: Row<Columns>[]) {
    setSelected(rows.map((r) => r.getValue("id")));
  }

  const data = useMemo((): Columns[] => {
    return users.map((user) => {
      return {
        ...user,
      };
    });
  }, [users]);

  const columns: ColumnDef<Columns>[] = useMemo(
    () => [
      {
        header: "#",
        accessorKey: "id",
        enableGrouping: false,
      },
      {
        header: "Name",
        accessorKey: "name",
        enableGrouping: false,
      },
      {
        header: "Email",
        accessorKey: "email",
        enableGrouping: false,
      },
      {
        header: "Locked User",
        accessorKey: "isLocked",
        cell: ({ cell }) => <StatusCell isLocked={cell.getValue<boolean>()} />,
      },
    ],
    [],
  );

  const [tableState, setTableState] = useTableState<TableState>(TableKey.user, {
    columnVisibility: {},
    expanded: {},
  } as TableState);

  useEffect(() => {
    const pageNumber = paginationState?.pageIndex ?? 0;
    const pageSize = paginationState?.pageSize ?? 10;

    setUsers(
      usersData.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize),
    );
  }, [usersData, paginationState]);

  useEffect(() => {
    const load = async () => {
      await new Promise((r) => setTimeout(r, 2000));
      const pageNumber = tableState?.pagination?.pageIndex ?? 0;
      const pageSize = tableState?.pagination?.pageSize ?? 10;

      setUsers(
        usersData.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize),
      );
      // setUsers(usersData);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="w-full p-10">
      <TuTable<Columns>
        columns={columns}
        data={data}
        isLoading={isLoading}
        setTableState={setTableState}
        tableState={tableState}
        enableSelection
        selectedIds={selected}
        setSelected={updateSelected}
      />
    </div>
  );
}

const StatusCell = ({ isLocked }: { isLocked: boolean }) => {
  if (isLocked) {
    return <p>block</p>;
    // <BlockIcon fontSize="small" />;
  }

  return <p>check</p>;
  // <CheckIcon fontSize="small" />;
};
