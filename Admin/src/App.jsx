import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Login from "./pages/Login";

import AdminRoutes from "./routes/AdminRoutes";
import StudentRoutes from "./routes/StudentRoutes";

import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import StudentProtectedRoute from "./routes/StudentProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      <Routes>

        {/* Public Home */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* Common Login */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* Admin */}

        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute>
              <AdminRoutes />
            </AdminProtectedRoute>
          }
        />

        {/* Student */}

        <Route
          path="/student/*"
          element={
            <StudentProtectedRoute>
              <StudentRoutes />
            </StudentProtectedRoute>
          }
        />

        {/* Unknown Route */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;





// import {
//   BrowserRouter,
//   Navigate,
//   Route,
//   Routes,
// } from "react-router-dom";

// import { Toaster } from "react-hot-toast";

// import Login from "./pages/Login";
// import Home from "./pages/Home";
// import AdminRoutes from "./routes/AdminRoutes";
// import StudentRoutes from "./routes/StudentRoutes";
// import AdminProtectedRoute from "./routes/AdminProtectedRoute";

// function App() {
//   return (
//     <BrowserRouter>
//       <Toaster
//         position="top-right"
//         toastOptions={{
//           duration: 3000,
//         }}
//       />

//       <Routes>

//         <Route
//           path="/"
//           element={<Home />}
//         />
//         <Route
//           path="/login"
//           element={<Login />}
//         />

//         <Route
//           path="/admin/*"
//           element={
//             <AdminProtectedRoute>
//               <AdminRoutes />
//             </AdminProtectedRoute>
//           }
//         />

//         <Route
//           path="/student/*"
//           element={<StudentRoutes />}
//         />

//         <Route
//           path="*"
//           element={
//             <Navigate
//               to="/login"
//               replace
//             />
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App; 



