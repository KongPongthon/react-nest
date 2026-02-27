import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
export interface TableColumn<T> {
  key: keyof T | (keyof T)[]
  id: string
  name: string
}
interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  totalItems?: number
  page: number
  rowsPerPage: number
  handleOnChange?: (data: T) => void
  render?: (item: T) => React.ReactNode
}
export function CustomTable<T>({
  columns,
  data,
  totalItems,
  page,
  rowsPerPage,
  handleOnChange,
  render,
}: TableProps<T>) {
  const handleChangeColumn = (data: T) => {
    handleOnChange?.(data)
    console.log('คลิกแล้ว')
  }

  const renderValue = (item: T, col: TableColumn<T>) => {
    if (Array.isArray(col.key)) {
      return col.key.map((key) => item[key]).join(', ')
    }
    return item[col.key]
  }

  return (
    <div className="h-full w-full space-y-3">
      <div className="border rounded-lg">
        <Table className=" w-full overflow-x-auto ">
          <TableHeader>
            <TableRow>
              <TableHead>ลำดับ</TableHead>
              {columns.map((col, idx) => (
                <TableHead key={idx}>{col.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow
                key={index}
                onClick={() => handleChangeColumn(item)}
                className={cn('hover:cursor-pointer')}
              >
                <TableCell className="font-medium p-4">
                  {page * rowsPerPage + index + 1}
                </TableCell>
                {columns.map((col, idx) => (
                  <TableCell key={`${idx}`}>
                    {render
                      ? render(item)
                      : (renderValue(item, col) as React.ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {data.length > 0 && (
        <div className="flex items-center justify-end">
          <div className="text-sm text-muted-foreground">
            {totalItems} รายการ
          </div>
        </div>
      )}
    </div>
  )
}
