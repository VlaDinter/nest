import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '../../../base/adapters/logger';
import { SendRecoveryCodeEvent } from './events/send-recovery-code.event';
import { MailNotifications } from '../../../base/adapters/mail-notifications';

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
