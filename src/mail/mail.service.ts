import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(private readonly mailerService: MailerService) { }

    async sendWelcomeEmail(to: string) {
        try {
            await this.mailerService.sendMail({
                to,
                subject: 'Hoşgeldiniz EventNest ailesine!',
                html: `
          <h1>Hoşgeldiniz EventNest ailesine!</h1>
          <p>Etkinliklere katılmak için platformumuza kayıt oldunuz.</p>
        `,
            });
            this.logger.log(`Welcome email successfully sent to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send welcome email to ${to}`, error.stack);
        }
    }
}
