import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@src/features/base/adapters/logger';
import { MailNotifications } from '@src/features/base/adapters/mail-notifications';
import { SendConfirmationEvent } from '@modules/auth/handlers/events/send-confirmation.event';

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
