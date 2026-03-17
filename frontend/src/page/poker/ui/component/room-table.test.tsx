import { describe, it, expect, vi } from 'vitest'
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from '@testing-library/react'
import * as roomMutation from '@/api/room/hook/mutation'
const mockUnsubscribe = vi.fn()
const mockOn = vi.fn(() => mockUnsubscribe)
// ✅ mock path ต้องตรงกับที่ Room import
vi.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    on: mockOn, // 👈 return unsubscribe function
    idConnect: 'mock-id',
  }),
}))
const mockMutateAsync = vi.fn()

// 2. เอาตัวแปรนี้ไปเสียบแทนที่ usePostRoom และ useJoinRoom
vi.mock('@/api/room/hook/mutation', () => ({
  usePostRoom: () => ({
    mutateAsync: mockMutateAsync, // 👈 นี่ไง! ตอนนี้มันจะรู้จักแล้ว
  }),
  useJoinRoom: () => ({
    mutateAsync: mockMutateAsync,
  }),
}))
import RoomTable from './room-table'
import { renderWithProviders } from '@/integrations/tanstack-query/test-utils'

describe('Room-Table', () => {
  it('check Tab', () => {
    renderWithProviders(<RoomTable rooms={[]} />)
    const createButton = screen.getByTestId('create-types-button')
    fireEvent.click(createButton)
    expect(screen.getByTestId('create-types-button')).toBeInTheDocument()

    const listButton = screen.getByTestId('room-list-button')
    fireEvent.click(listButton)
    expect(screen.getByTestId('room-list-button')).toBeInTheDocument()
  })

  vi.mock('@/components/Custom/Table', () => ({
    CustomTable: ({ handleOnChange, data }: any) => (
      <div data-testid="mock-table">
        {data.map((item: any) => (
          <button
            key={item.id}
            onClick={() => handleOnChange(item)} // จำลองการคลิกเลือกแถว
            data-testid={`select-room-${item.id}`}
          >
            Select {item.roomCode}
          </button>
        ))}
      </div>
    ),
  }))

  it('handleSelectRoom ผ่าน mock', () => {
    const mockRooms = [{ id: 101, roomCode: 'Room-A' }]
    renderWithProviders(<RoomTable rooms={mockRooms} />)
    fireEvent.click(screen.getByTestId('room-list-button'))

    fireEvent.click(screen.getByTestId('select-room-101'))
    // expect(mockMutateAsync).toHaveBeenCalled()
  })
})
