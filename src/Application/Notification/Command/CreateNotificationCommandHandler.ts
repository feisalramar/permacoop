import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import {
  Notification,
  NotificationType
} from 'src/Domain/Notification/Notification.entity';
import { CreateNotificationCommand } from './CreateNotificationCommand';
import { INotificationRepository } from 'src/Domain/Notification/Repository/INotificationRepository';
import { IMattermostNotifier } from 'src/Application/IMattermostNotifier';
import { ConfigService } from '@nestjs/config';

const { MATTERMOST_CHANNEL_LEAVES_ID } = process.env;

@CommandHandler(CreateNotificationCommand)
export class CreateNotificationCommandHandler {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
    @Inject('IMattermostNotifier')
    private readonly mattermostNotifier: IMattermostNotifier,
    private readonly configService: ConfigService
  ) {}

  public async execute(command: CreateNotificationCommand): Promise<string> {
    const { message, type, leaveReaquest } = command;

    if (type === NotificationType.POST) {
      const { id } = await this.mattermostNotifier.createPost(
        MATTERMOST_CHANNEL_LEAVES_ID,
        message
      );
      const notification = await this.notificationRepository.save(
        new Notification(type, message, id, leaveReaquest)
      );

      return notification.getId();
    }

    if (type === NotificationType.REACTION) {
      const post = await this.notificationRepository.findByLeaveRequestIdAndType(
        leaveReaquest.getId(),
        NotificationType.POST
      );

      const { id } = await this.mattermostNotifier.createReaction(
        post.getResourceId(),
        message
      );

      const notification = await this.notificationRepository.save(
        new Notification(type, message, post.getResourceId(), leaveReaquest)
      );

      return notification.getId();
    }

    if (type === NotificationType.COMMENT) {
      const post = await this.notificationRepository.findByLeaveRequestIdAndType(
        leaveReaquest.getId(),
        NotificationType.POST
      );

      const { id } = await this.mattermostNotifier.createComment(
        this.configService.get<string>('MATTERMOST_CHANNEL_LEAVES_ID'),
        message,
        post.getResourceId()
      );

      const notification = await this.notificationRepository.save(
        new Notification(type, message, id, leaveReaquest)
      );

      return notification.getId();
    }

    throw new Error('Type not managed');
  }
}
