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
import { isConnectSocket, useRoom } from './hook'

const mockSend = vi.fn()
const mockReconnect = vi.fn()
const mockUnsubscribe = vi.fn()
const mockOn = vi.fn(() => mockUnsubscribe)
const { mockWebSocket } = vi.hoisted(() => {
  const mockWebSocket = {
    on: vi.fn(() => vi.fn()),
    send: vi.fn(),
    reconnect: vi.fn(),
    idConnect: 'mock-id',
    isConnected: true,
  }
  return { mockWebSocket }
})
// Hook Mock

// ✅ mock path ต้องตรงกับที่ Room import
// vi.mock('@/hooks/useWebSocket', () => ({
//   useWebSocket: () => ({
//     on: mockOn, // 👈 return unsubscribe function
//     idConnect: 'mock-id',
//     isConnected: true,
//   }),
// }))

vi.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: () => mockWebSocket,
}))

// API Mock
const mockMutateAsync = vi.fn()

vi.mock('@/api/room/hook/mutation', () => ({
  usePostRoom: () => ({
    mutateAsync: mockMutateAsync,
  }),
  useJoinRoom: () => ({
    mutateAsync: mockMutateAsync,
  }),
}))

// Router Mock
const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ navigate: mockNavigate }),
}))

describe('Hook Rooms', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWebSocket.isConnected = true
    mockWebSocket.idConnect = 'mock-id'
  })

  it('create => handleSubmit', async () => {
    const { result } = renderHook(() => useRoom())
    act(() => {
      result.current.handleMode('create')
    })

    const mockEvent = { preventDefault: vi.fn() } as any
    await act(async () => {
      result.current.handleSubmit(mockEvent)
    })

    expect(mockMutateAsync).toHaveBeenCalled()
    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('join => handleSubmit', async () => {
    const { result } = renderHook(() => useRoom())

    act(() => {
      result.current.handleMode('join')
      result.current.setRoomCode('123')
    })

    const mockEvent = { preventDefault: vi.fn() } as any
    await act(async () => {
      result.current.handleSubmit(mockEvent)
    })

    // ตรวจสอบว่าถูกเรียกผ่านกิ่ง else ของ handleSubmit
    expect(mockMutateAsync).toHaveBeenCalled()
  })

  it('handleSumbit — ไม่เรียก mutateAsync เมื่อ isConnected เป็น false', async () => {
    mockWebSocket.isConnected = false // หรือ mockUseWebSocket.mockReturnValue(...)
    mockWebSocket.idConnect = ''

    const { result } = renderHook(async () => useRoom())
    await act(async () => {
      ;(await result.current).handleSubmit({ preventDefault: vi.fn() } as any)
    })

    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('create — ไม่เรียก mutateAsync เมื่อ isConnected เป็น false', () => {
    mockWebSocket.isConnected = false // หรือ mockUseWebSocket.mockReturnValue(...)
    mockWebSocket.idConnect = ''

    const { result } = renderHook(() => useRoom())
    act(() => {
      result.current.handleCreateRoom()
    })

    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('join — ไม่เรียก mutateAsync เมื่อ isConnected เป็น false', () => {
    mockWebSocket.isConnected = false // หรือ mockUseWebSocket.mockReturnValue(...)
    mockWebSocket.idConnect = ''

    const { result } = renderHook(() => useRoom())
    act(() => {
      result.current.handleJoinRoom('123')
    })

    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('return false และพ่น log เมื่อ status เป็น false', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    expect(isConnectSocket(false)).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith('please refresh page')
    consoleSpy.mockRestore()
  })

  it('return true เมื่อ status เป็น true', () => {
    expect(isConnectSocket(true)).toBe(true)
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
    expect(mockMutateAsync).toHaveBeenCalled()
  })

  it('ควรเรียก mutateAsync เมื่อสั่ง handleJoin Success', () => {
    const { result } = renderHook(() => useRoom())
    act(() => {
      result.current.handleJoinRoom('abc')
    })
    expect(mockMutateAsync).toBeCalled()
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
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('handleMode', () => {
    const { result } = renderHook(() => useRoom())
    act(() => {
      result.current.handleMode('create')
    })
    expect(result.current.mode).toBe('create')
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
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/poker/abc/' })
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
    expect(consoleSpy).toHaveBeenCalledWith('Error:', mockErrorMessage)

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
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/poker/abc/' })
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
    expect(consoleSpy).toHaveBeenCalledWith('Error:', mockErrorMessage)

    consoleSpy.mockRestore()
  })
})
