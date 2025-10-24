import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MetaPage } from '../domain/pagination';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((value) => {
        const meta = value?.meta as MetaPage;
        return {
          data: meta ? value.data : value,
          ...(meta && { meta }),
        };
      }),
    );
  }
}
