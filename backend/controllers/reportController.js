import mongoose from 'mongoose';
import HazardReport from '../models/HazardReport.js';
import { processReportClustering } from '../services/clusteringService.js';

// @desc    Submit a ground hazard report (Citizen or Guest)
// @route   POST /api/v1/reports/submit
// @access  Public / Protected
export const submitReport = async (req, res) => {
    try {
        console.log('Incoming Report Submission Body:', req.body);

        // Support direct body, nested { report: { ... } }, or response format { data: { report: { ... } } }
        const payload = req.body?.data?.report || req.body?.report || req.body?.data || req.body || {};

        const hazardType = payload.hazardType;
        const description = payload.description;
        const district = payload.district || req.body?.district || 'Colombo';
        const isGuestReport = payload.isGuestReport ?? req.body?.isGuestReport;

        let rawLat = payload.latitude ?? payload.lat ?? req.body?.latitude ?? req.body?.lat;
        let rawLon = payload.longitude ?? payload.lon ?? payload.lng ?? req.body?.longitude ?? req.body?.lon ?? req.body?.lng;

        // Check if coordinates were passed inside "location" or "coordinates"
        let coords = payload.coordinates ?? req.body?.coordinates;

        const locSource = payload.location ?? req.body?.location;
        if (!coords && locSource) {
            let loc = locSource;
            if (typeof loc === 'string') {
                try {
                    loc = JSON.parse(loc);
                } catch (e) {}
            }
            coords = loc?.coordinates;
        }

        // Handle multipart form-data bracket notation: location[coordinates][0], etc.
        if (!coords && (req.body?.['location[coordinates][0]'] !== undefined || req.body?.['coordinates[0]'] !== undefined)) {
            const c0 = req.body['location[coordinates][0]'] ?? req.body['coordinates[0]'];
            const c1 = req.body['location[coordinates][1]'] ?? req.body['coordinates[1]'];
            coords = [c0, c1];
        }

        // If coordinates is a string (e.g. "[79.9830, 6.9319]"), parse it
        if (typeof coords === 'string') {
            try {
                coords = JSON.parse(coords);
            } catch (e) {
                coords = coords.replace(/[\[\]]/g, '').split(',').map((c) => parseFloat(c.trim()));
            }
        }

        if (Array.isArray(coords) && coords.length >= 2) {
            // GeoJSON coordinates format is [longitude, latitude]
            if (rawLon === undefined) rawLon = coords[0];
            if (rawLat === undefined) rawLat = coords[1];
        }

        // Check if coordinates exist and are not empty
        if (rawLat === undefined || rawLon === undefined || rawLat === '' || rawLon === '') {
            return res.status(400).json({
                success: false,
                message: 'GPS coordinates (latitude and longitude) are required. Provide latitude & longitude, or location: { coordinates: [longitude, latitude] }',
            });
        }

        const lat = parseFloat(rawLat);
        const lon = parseFloat(rawLon);

        if (isNaN(lat) || isNaN(lon)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid latitude or longitude values',
            });
        }

        // Extract Cloudinary secure URLs or fallback to photoUrls in request body
        let photoUrls = req.files ? req.files.map((file) => file.path) : [];
        if (photoUrls.length === 0) {
            const bodyPhotos = payload.photoUrls ?? req.body?.photoUrls;
            if (bodyPhotos) {
                photoUrls = Array.isArray(bodyPhotos) ? bodyPhotos : [bodyPhotos];
            }
        }

        // Determine user identity
        const isGuest = isGuestReport === 'true' || isGuestReport === true || (!req.user && !payload.reporter);
        let reporterId = null;
        if (!isGuest) {
            if (req.user?.id) {
                reporterId = req.user.id;
            } else if (payload.reporter && mongoose.Types.ObjectId.isValid(payload.reporter)) {
                reporterId = payload.reporter;
            }
        }

        // Create report
        const report = await HazardReport.create({
            reporter: reporterId,
            isGuestReport: isGuest,
            hazardType,
            description,
            district,
            location: {
                type: 'Point',
                coordinates: [lon, lat], // Longitude first in GeoJSON
            },
            photoUrls,
        });

        const cluster = await processReportClustering(report);

        res.status(201).json({
            success: true,
            message: 'Ground report submitted and clustered successfully',
            data: {
                report,
                clusterId: cluster._id,
                currentConfidenceScore: cluster.confidenceScore,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};