import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DeviceDto } from '../dto/device.dto';
import { DeviceViewModel } from '../models/output/device-view.model';

@Schema()
export class Device {
  @Prop({
    type: String,
    default(): Types.ObjectId {
      return new Types.ObjectId();
    },
  })
  deviceId: string;

  @Prop({
    type: String,
    required: true,
  })
  userId: string;

  @Prop({
    type: String,
    required: true,
  })
  ip: string;

  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
  })
  lastActiveDate: string;

  mapToViewModel(): DeviceViewModel {
    return {
      deviceId: this.deviceId,
      ip: this.ip,
      title: this.title,
      lastActiveDate: this.lastActiveDate,
    };
  }

  static setDevice(dto: DeviceDto, userId: string): DeviceDocument {
    const createdDevice = new this();

    createdDevice.userId = userId;
    createdDevice.ip = dto.ip;
    createdDevice.title = dto.title;
    createdDevice.lastActiveDate = dto.lastActiveDate;

    return createdDevice as DeviceDocument;
  }
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.loadClass(Device);

export type DeviceDocument = HydratedDocument<Device>;
export type DeviceModelType = Model<DeviceDocument> & typeof Device;
