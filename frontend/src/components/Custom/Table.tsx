import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
export interface TableColumn<T> {
  key: keyof T | (keyof T)[]
  name: string
}
interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  totalItems?: number
  page: number
  rowsPerPage: number
  handleOnChange?: (id: string) => void
}
type WithId = {
  id: string
}
export function CustomTable<T extends WithId>({
  columns,
  data,
  totalItems,
  page,
  rowsPerPage,
  handleOnChange,
}: TableProps<T>) {
  const handleChangeColumn = (id: string) => {
    handleOnChange?.(id)
    console.log('คลิกแล้ว')
  }
  return (
    <>
      <Table>
        <TableCaption>Pagination</TableCaption>
        <TableHeader>
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead key={idx}>{col.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={item.id}
              onClick={() => handleChangeColumn(item.id)}
              className="hover:cursor-pointer"
            >
              <TableCell className="font-medium">
                {page * rowsPerPage + index + 1}
              </TableCell>
              {columns.map((col, idx) => (
                <TableCell key={`${idx}`}>TEST</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
