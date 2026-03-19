import { describe, it, expect, vi } from 'vitest'
import { logoutAction } from './logout.action'
import { signOut } from '@/_shared/lib/auth'

vi.mock('@/_shared/lib/auth', () => ({
  signOut: vi.fn(),
}))

describe('Logout Action', () => {
  it('should call signOut with correct redirect', async () => {
    await logoutAction()
    expect(signOut).toHaveBeenCalledWith({ redirectTo: '/login' })
  })
})
