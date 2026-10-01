import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Dashboard from "../pages/student/Dashboard";
import Attendance from "../pages/student/Attendance";
import Performance from "../pages/student/Performance";
import Fees from "../pages/student/Fees";
import Timetable from "../pages/student/Timetable";
import Certificates from "../pages/student/Certificates";
import Helpdesk from "../pages/student/Helpdesk";
import AIAssistantPage from "../pages/student/AIAssistantPage";

function StudentRoutes() {
  return (
    <Routes>

      <Route
        path="dashboard"
        element={<Dashboard />}
      />

      <Route
        path="attendance"
        element={<Attendance />}
      />

      <Route
        path="performance"
        element={<Performance />}
      />

      <Route
        path="fees"
        element={<Fees />}
      />

      <Route
        path="timetable"
        element={<Timetable />}
      />

      <Route
        path="certificates"
        element={<Certificates />}
      />

      <Route
        path="helpdesk"
        element={<Helpdesk />}
      />

      <Route
        path="ai-assistant"
        element={<AIAssistantPage />}
      />

      <Route
        index
        element={
          <Navigate
            to="dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}

export default StudentRoutes;





