import ReportCluster from '../models/ReportCluster.js';

// @desc    Get pending hazard clusters for DMC Officers
// @route   GET /api/v1/reports/verification/clusters
// @access  Private (DMC_OFFICER, ADMIN)
export const getPendingClusters = async (req, res) => {
    try {
        const { district, hazardType } = req.query;
        const filter = { status: { $in: ['PENDING_VERIFICATION', 'IN_REVIEW'] } };

        if (district) filter.district = district;
        if (hazardType) filter.hazardType = hazardType;

        const clusters = await ReportCluster.find(filter)
            .populate({
                path: 'reports',
                populate: { path: 'reporter', select: 'fullName nic phoneNumber userType' },
            })
            .sort({ confidenceScore: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: clusters.length,
            data: clusters,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Acquire operational lock on a cluster (Concurrency Control)
// @route   POST /api/v1/reports/verification/clusters/:id/lock
// @access  Private (DMC_OFFICER, ADMIN)
export const lockCluster = async (req, res) => {
    try {
        const clusterId = req.params.id;
        const officerId = req.user.id;

        const cluster = await ReportCluster.findById(clusterId);
        if (!cluster) {
            return res.status(404).json({ success: false, message: 'Cluster not found' });
        }

        // Check if locked by another active officer session
        const now = new Date();
        if (
            cluster.lockedBy &&
            cluster.lockedBy.toString() !== officerId &&
            cluster.lockExpiresAt > now
        ) {
            return res.status(409).json({
                success: false,
                message: 'This cluster is currently being reviewed by another DMC Officer',
            });
        }

        // Set lock for 5 minutes
        cluster.lockedBy = officerId;
        cluster.lockExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        cluster.status = 'IN_REVIEW';
        await cluster.save();

        res.status(200).json({
            success: true,
            message: 'Operational lock acquired for 5 minutes',
            data: {
                clusterId: cluster._id,
                lockedBy: cluster.lockedBy,
                lockExpiresAt: cluster.lockExpiresAt,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify or Reject a hazard cluster (Handover Payload for UC-02)
// @route   POST /api/v1/reports/verification/clusters/:id/verify
// @access  Private (DMC_OFFICER, ADMIN)
export const verifyCluster = async (req, res) => {
    try {
        const clusterId = req.params.id;
        const { action, officerNotes } = req.body; // 'VERIFY' or 'REJECT'

        if (!['VERIFY', 'REJECT'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid action. Must be 'VERIFY' or 'REJECT'",
            });
        }

        const cluster = await ReportCluster.findById(clusterId).populate('reports');
        if (!cluster) {
            return res.status(404).json({ success: false, message: 'Cluster not found' });
        }

        const newStatus = action === 'VERIFY' ? 'VERIFIED' : 'REJECTED';
        cluster.status = newStatus;
        cluster.lockedBy = null;
        cluster.lockExpiresAt = null;
        await cluster.save();

        res.status(200).json({
            success: true,
            message: `Cluster successfully ${newStatus.toLowerCase()}ed`,
            handoverPayload: {
                clusterId: cluster._id,
                hazardType: cluster.hazardType,
                district: cluster.district,
                centroid: cluster.centroid,
                confidenceScore: cluster.confidenceScore,
                totalReportCount: cluster.reports.length,
                verifiedAt: new Date(),
                verifiedByOfficerId: req.user.id,
                officerNotes: officerNotes || '',
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};