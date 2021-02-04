import {
  Button,
  Heading,
  Input,
  Portal,
  Spinner,
  useToast,
} from "@chakra-ui/react"
import React, { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Search } from "react-feather"
import { useTable, usePagination, useGlobalFilter, Column } from "react-table"
import type { ProgramRecord } from "../../types/struct"
import dayjs from "dayjs"
import { Link } from "rocon/react"
import { recordsRoute } from "../../routes"
import { useDebounce } from "react-use"
import { useBackend } from "../../hooks/backend"
import { useChannels } from "../../hooks/television"
import { useToasts } from "react-toast-notifications"

export const RecordsPage: React.VFC<{}> = () => {
  const backend = useBackend()
  const toast = useToasts()
  const [_records, setRecords] = useState<ProgramRecord[] | null>(null)
  const records = useMemo(() => _records || [], [_records])
  const { channels } = useChannels()

  const columns: Column<ProgramRecord>[] = useMemo(
    () => [
      {
        id: "channel",
        Header: "放送局",
        accessor: (record: ProgramRecord) =>
          channels &&
          channels.find((channel) => record.channelId === channel.id)?.name,
      },
      {
        id: "name",
        Header: "番組名",
        accessor: (record: ProgramRecord) => record.name,
      },
      {
        id: "startAt",
        Header: "放送日時",
        accessor: (record: ProgramRecord) =>
          dayjs(record.startAt).format("YYYY/MM/DD HH:mm"),
      },
      {
        id: "duration",
        Header: "長さ",
        accessor: (record: ProgramRecord) =>
          (record.endAt - record.startAt) / 1000 / 60,
        Cell: ({ value }: { value: number }) => `${value}m`,
      },
    ],
    [channels]
  )

  const [total, setTotal] = useState<number | null>(null)
  const [_pageSize, setPageSize] = useState(20)

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    pageOptions,
    state: { pageIndex, globalFilter, pageSize },
    previousPage,
    nextPage,
    canPreviousPage,
    canNextPage,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data: records || [],
      initialState: { pageSize: 20 },
      manualPagination: true,
      pageCount: Math.ceil((total || 0) / _pageSize),
    },
    useGlobalFilter,
    usePagination
  )

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  const [filterState, setFilterState] = useState(globalFilter)
  useDebounce(
    () => {
      setGlobalFilter(filterState)
    },
    100,
    [filterState]
  )

  useEffect(() => {
    setPageSize(pageSize)
    backend
      .getRecords({ offset: pageSize * pageIndex, limit: pageSize })
      .then(({ records, total }) => {
        setTotal(total)
        setRecords(records)
      })
      .catch(() =>
        toast.addToast("録画番組の取得に失敗しました", {
          appearance: "error",
          autoDismiss: true,
        })
      )
  }, [pageIndex, pageSize])
  return (
    <>
      <div className="bg-gray-800 text-gray-200">
        <div className="py-2 mx-auto container px-2 flex items-center justify-between">
          <Heading as="h2" size="md">
            録画番組
          </Heading>
          <button
            className="flex items-center space-x-2"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <Search size={18} />
            <span>検索</span>
          </button>
        </div>
      </div>
      <div className="mx-auto px-2 py-2 overflow-auto">
        {_records === null || !channels ? (
          <div
            className="flex items-center justify-center h-full w-full"
            style={{ minHeight: "60vh" }}
          >
            <Spinner size="md" color="gray.600" />
          </div>
        ) : (
          <div {...getTableProps()} className="table w-full rounded-md">
            <div className="table-header-group">
              {headerGroups.map((headerGroup) => (
                <div
                  className="table-row"
                  {...headerGroup.getHeaderGroupProps()}
                >
                  {headerGroup.headers.map((column, idx, columns) => (
                    <div
                      {...column.getHeaderProps()}
                      className={`table-cell text-center font-bold text-gray-800 ${
                        idx < columns.length - 1 && "border-r"
                      } border-gray-400`}
                    >
                      {column.render("Header")}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="table-row-group" {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row)
                return (
                  <Link
                    role="cell block"
                    className="table-row hover:bg-gray-200 cursor-pointer"
                    route={recordsRoute.anyRoute}
                    match={{ id: row.original.id.toString() }}
                    title={[
                      row.original.name,
                      row.original.description,
                      row.original.extended,
                    ]
                      .filter((s) => !!s)
                      .join("\n\n")}
                    {...row.getRowProps()}
                  >
                    {row.cells.map((cell, idx, cells) => {
                      return (
                        <span
                          {...cell.getCellProps()}
                          className={`table-cell px-2 whitespace-pre truncate ${
                            idx < columns.length - 1 && "border-r"
                          } border-gray-400`}
                        >
                          {cell.render("Cell")}
                        </span>
                      )
                    })}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <div className="px-2 my-4 flex justify-center items-center space-x-4">
        <button
          type="button"
          disabled={!canPreviousPage}
          onClick={() => previousPage()}
          className={`${
            !canPreviousPage && "cursor-not-allowed text-gray-400"
          }`}
        >
          <ArrowLeft />
        </button>
        <div>
          {pageIndex + 1}/{pageOptions.length || 1}
        </div>
        <button
          type="button"
          disabled={!canNextPage}
          onClick={() => nextPage()}
          className={`${!canNextPage && "cursor-not-allowed text-gray-400"}`}
        >
          <ArrowRight />
        </button>
      </div>
      {isSearchModalOpen && (
        <Portal>
          <div className="fixed w-full h-full left-0 top-0 ">
            <div
              className="z-10 absolute w-full h-full left-0 top-0 bg-gray-800 opacity-25"
              onClick={() => setIsSearchModalOpen(false)}
            ></div>
            <div className="w-full h-full flex items-center justify-center">
              <div className="z-20 p-4 rounded-md bg-gray-100">
                <div className="text-lg mb-4">検索</div>
                <Input
                  className="bg-gray-100 mb-4"
                  placeholder="タイトル"
                  value={filterState || ""}
                  onChange={(e) => setFilterState(e.target.value || undefined)}
                />
                <div className="flex items-center justify-start space-x-4">
                  <Button
                    colorScheme="blue"
                    onClick={() => {
                      setIsSearchModalOpen(false)
                    }}
                  >
                    検索
                  </Button>
                  <Button colorScheme="gray">リセット</Button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
