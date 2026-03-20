import { Request, Response } from 'express';
import { Application } from '../models/Application';
import { Listing } from '../models/Listing';
import asyncHandler from 'express-async-handler';

export const createApplication = asyncHandler(async (req: any, res: Response) => {
  const listing = await Listing.findById(req.body.listing);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  const newApplication = await Application.create({
    tenant: req.user.id,
    listing: req.body.listing,
    landlord: listing.owner,
    message: req.body.message,
    moveInDate: req.body.moveInDate
  });

  // Increment application count on listing
  listing.applicationCount += 1;
  await listing.save();

  res.status(201).json({
    status: 'success',
    data: {
      application: newApplication
    }
  });
});

export const getMyApplications = asyncHandler(async (req: any, res: Response) => {
  const applications = await Application.find({ tenant: req.user.id })
    .populate('listing', 'title price location images')
    .populate('landlord', 'name avatar phone');

  res.status(200).json({
    status: 'success',
    results: applications.length,
    data: {
      applications
    }
  });
});

export const getLandlordApplications = asyncHandler(async (req: any, res: Response) => {
  const applications = await Application.find({ landlord: req.user.id })
    .populate('listing', 'title price location')
    .populate('tenant', 'name avatar phone trustScore verificationLevel');

  res.status(200).json({
    status: 'success',
    results: applications.length,
    data: {
      applications
    }
  });
});

export const updateApplicationStatus = asyncHandler(async (req: any, res: Response) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (application.landlord.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not authorized to update this application status');
  }

  application.status = req.body.status;
  await application.save();

  res.status(200).json({
    status: 'success',
    data: {
      application
    }
  });
});
