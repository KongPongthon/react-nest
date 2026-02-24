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
import { renderWithProviders } from '@/integrations/tanstack-query/test-utils'
import { RoomPokerDetail } from './room-poker-detail'
// ---- mock websocket ----
const mockSend = vi.fn()
let wsCallback: (data: any) => void
const mockUnsubscribe = vi.fn()
vi.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    send: mockSend,
    on: vi.fn((event, cb) => {
      wsCallback = cb // ดักเก็บฟังก์ชัน upDateRoom ไว้ตรงนี้
      return mockUnsubscribe
    }),
  }),
}))

describe('Room-Poker-Detail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('render', () => {
    renderWithProviders(<RoomPokerDetail />)
  })

  it('onClick Sitdown and Situp', async () => {
    renderWithProviders(<RoomPokerDetail />)
    const sitdown = screen.getByTestId('sitdown-0')
    expect(sitdown).toBeInTheDocument()
    fireEvent.click(sitdown)

    await act(async () => {
      wsCallback({
        seats: [{ index: 0, role: 'Player', userName: 'Kong' }],
      })
    })

    const situp = screen.getByTestId('situp-0')
    expect(situp).toBeInTheDocument()
    fireEvent.click(situp)

    await act(async () => {
      wsCallback({
        seats: [{ index: 0, role: 'Guest', userName: '' }],
      })
    })
    const sitdownAgain = screen.getByTestId('sitdown-0')
    expect(sitdownAgain).toBeInTheDocument()
  })

  it('check Host', async () => {
    renderWithProviders(<RoomPokerDetail />)
    await act(async () => {
      wsCallback({
        seats: [{ index: 0, role: 'Host', userName: 'Kong' }],
      })
    })

    const host = screen.getByTestId('host-icon')
    expect(host).toBeInTheDocument()
  })
})
