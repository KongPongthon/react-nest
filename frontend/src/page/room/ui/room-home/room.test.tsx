// import { describe, it, vi, beforeEach, expect } from 'vitest'

// const mockUnsubscribe = vi.fn()
// const mockOn = vi.fn(() => mockUnsubscribe)

// // ✅ mock path ต้องตรงกับที่ Room import
// vi.mock('@/hooks/useWebSocket', () => ({
//   useWebSocket: () => ({
//     on: mockOn, // 👈 return unsubscribe function
//     idConnect: 'mock-id',
//   }),
// }))

// import { Room } from './room'
// import { renderWithProviders } from '@/integrations/tanstack-query/test-utils'

// describe('Room', () => {
//   it('should API Success render', () => {
//     vi.mock('@/api/room/hook/quries', () => ({
//       useGetRooms: vi.fn().mockReturnValue({
//         data: [{ id: 1, roomCode: 'roomCode' }],
//         isSuccess: true,
//         error: null,
//         isError: false,
//         isPending: false,
//         isLoading: false,
//       }),
//     }))
//     renderWithProviders(<Room />)
//   })
// })

import { describe, it, vi, beforeEach, expect } from 'vitest'
import { act } from '@testing-library/react'
import { Room } from './room'
import * as roomQueries from '@/api/room/hook/quries'
import { renderWithProviders } from '@/integrations/tanstack-query/test-utils'

// สร้างตัวแปรเก็บ Callback ไว้รันเอง
let wsCallback: (data: any) => void
const mockUnsubscribe = vi.fn()

vi.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: vi.fn(() => ({
    on: vi.fn((event, cb) => {
      wsCallback = cb // ดักเก็บฟังก์ชัน upDateRoom ไว้ตรงนี้
      return mockUnsubscribe
    }),
  })),
}))

vi.mock('@/api/room/hook/quries', () => ({
  useGetRooms: vi.fn(),
}))

describe('Room', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('เมื่อ API ไม่สําเร็จ', () => {
    vi.mocked(roomQueries.useGetRooms).mockReturnValue({
      data: null,
      isSuccess: false,
    } as any)

    renderWithProviders(<Room />)
  })

  it('เมื่อ API สำเร็จ', () => {
    vi.mocked(roomQueries.useGetRooms).mockReturnValue({
      data: [{ id: 1, roomCode: 'R01' }],
      isSuccess: true,
    } as any)

    renderWithProviders(<Room />)
  })

  it('จำลอง WebSocket Message', () => {
    vi.mocked(roomQueries.useGetRooms).mockReturnValue({
      data: [],
      isSuccess: true,
    } as any)

    renderWithProviders(<Room />)
    act(() => {
      wsCallback([{ id: 2, roomCode: 'WS-01' }])
    })
  })

  it('Cleanup Function', () => {
    const { unmount } = renderWithProviders(<Room />)
    unmount()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
