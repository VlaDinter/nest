import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '../../../base/adapters/logger';
import { SendConfirmationEvent } from './events/send-confirmation.event';
import { MailNotifications } from '../../../base/adapters/mail-notifications';

@EventsHandler(SendConfirmationEvent)
export class SendConfirmationHandler
  implements IEventHandler<SendConfirmationEvent>
{
  constructor(
    private readonly logger: Logger,
    private readonly mailNotifications: MailNotifications,
  ) {
    this.logger.setContext('SendConfirmationHandler');
  }

  async handle(event: SendConfirmationEvent): Promise<void> {
    try {
      await this.mailNotifications.sendConfirmation(
        event.email,
        event.confirmationCode,
      );
    } catch (error) {
      this.logger.error(error);
    }
  }
}
