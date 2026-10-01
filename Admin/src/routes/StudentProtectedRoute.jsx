import ProtectedRoute from "./ProtectedRoute";

function StudentProtectedRoute({
  children,
}) {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      {children}
    </ProtectedRoute>
  );
}

export default StudentProtectedRoute;