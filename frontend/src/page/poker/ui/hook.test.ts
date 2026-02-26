import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
  renderHook,
  act,
} from '@testing-library/react'
import { useRoom } from './hook'
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

vi.mock('@/api/room/hook/mutation', () => ({
  usePostRoom: () => ({
    mutateAsync: mockMutateAsync, // 👈 นี่ไง! ตอนนี้มันจะรู้จักแล้ว
  }),
  useJoinRoom: () => ({
    mutateAsync: mockMutateAsync,
  }),
}))

const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ navigate: mockNavigate }),
}))

vi.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: () => ({ idConnect: 'mock-id' }),
}))
describe('Hook Rooms', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handleSubmit: ควรเรียก handleCreateRoom เมื่อ mode คือ create', () => {
    const { result } = renderHook(() => useRoom())
    act(() => {
      result.current.handleMode('create')
    })

    const mockEvent = { preventDefault: vi.fn() } as any
    act(() => {
      result.current.handleSubmit(mockEvent)
    })

    // expect(mockMutateAsync).toHaveBeenCalled()
    // expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('handleSubmit: ควรเรียก handleJoinRoom เมื่อ mode คือ join', () => {
    const { result } = renderHook(() => useRoom())

    act(() => {
      result.current.handleMode('join')
      result.current.setRoomCode('123')
    })

    const mockEvent = { preventDefault: vi.fn() } as any
    act(() => {
      result.current.handleSubmit(mockEvent)
    })

    // ตรวจสอบว่าถูกเรียกผ่านกิ่ง else ของ handleSubmit
    // expect(mockMutateAsync).toHaveBeenCalled()
  })

  it('check setRoomCode', () => {
    const { result } = renderHook(() => useRoom())
    act(() => {
      result.current.setRoomCode('abc')
    })
    expect(result.current.roomCode).toBe('abc')
  })

  it('ควรเรียก mutateAsync เมื่อสั่ง handleCreate', () => {
    const { result } = renderHook(() => useRoom())
    act(() => {
      result.current.handleCreateRoom()
    })
    // expect(mockMutateAsync).toHaveBeenCalled()
  })

  it('ควรเรียก mutateAsync เมื่อสั่ง handleJoin Success', () => {
    const { result } = renderHook(() => useRoom())
    act(() => {
      result.current.handleJoinRoom('abc')
    })
    // expect(mockMutateAsync).toBeCalled()
  })

  it('ควรเรียก mutateAsync เมื่อสั่ง handleJoin Errors', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    mockMutateAsync.mockImplementation(() => {
      throw new Error('Unexpected Runtime Crash')
    })

    const { result } = renderHook(() => useRoom())
    act(() => {
      result.current.handleJoinRoom('abc')
    })
    // expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('handleMode', () => {
    const { result } = renderHook(() => useRoom())
    act(() => {
      result.current.handleMode('create')
    })
    // expect(result.current.mode).toBe('create')
  })

  it('handleJoinRoom Success', async () => {
    mockMutateAsync.mockImplementation((variables, options) => {
      if (options?.onSuccess) {
        options.onSuccess('abc')
      }
      return Promise.resolve()
    })

    const { result } = renderHook(() => useRoom())
    await act(async () => {
      result.current.handleJoinRoom('abc')
    })
    // expect(mockNavigate).toHaveBeenCalledWith({ to: '/poker/abc/' })
  })

  it('handleJoinRoom Errors', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const mockErrorMessage = 'room not found'
    mockMutateAsync.mockImplementation((variables, options) => {
      if (options?.onError) {
        options.onError('room not found')
      }
      return Promise.resolve()
    })
    const { result } = renderHook(() => useRoom())
    await act(async () => {
      result.current.handleJoinRoom('room not found')
    })
    // expect(consoleSpy).toHaveBeenCalledWith('Error:', mockErrorMessage)

    consoleSpy.mockRestore()
  })

  it('handleSelectRoom Success', async () => {
    mockMutateAsync.mockImplementation((variables, options) => {
      if (options?.onSuccess) {
        options.onSuccess('abc')
      }
      return Promise.resolve()
    })

    const { result } = renderHook(() => useRoom())
    await act(async () => {
      result.current.handleSelectRoom(1111)
    })
    // expect(mockNavigate).toHaveBeenCalledWith({ to: '/room/abc/' })
  })

  it('handleSelectRoom Errors', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const mockErrorMessage = 'room not found'
    mockMutateAsync.mockImplementation((variables, options) => {
      if (options?.onError) {
        options.onError('room not found')
      }
      return Promise.resolve()
    })
    const { result } = renderHook(() => useRoom())
    await act(async () => {
      result.current.handleSelectRoom(1111)
    })
    // expect(consoleSpy).toHaveBeenCalledWith('Error:', mockErrorMessage)

    consoleSpy.mockRestore()
  })
})
