import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  it('should be defined', () => {
    const authService = new AuthService();
    expect(new AuthGuard(authService)).toBeDefined();
  });
});
