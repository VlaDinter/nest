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
      'Test 2',
      `
     <a href='https://some-front.com/confirm-registration?code=${confirmationCode}'>test</a>
    `,
    );
  }

  async sendRecoveryCode(
    email: string,
    confirmationCode: string,
  ): Promise<void> {
    await this.sendEmail(
      email,
      'Password recovery',
      `
      <h1>Password recovery</h1>
      <p>To finish password recovery please follow the link below:
        <a href='https://somesite.com/password-recovery?recoveryCode=${confirmationCode}'>recovery password</a>
      </p>
    `,
    );
  }

  async sendEmail(
    email: string,
    title: string,
    message: string,
  ): Promise<void> {
    // try {
    //   await this.mailerService.sendMail({
    //     to: email,
    //     html: message,
    //     subject: title,
    //   });
    // } catch (error) {
    //   this.logger.warn(error);
    // }

    await new Promise(async (resolve, reject) => {
      try {
        await this.mailerService['transporter'].verify();

        resolve('success');
      } catch (error) {
        this.logger.warn(error);
        reject(error);
      }
    });

    await new Promise(async (resolve, reject) => {
      try {
        await this.mailerService.sendMail({
          from: 'Dimych <dimychdeveloper@gmail.com>',
          to: email,
          subject: title,
          html: message,
        });

        resolve('success');
      } catch (error) {
        this.logger.warn(error);
        reject(error);
      }
    });
  }
}
