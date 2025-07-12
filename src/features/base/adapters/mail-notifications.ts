import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from './logger';

export class IMailNotifications {
  async sendEmail(
    email: string,
    title: string,
    message: string,
  ): Promise<void> {}
  async sendConfirmation(
    email: string,
    confirmationCode: string,
  ): Promise<void> {}
  async sendRecoveryCode(
    email: string,
    confirmationCode: string,
  ): Promise<void> {}
}

@Injectable()
export class MailNotifications implements IMailNotifications {
  constructor(
    private readonly logger: Logger,
    private readonly mailerService: MailerService,
  ) {
    this.logger.setContext('MailNotifications');
  }

  async sendConfirmation(
    email: string,
    confirmationCode: string,
  ): Promise<void> {
    await this.sendEmail(
      email,
      'Only test',
      `
      ${confirmationCode}
    `,
    );
  }

  async sendRecoveryCode(
    email: string,
    confirmationCode: string,
  ): Promise<void> {
    await this.sendEmail(
      email,
      'Only test',
      `
      ${confirmationCode}
    `,
    );
  }

  async sendEmail(
    email: string,
    title: string,
    message: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        html: message,
        subject: title,
      });
    } catch (error) {
      this.logger.warn(error);
    }
  }
}
