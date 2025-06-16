import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class Logger extends ConsoleLogger {
  port(port: string): void {
    this.log(`Application is running on: ${port}`);
  }
}
