const User = require('../models/userModel');
const PromptLog = require('../models/promptLogModel');

const getDashboardStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalUsersPromise = User.countDocuments();
    const newUsersTodayPromise = User.countDocuments({ created_at: { $gte: today } });
    
    const roadmapsTodayPromise = User.aggregate([
        { $unwind: '$roadmaps_history' },
        { $match: { 'roadmaps_history.created_at': { $gte: today } } },
        { $count: 'count' }
    ]);

    const failedApiCallsTodayPromise = PromptLog.countDocuments({
        status: 'FAILED',
        createdAt: { $gte: today }
    });

    const [usersCount, newUsersCount, roadmapsCount, failedCallsCount] = await Promise.all([
        totalUsersPromise,
        newUsersTodayPromise,
        roadmapsTodayPromise,
        failedApiCallsTodayPromise
    ]);

    return {
        total_users: usersCount,
        new_users_today: newUsersCount,
        roadmaps_generated_today: roadmapsCount.length > 0 ? roadmapsCount[0].count : 0,
        failed_api_calls_today: failedCallsCount
    };
};

const getPopularGoalsStats = () => {
    const limit = parseInt(process.env.STATS_LIMIT) || 10;
    return User.aggregate([
        { $unwind: '$roadmaps_history' },
        { $group: { _id: '$roadmaps_history.inputs.goal', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { _id: 0, goal: '$_id', count: 1 } }
    ]);
};

const getStudyTimeStats = async () => {
    const stats = await User.aggregate([
        { $unwind: '$roadmaps_history' },
        {
            $group: {
                _id: null,
                averageHours: { $avg: '$roadmaps_history.inputs.hours' },
                totalRoadmaps: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                averageHoursPerWeek: '$averageHours',
                totalRoadmapsGenerated: '$totalRoadmaps'
            }
        }
    ]);
    return stats[0] || { averageHoursPerWeek: 0, totalRoadmapsGenerated: 0 };
};

const getPopularSkillsStats = () => {
    const limit = parseInt(process.env.STATS_LIMIT) || 10;
    return User.aggregate([
        { $unwind: '$roadmaps_history' },
        { $unwind: '$roadmaps_history.inputs.skills' },
        { $group: { _id: '$roadmaps_history.inputs.skills.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { _id: 0, skill: '$_id', count: 1 } }
    ]);
};

module.exports = {
    getDashboardStats,
    getPopularGoalsStats,
    getStudyTimeStats,
    getPopularSkillsStats,
};