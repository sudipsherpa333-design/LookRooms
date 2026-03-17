import { Request, Response } from 'express';
import { SystemSettings } from '../../../models/SystemSettings.js';
import { catchAsync } from '../../../utils/catchAsync.js';

export const getSystemSettings = catchAsync(async (req: Request, res: Response) => {
  let settings = await (SystemSettings as any).findOne();
  
  if (!settings) {
    // Create default settings if they don't exist
    settings = await (SystemSettings as any).create({
      defaultServiceFee: 5.0,
      maintenanceMode: false,
      notificationSettings: {
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
      }
    });
  }
  
  res.status(200).json({
    success: true,
    data: settings
  });
});

export const updateSystemSettings = catchAsync(async (req: Request, res: Response) => {
  const { defaultServiceFee, maintenanceMode, notificationSettings } = req.body;
  
  let settings = await (SystemSettings as any).findOne();
  
  if (!settings) {
    settings = new (SystemSettings as any)();
  }
  
  if (defaultServiceFee !== undefined) settings.defaultServiceFee = defaultServiceFee;
  if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
  if (notificationSettings !== undefined) settings.notificationSettings = notificationSettings;
  
  settings.updatedBy = req.user?.id as any;
  
  await settings.save();
  
  res.status(200).json({
    success: true,
    data: settings
  });
});

