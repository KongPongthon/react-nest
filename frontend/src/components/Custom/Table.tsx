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
}
export function CustomTable<T>({
  columns,
  data,
  totalItems,
  page,
  rowsPerPage,
  handleOnChange,
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
    <div>
      <Table className="border w-full overflow-x-auto rounded-lg">
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
                  {renderValue(item, col) as React.ReactNode}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.length > 0 && (
        <div className="flex items-center justify-between border-l border-r border-b p-4">
          <div className="text-sm text-muted-foreground">
            {totalItems} รายการ
          </div>
        </div>
      )}
    </div>
  )
}
