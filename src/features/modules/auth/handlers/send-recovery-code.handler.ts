import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@src/features/base/adapters/logger';
import { MailNotifications } from '@src/features/base/adapters/mail-notifications';
import { SendRecoveryCodeEvent } from '@modules/auth/handlers/events/send-recovery-code.event';

@EventsHandler(SendRecoveryCodeEvent)
export class SendRecoveryCodeHandler
  implements IEventHandler<SendRecoveryCodeEvent>
{
  constructor(
    private readonly logger: Logger,
    private readonly mailNotifications: MailNotifications,
  ) {
    this.logger.setContext('SendRecoveryCodeHandler');
  }

  async handle(event: SendRecoveryCodeEvent): Promise<void> {
    try {
      await this.mailNotifications.sendRecoveryCode(
        event.email,
        event.confirmationCode,
      );
    } catch (error) {
      this.logger.error(error);
    }
  }
}
