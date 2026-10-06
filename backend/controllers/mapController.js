import ReportCluster from '../models/ReportCluster.js';

/**
 * @desc    Get all active VERIFIED hazard clusters formatted as GeoJSON
 * @route   GET /api/v1/reports/active-hazards
 * @access  Public
 */
export const getActiveHazards = async (req, res) => {
    try {
        const activeClusters = await ReportCluster.find({ status: 'VERIFIED' })
            .select('hazardType district centroid confidenceScore iotVerified matchedSensors reports updatedAt')
            .lean();

        const features = activeClusters.map((cluster) => ({
            type: 'Feature',
            geometry: cluster.centroid, // { type: 'Point', coordinates: [lng, lat] }
            properties: {
                clusterId: cluster._id,
                hazardType: cluster.hazardType,
                district: cluster.district,
                confidenceScore: cluster.confidenceScore,
                iotVerified: cluster.iotVerified,
                reportCount: cluster.reports ? cluster.reports.length : 0,
                matchedSensors: cluster.matchedSensors,
                updatedAt: cluster.updatedAt,
            },
        }));

        return res.status(200).json({
            type: 'FeatureCollection',
            features,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to fetch active hazards: ${error.message}`,
        });
    }
};

/**
 * @desc    Get verified hazards within a specific radius of a user's GPS coordinates
 * @route   GET /api/v1/reports/nearby?lat=6.9319&lng=79.9830&radius=5000
 * @access  Public
 */
export const getNearbyHazards = async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both lat and lng query parameters.',
            });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const maxDistanceMeters = radius ? parseInt(radius, 10) : 5000; // Default 5km radius

        const nearbyClusters = await ReportCluster.find({
            status: 'VERIFIED',
            centroid: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [longitude, latitude], }, $maxDistance: maxDistanceMeters,
                },
            },
        }).lean();

        const features = nearbyClusters.map((cluster) => ({
            type: 'Feature',
            geometry: cluster.centroid,
            properties: {
                clusterId: cluster._id,
                hazardType: cluster.hazardType,
                district: cluster.district,
                confidenceScore: cluster.confidenceScore,
                iotVerified: cluster.iotVerified,
                reportCount: cluster.reports ? cluster.reports.length : 0,
                updatedAt: cluster.updatedAt,
            },
        }));

        return res.status(200).json({
            type: 'FeatureCollection',
            features,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Nearby hazard lookup failed: ${error.message}`,
        });
    }
};