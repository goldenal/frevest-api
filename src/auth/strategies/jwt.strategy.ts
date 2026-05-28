import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InMemoryStore } from '../../store/in-memory.store';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private store: InMemoryStore) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'frevest-secret-key',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = this.store.findUserById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, name: user.name };
  }
}
