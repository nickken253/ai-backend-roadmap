const mongoose = require('mongoose');

const promptLogSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    roadmap_id: { type: mongoose.Schema.Types.ObjectId },
    log_type: {
        type: String,
        required: true,
        enum: ['generate', 'review', 'suggest_skills']
    },
    prompt_sent: { type: String, required: true },
    raw_response: { type: String },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], required: true },
    error_message: { type: String },
    duration_ms: { type: Number }
}, { timestamps: true });

const PromptLog = mongoose.model('PromptLog', promptLogSchema);
module.exports = PromptLog;