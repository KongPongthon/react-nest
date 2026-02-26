import { describe, it, expect, vi } from 'vitest'
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
  getByTitle,
  getByPlaceholderText,
} from '@testing-library/react'
import { renderWithProviders } from '@/integrations/tanstack-query/test-utils'
import { RoomForm } from './room-form'
const mockUnsubscribe = vi.fn()
const mockOn = vi.fn(() => mockUnsubscribe)
// ✅ mock path ต้องตรงกับที่ Room import
vi.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    on: mockOn, // 👈 return unsubscribe function
    idConnect: 'mock-id',
  }),
}))

describe('Room-Form', () => {
  it('check Tab', () => {
    renderWithProviders(<RoomForm name={'test'} />)
  })

  it('onClick', () => {
    renderWithProviders(<RoomForm name={'test'} />)
    const createButton = screen.getByTestId('create-room-button')
    fireEvent.click(createButton)
    expect(screen.getByTestId('create-room-button')).toBeInTheDocument()
    const joinButton = screen.getByTestId('join-room-button')
    fireEvent.click(joinButton)
    expect(screen.getByTestId('join-room-button')).toBeInTheDocument()
    // expect(screen.getByTestId('create-types-button')).toBeInTheDocument()
  })

  it('mock onClick', () => {
    renderWithProviders(<RoomForm name={'test'} />)
    const joinButton = screen.getByTestId('join-room-button')
    fireEvent.click(joinButton)
    expect(screen.getByTestId('join-room-button')).toBeInTheDocument()
    const input = screen.getByPlaceholderText(
      'เช่น: ABC123',
    ) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'ABC123' } })
    expect(input.value).toBe('ABC123')
  })
})
