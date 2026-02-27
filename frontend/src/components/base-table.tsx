import * as React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/button'
import { cn } from '@/lib/utils'

const DEBOUNCE_MS = 300
const DEFAULT_LIMIT_OPTIONS = [10, 20, 30]

export interface BaseTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  totalCount?: number
  totalPage?: number

  onSearch?: (keyword: string) => void
  searchPlaceholder?: string

  page?: number
  limit?: number
  onPageChange?: (page: number, limit: number) => void
  limitOptions?: number[]

  extra?: React.ReactNode
  className?: string

  /** คลิกทั้งแถว — ส่ง (row, index) กลับ */
  onRowClick?: (row: TData, index: number) => void
}

function useDebouncedCallback<T extends (arg: string) => void>(
  callback: T,
  delay: number,
): T {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = React.useRef(callback)
  callbackRef.current = callback

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const debounced = React.useCallback(
    (arg: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        callbackRef.current(arg)
      }, delay)
    },
    [delay],
  )
  return debounced as T
}

function getPageNumbers(
  currentPage: number,
  totalPage: number,
): (number | 'ellipsis')[] {
  if (totalPage <= 0) return []
  if (totalPage <= 6) {
    return Array.from({ length: totalPage }, (_, i) => i + 1)
  }
  const result: (number | 'ellipsis')[] = []
  const start = currentPage
  const end = Math.min(currentPage + 4, totalPage)
  const needStart = currentPage > 1
  const needEnd = end < totalPage
  if (needStart) {
    result.push(1, 'ellipsis')
  }
  for (let p = start; p <= end; p++) {
    result.push(p)
  }
  if (needEnd) {
    result.push('ellipsis', totalPage)
  }
  return result
}

function BaseTable<TData extends object>({
  columns,
  data,
  totalCount = 0,
  totalPage: totalPageProp = 1,
  onSearch,
  searchPlaceholder = 'ค้นหา...',
  page: pageProp,
  limit: limitProp,
  onPageChange,
  limitOptions = DEFAULT_LIMIT_OPTIONS,
  extra,
  className,
  onRowClick,
}: BaseTableProps<TData>) {
  const [internalPage, setInternalPage] = React.useState(1)
  const [internalLimit, setInternalLimit] = React.useState(
    limitOptions[0] ?? 10,
  )

  const isPageControlled = pageProp !== undefined
  const isLimitControlled = limitProp !== undefined
  const page = isPageControlled ? pageProp : internalPage
  const limit = isLimitControlled ? limitProp : internalLimit

  const totalPage = Math.max(1, totalPageProp)

  const handlePageChange = React.useCallback(
    (newPage: number, newLimit: number) => {
      if (!isPageControlled) setInternalPage(newPage)
      if (!isLimitControlled && newLimit !== limit) setInternalLimit(newLimit)
      onPageChange?.(newPage, newLimit)
    },
    [isPageControlled, isLimitControlled, limit, onPageChange],
  )

  const debouncedSearch = useDebouncedCallback<(keyword: string) => void>(
    (keyword: string) => {
      onSearch?.(keyword)
    },
    DEBOUNCE_MS,
  )

  const [searchValue, setSearchValue] = React.useState('')
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setSearchValue(v)
    debouncedSearch(v)
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const pageNumbers = getPageNumbers(page, totalPage)

  const handleLimitChange = (value: string) => {
    const newLimit = Number(value)
    handlePageChange(1, newLimit)
  }

  const hasSearch = typeof onSearch === 'function'
  const hasToolbar = hasSearch || extra != null

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {hasToolbar && (
        <div className="flex flex-wrap items-center gap-3">
          {hasSearch && (
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchInputChange}
              className="w-full max-w-xs"
              aria-label="ค้นหา"
            />
          )}
          {extra != null && <div className="ml-auto">{extra}</div>}
        </div>
      )}

      <div className="relative w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={
                    onRowClick
                      ? () => onRowClick(row.original, row.index)
                      : undefined
                  }
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1, limit)}
            aria-label="หน้าที่แล้ว"
          >
            <ChevronLeft className="size-4" />
          </Button>
          {pageNumbers.map((p, i) =>
            p === 'ellipsis' ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={page === p ? 'default' : 'outline'}
                size="icon-sm"
                onClick={() => handlePageChange(p, limit)}
              >
                {p}
              </Button>
            ),
          )}
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page >= totalPage}
            onClick={() => handlePageChange(page + 1, limit)}
            aria-label="หน้าถัดไป"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Select value={String(limit)} onValueChange={handleLimitChange}>
            <SelectTrigger size="sm" className="ml-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default BaseTable
