import { Request, Response } from "express";
import { Listing, User } from "../../../models/index.js";
import { BookingStatus } from "../../../models/BookingStatus.js";
import asyncHandler from "express-async-handler";

export const initBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const { listingId, tenantId, landlordId } = req.body;

  const status = new (BookingStatus as any)({
    bookingId,
    listingId,
    tenantId,
    landlordId,
    currentStatus: 'inquiry_sent',
    statusHistory: [{ status: 'inquiry_sent', timestamp: new Date() }]
  });
  await status.save();

  // Notify landlord via socket (assuming io is available globally or via req)
  req.app.get('io').to(landlordId).emit('statusUpdated', { bookingId, status: 'inquiry_sent' });

  res.status(201).json({ statusId: status._id, currentStatus: 'inquiry_sent' });
});

export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const { newStatus, reason, note } = req.body;
  const userId = req.user?.id;
  const role = (req.user as any)?.role; // Assuming role is in user object

  const status = await (BookingStatus as any).findOne({ bookingId });
  if (!status) {
    res.status(404).json({ error: "Booking status not found" });
    return;
  }

  // Add validation logic here...

  status.currentStatus = newStatus;
  status.statusHistory.push({
    status: newStatus,
    changedBy: userId,
    role,
    reason,
    note,
    timestamp: new Date()
  });
  await status.save();

  // Update listing lockStatus
  if (['booked'].includes(newStatus)) {
    await (Listing as any).findByIdAndUpdate(status.listingId, { lockStatus: 'booked' });
  } else if (['no_deal', 'not_interested', 'room_not_available'].includes(newStatus)) {
    await (Listing as any).findByIdAndUpdate(status.listingId, { lockStatus: 'available' });
  }

  res.json({ currentStatus: status.currentStatus, statusHistory: status.statusHistory });
});
