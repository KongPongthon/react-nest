import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
  getByTitle,
  getByPlaceholderText,
  act,
} from '@testing-library/react'
import { RoomPoker } from './room-poker'
import { renderWithProviders } from '@/integrations/tanstack-query/test-utils'
import { RoomPokerDetail } from './room-poker-detail'
// ---- mock Params ----
const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ id: 'room-123' }),
  useRouter: () => ({
    navigate: mockNavigate,
  }),
}))

// ---- mock websocket ----
const mockSend = vi.fn()
const mockOn = vi.fn()
vi.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    send: mockSend,
    on: mockOn,
  }),
}))

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

describe('Room-Poker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('render', () => {
    renderWithProviders(<RoomPoker />)
  })

  it('Cleanup Function', () => {
    const { unmount } = renderWithProviders(<RoomPoker />)
    unmount()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
