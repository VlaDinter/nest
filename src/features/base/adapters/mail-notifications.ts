import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from './logger';
import nodemailer from 'nodemailer';

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
      'Check 1',
      `
      <h1>Thank for your registration</h1>
      <p>To finish registration please follow the link below:
        <a href='https://some-front.com/confirm-registration?code=${confirmationCode}'>complete registration</a>
      </p>
    `,
    );
  }

  async sendRecoveryCode(
    email: string,
    confirmationCode: string,
  ): Promise<void> {
    await this.sendEmail(
      email,
      'Check 2',
      `
      <h1>Password recovery</h1>
      <p>To finish password recovery please follow the link below:
        <a href='https://somesite.com/password-recovery?recoveryCode=${confirmationCode}'>recovery password</a>
      </p>
    `,
    );
  }

  async sendEmail(email: string, title: string, message: string) {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_FROM_PASSWORD
      }
    });

    await new Promise((resolve, reject) => {
      // verify connection configuration
      transport.verify(function (error, success) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log('Server is ready to take our messages');
          resolve(success);
        }
      });
    });

    await new Promise((resolve, reject) => {
      // send mail
      transport.sendMail({
        from: 'Dimych <dimychdeveloper@gmail.com>',
        to: email,
        subject: title,
        html: message
      }, (err, info) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(info);
          resolve(info);
        }
      });

    // const transporter = nodemailer.createTransport({
    //   port: 465,
    //   host: 'smtp.gmail.com',
    //   auth: {
    //     user: process.env.EMAIL_FROM_USER,
    //     pass: process.env.EMAIL_FROM_PASSWORD,
    //   },
    //   secure: true,
    // });
    //
    // await new Promise((resolve, reject) => {
    //   transporter.verify(function (error, success) {
    //     if (error) {
    //       console.log(error);
    //       reject(error);
    //     } else {
    //       console.log('Server is ready to take our messages');
    //       resolve(success);
    //     }
    //   });
    // });
    //
    // const mailData = {
    //   from: {
    //     name: 'Dimych',
    //     address: '<dimychdeveloper@gmail.com>',
    //   },
    //   to: email,
    //   subject: title,
    //   html: message,
    // };
    //
    // await new Promise((resolve, reject) => {
    //   transporter.sendMail(mailData, (err, info) => {
    //     if (err) {
    //       console.error(err);
    //       reject(err);
    //     } else {
    //       console.log(info);
    //       resolve(info);
    //     }
    //   });
    // });

    // const transport = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: process.env.EMAIL_FROM_USER,
    //     pass: process.env.EMAIL_FROM_PASSWORD,
    //   },
    // });
    //
    // await transport.sendMail(
    //   {
    //     from: 'Dimych <dimychdeveloper@gmail.com>',
    //     to: email,
    //     subject: title,
    //     html: message,
    //   },
    //   (error) => {
    //     console.log(error);
    //   },
    // );
  }

  // async sendEmail(
  //   email: string,
  //   title: string,
  //   message: string,
  // ): Promise<void> {
  //   try {
  //     await this.mailerService.sendMail({
  //       to: email,
  //       html: message,
  //       subject: title,
  //     });
  //   } catch (error) {
  //     this.logger.warn(error);
  //   }
  // }
}
