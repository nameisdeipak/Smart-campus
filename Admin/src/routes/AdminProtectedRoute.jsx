import ProtectedRoute from "./ProtectedRoute";

function AdminProtectedRoute({
  children,
}) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {children}
    </ProtectedRoute>
  );
}

export default AdminProtectedRoute;