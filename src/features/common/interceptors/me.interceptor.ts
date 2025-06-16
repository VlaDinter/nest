import { map, Observable } from 'rxjs';
import { CallHandler, Injectable, NestInterceptor } from '@nestjs/common';
import { MeViewModel } from '@modules/users/models/output/me-view.model';
import { UserViewModel } from '@modules/users/models/output/user-view.model';

@Injectable()
export class MeInterceptor implements NestInterceptor {
  intercept(_, next: CallHandler): Observable<MeViewModel | null> {
    return next.handle().pipe(
      map((data: UserViewModel | null): MeViewModel | null => {
        if (!data) {
          return null;
        }

        return {
          userId: data.id,
          email: data.email,
          login: data.login,
        };
      }),
    );
  }
}
