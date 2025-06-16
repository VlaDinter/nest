import { IMailNotifications } from '@src/features/base/adapters/mail-notifications';

export class MailNotificationsMock implements IMailNotifications {
  async sendConfirmation(
    email: string,
    confirmationCode: string,
  ): Promise<void> {
    await this.sendEmail(email, 'Email confirmation', confirmationCode);
  }

  async sendRecoveryCode(
    email: string,
    confirmationCode: string,
  ): Promise<void> {
    await this.sendEmail(email, 'Password recovery', confirmationCode);
  }

  async sendEmail(
    email: string,
    title: string,
    message: string,
  ): Promise<void> {
    console.log(
      `Email REALLY NOT not sent, to: ${email}, subject: ${title}, body: 
      ---------
      ${message}`,
    );
  }
}
