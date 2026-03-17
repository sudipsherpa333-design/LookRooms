import { Request, Response } from 'express';
import { Property, Listing, MaintenanceRequest } from '../../../models/index.js';

export const createProperty = async (req: any, res: Response) => {
  try {
    const property = new (Property as any)({
      ...req.body,
      ownerId: req.user.userId
    });
    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: "Failed to create property" });
  }
};

export const getMyProperties = async (req: any, res: Response) => {
  try {
    const properties = await (Property as any).find({ ownerId: req.user.userId }).populate('rooms');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch properties" });
  }
};

export const createMaintenanceRequest = async (req: any, res: Response) => {
  try {
    const { listingId } = req.body;
    const listing = await (Listing as any).findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const request = new (MaintenanceRequest as any)({
      ...req.body,
      tenantId: req.user.userId,
      homeownerId: listing.landlordId || listing.homeowner
    });
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to create maintenance request" });
  }
};

export const updateMaintenanceStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;
    
    const request = await (MaintenanceRequest as any).findByIdAndUpdate(id, {
      status,
      resolution,
      resolvedAt: status === 'resolved' ? new Date() : undefined
    }, { new: true });
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to update request" });
  }
};
