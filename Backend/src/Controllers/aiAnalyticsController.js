const Student = require("../Models/student");

const {
  getStudentRisk,
  getBulkRiskAnalysis,
  getCompleteAIAnalytics,
} = require("../Services/aiAnalyticsService");


const getStudentRiskPrediction = async (
  req,
  res
) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const prediction =
      await getStudentRisk(studentId);

    return res.status(200).json({
      success: true,
      prediction,
    });
  } catch (error) {
    console.error(
      "GET STUDENT RISK PREDICTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to generate student risk prediction",
    });
  }
};


const getAIOverview = async (
  req,
  res
) => {
  try {
    const analysis = await getBulkRiskAnalysis();

    return res.status(200).json({
      success: true,
      overview: {
        totalStudents: analysis.totalStudents,
        highRisk: analysis.highRisk,
        mediumRisk: analysis.mediumRisk,
        lowRisk: analysis.lowRisk,
      },
    });
  } catch (error) {
    console.error(
      "GET AI OVERVIEW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load AI overview",
    });
  }
};


const getRiskAnalysis = async (
  req,
  res
) => {
  try {
    const analysis =
      await getBulkRiskAnalysis();

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error(
      "GET RISK ANALYSIS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to generate AI risk analysis",
    });
  }
};


const getCompleteAnalytics = async (
  req,
  res
) => {
  try {
    const analytics =
      await getCompleteAIAnalytics();

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error(
      "GET COMPLETE AI ANALYTICS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to generate AI analytics",
    });
  }
};


module.exports = {
  getStudentRiskPrediction,
  getAIOverview,
  getRiskAnalysis,
  getCompleteAnalytics,
};