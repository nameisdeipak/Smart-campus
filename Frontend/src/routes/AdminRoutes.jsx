import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayouts";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Students from "../pages/admin/Students";
import Faculty from "../pages/admin/Faculty";
import Parents from "../pages/admin/Parents";
import AcademicStructure from "../pages/admin/AcademicStructure";
import StudentSubjectEnrollment from "../pages/admin/StudentSubjectEnrollment";
import Fees from "../pages/admin/Fees";
import AIAnalytics from "../pages/admin/AIAnalytics";

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="academic-structure" element={<AcademicStructure />} />
        <Route path="faculty" element={<Faculty />} />
        <Route path="student-subject-enrollment" element={<StudentSubjectEnrollment />} />
        <Route path="parents" element={<Parents />} />
        <Route path="fees" element={<Fees />} />
        <Route path="ai-analytics" element={<AIAnalytics />} />
        <Route path="timetable" element={<div className="p-6">Timetable management is coming next.</div>} />
        <Route path="certificates" element={<div className="p-6">Certificate management is coming next.</div>} />
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
