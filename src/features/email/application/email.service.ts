import nodemailer from 'nodemailer';

class EmailService {
  async sendEmail(email: string, title: string, message: string): Promise<void> {}
  async sendConfirmation(email: string, confirmationCode: string): Promise<void> {}
  async sendRecoveryCode(email: string, confirmationCode: string): Promise<void> {}
}

export class EmailServiceMock implements EmailService {
  async sendConfirmation(email: string, confirmationCode: string): Promise<void> {
    await this.sendEmail(email, 'Email confirmation', `
      <h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
          <a href='https://some-front.com/confirm-registration?code=${confirmationCode}'>complete registration</a>
        </p>
    `);
  }

  async sendRecoveryCode(email: string, confirmationCode: string): Promise<void> {
    await this.sendEmail(email, 'Password recovery', `
      <h1>Password recovery</h1>
      <p>To finish password recovery please follow the link below:
        <a href='https://somesite.com/password-recovery?recoveryCode=${confirmationCode}'>recovery password</a>
      </p>
    `);
  }

  async sendEmail(email: string, title: string, message: string): Promise<void> {
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
          console.log("Server is ready to take our messages");
          resolve(success);
        }
      });
    });

    // await transport.sendMail({
    //   from: 'Dimych <dimychdeveloper@gmail.com>',
    //   to: email,
    //   subject: title,
    //   html: message
    // }, (error) => {
    //   console.log(error);
    // });

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
    });
  }
}
