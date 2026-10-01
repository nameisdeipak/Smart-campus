const mongoose = require("mongoose");

const timeTableSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    section: { type: String, required: true, trim: true, uppercase: true },
    academicYear: { type: String, required: true, trim: true },
    day: { type: String, required: true, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, default: "" },
    dayOrder: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "timetables" }
);

timeTableSchema.index({ section: 1, academicYear: 1, day: 1, startTime: 1 });

module.exports = mongoose.models.TimeTable || mongoose.model("TimeTable", timeTableSchema);
