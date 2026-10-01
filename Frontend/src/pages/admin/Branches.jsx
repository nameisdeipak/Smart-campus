import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  GitBranch,
  GraduationCap,
  UserRound,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Users,
//   BlendIcon
} from "lucide-react";

import toast from "react-hot-toast";
import axiosClient from "../../services/axiosClient";

const initialForm = {
  courseId: "",
  branchCode: "",
  branchName: "",
  description: "",
  hod: "",
  isActive: true,
};

function Branches() {
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);

  const [loading, setLoading] = useState(true);
  const [supportDataLoading, setSupportDataLoading] =
    useState(true);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("");

  const [modal, setModal] = useState(null);
  const [selectedBranch, setSelectedBranch] =
    useState(null);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchBranches = async () => {
    try {
      setLoading(true);

      const response = await axiosClient.get(
        "/admin/branches/getAllBranches"
      );

      setBranches(response.data.branches || []);
    } catch (error) {
      console.error(
        "FETCH BRANCHES ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load branches"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      setSupportDataLoading(true);

      const [
        coursesResponse,
        facultyResponse,
      ] = await Promise.all([
        axiosClient.get(
          "/admin/courses/getAllCourses"
        ),
        axiosClient.get(
          "/admin/faculty/getAllFaculty"
        ),
      ]);

      setCourses(
        coursesResponse.data.courses || []
      );

      setFaculty(
        facultyResponse.data.faculty || []
      );
    } catch (error) {
      console.error(
        "FETCH BRANCH SUPPORT DATA ERROR:",
        error
      );

      toast.error(
        "Failed to load course or faculty data"
      );
    } finally {
      setSupportDataLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchSupportData();
  }, []);

  const filteredBranches = useMemo(() => {
    const value = search.trim().toLowerCase();

    return branches.filter((branch) => {
      const course = branch.courseId || {};
      const hod = branch.hod || {};

      const matchesSearch =
        !value ||
        branch.branchCode
          ?.toLowerCase()
          .includes(value) ||
        branch.branchName
          ?.toLowerCase()
          .includes(value) ||
        course.courseName
          ?.toLowerCase()
          .includes(value) ||
        course.courseCode
          ?.toLowerCase()
          .includes(value) ||
        hod.facultyId
          ?.toLowerCase()
          .includes(value);

      const matchesCourse =
        !courseFilter ||
        course._id === courseFilter;

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active"
          ? branch.isActive
          : !branch.isActive);

      return (
        matchesSearch &&
        matchesCourse &&
        matchesStatus
      );
    });
  }, [
    branches,
    search,
    courseFilter,
    statusFilter,
  ]);

  const openAddModal = () => {
    setForm(initialForm);
    setSelectedBranch(null);
    setModal("add");
  };

  const openEditModal = (branch) => {
    setSelectedBranch(branch);

    setForm({
      courseId: branch.courseId?._id || "",
      branchCode: branch.branchCode || "",
      branchName: branch.branchName || "",
      description: branch.description || "",
      hod: branch.hod?._id || "",
      isActive: branch.isActive !== false,
    });

    setModal("edit");
  };

  const openViewModal = (branch) => {
    setSelectedBranch(branch);
    setModal("view");
  };

  const openDeleteModal = (branch) => {
    setSelectedBranch(branch);
    setModal("delete");
  };

  const closeModal = () => {
    if (saving) return;

    setModal(null);
    setSelectedBranch(null);
    setForm(initialForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateBranch = async (event) => {
    event.preventDefault();

    if (
      !form.courseId ||
      !form.branchCode ||
      !form.branchName
    ) {
      toast.error(
        "Please fill all required fields"
      );
      return;
    }

    try {
      setSaving(true);

      const response = await axiosClient.post(
        "/admin/branches/createBranch",
        {
          courseId: form.courseId,
          branchCode: form.branchCode,
          branchName: form.branchName,
          description: form.description,
          hod: form.hod || null,
        }
      );

      toast.success(
        response.data.message ||
          "Branch created successfully"
      );

      closeModal();
      await fetchBranches();
    } catch (error) {
      console.error(
        "CREATE BRANCH ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create branch"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBranch = async (event) => {
    event.preventDefault();

    if (!selectedBranch?._id) return;

    try {
      setSaving(true);

      const response = await axiosClient.put(
        `/admin/branches/updateBranch/${selectedBranch._id}`,
        {
          courseId: form.courseId,
          branchCode: form.branchCode,
          branchName: form.branchName,
          description: form.description,
          hod: form.hod || null,
          isActive: form.isActive,
        }
      );

      toast.success(
        response.data.message ||
          "Branch updated successfully"
      );

      closeModal();
      await fetchBranches();
    } catch (error) {
      console.error(
        "UPDATE BRANCH ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update branch"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBranch = async () => {
    if (!selectedBranch?._id) return;

    try {
      setSaving(true);

      const response = await axiosClient.delete(
        `/admin/branches/deleteBranch/${selectedBranch._id}`
      );

      toast.success(
        response.data.message ||
          "Branch deleted successfully"
      );

      closeModal();
      await fetchBranches();
    } catch (error) {
      console.error(
        "DELETE BRANCH ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete branch"
      );
    } finally {
      setSaving(false);
    }
  };

  const activeBranches = branches.filter(
    (branch) => branch.isActive
  ).length;

  const inactiveBranches = branches.filter(
    (branch) => !branch.isActive
  ).length;

  const coursesWithBranches = new Set(
    branches.map(
      (branch) => branch.courseId?._id
    )
  ).size;

  return (
    <div className="min-h-full bg-slate-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <section className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Unified Campus
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Branches
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage course branches, branch heads and
                academic branch structure.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              disabled={
                supportDataLoading ||
                courses.length === 0
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Plus size={18} />
              Add Branch
            </button>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Branches"
            value={branches.length}
            icon={GitBranch}
          />

          <SummaryCard
            title="Active Branches"
            value={activeBranches}
            icon={CheckCircle2}
          />

          <SummaryCard
            title="Inactive Branches"
            value={inactiveBranches}
            icon={XCircle}
          />

          <SummaryCard
            title="Courses Covered"
            value={coursesWithBranches}
            icon={GraduationCap}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Branch List
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredBranches.length} branch
                  {filteredBranches.length !== 1
                    ? "es"
                    : ""}{" "}
                  found
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex">
                <div className="relative sm:col-span-2 xl:w-80">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search branches..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <SelectField
                  value={courseFilter}
                  onChange={(event) =>
                    setCourseFilter(
                      event.target.value
                    )
                  }
                  options={courses.map((course) => ({
                    label: `${course.courseCode} - ${course.courseName}`,
                    value: course._id,
                  }))}
                  placeholder="All Courses"
                />

                <SelectField
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                  options={[
                    {
                      label: "Active",
                      value: "active",
                    },
                    {
                      label: "Inactive",
                      value: "inactive",
                    },
                  ]}
                  placeholder="All Status"
                />
              </div>
            </div>
          </div>

          <BranchTable
            branches={filteredBranches}
            loading={loading}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        </section>
      </div>

      {modal === "add" && (
        <BranchFormModal
          title="Add Branch"
          description="Create a branch under an existing course."
          form={form}
          courses={courses}
          faculty={faculty}
          saving={saving}
          isEdit={false}
          onChange={handleChange}
          onSubmit={handleCreateBranch}
          onClose={closeModal}
        />
      )}

      {modal === "edit" && (
        <BranchFormModal
          title="Edit Branch"
          description="Update branch information and configuration."
          form={form}
          courses={courses}
          faculty={faculty}
          saving={saving}
          isEdit
          onChange={handleChange}
          onSubmit={handleUpdateBranch}
          onClose={closeModal}
        />
      )}

      {modal === "view" && selectedBranch && (
        <BranchViewModal
          branch={selectedBranch}
          onClose={closeModal}
          onEdit={() => {
            closeModal();

            setTimeout(() => {
              openEditModal(selectedBranch);
            }, 0);
          }}
        />
      )}

      {modal === "delete" && selectedBranch && (
        <DeleteModal
          branch={selectedBranch}
          saving={saving}
          onClose={closeModal}
          onConfirm={handleDeleteBranch}
        />
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function BranchTable({
  branches,
  loading,
  onView,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2
            size={20}
            className="animate-spin"
          />
          Loading branches...
        </div>
      </div>
    );
  }

  if (!branches.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <GitBranch size={25} />
        </div>

        <h3 className="mt-4 font-semibold text-slate-900">
          No branches found
        </h3>

        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Branch
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Code
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Course
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                HOD
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {branches.map((branch) => (
              <tr
                key={branch._id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <GitBranch size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {branch.branchName}
                      </p>

                      <p className="max-w-60 truncate text-xs text-slate-500">
                        {branch.description ||
                          "No description"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {branch.branchCode}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium text-slate-700">
                    {branch.courseId?.courseName ||
                      "-"}
                  </p>

                  <p className="text-xs text-slate-400">
                    {branch.courseId?.courseCode ||
                      "-"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  {branch.hod ? (
                    <>
                      <p className="font-medium text-slate-700">
                        {branch.hod.facultyId ||
                          branch.hod.employeeId ||
                          "Assigned"}
                      </p>

                      <p className="text-xs text-slate-400">
                        {branch.hod.designation ||
                          "Faculty"}
                      </p>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400">
                      Not assigned
                    </span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge
                    active={branch.isActive}
                  />
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <ActionButton
                      icon={Eye}
                      label="View branch"
                      onClick={() =>
                        onView(branch)
                      }
                    />

                    <ActionButton
                      icon={Pencil}
                      label="Edit branch"
                      onClick={() =>
                        onEdit(branch)
                      }
                    />

                    <ActionButton
                      icon={Trash2}
                      label="Delete branch"
                      danger
                      onClick={() =>
                        onDelete(branch)
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {branches.map((branch) => (
          <div
            key={branch._id}
            className="p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <GitBranch size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {branch.branchName}
                  </h3>

                  <StatusBadge
                    active={branch.isActive}
                  />
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {branch.branchCode} •{" "}
                  {branch.courseId?.courseCode ||
                    "-"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <MobileInfo
                label="Course"
                value={
                  branch.courseId?.courseName ||
                  "-"
                }
              />

              <MobileInfo
                label="HOD"
                value={
                  branch.hod?.facultyId ||
                  "Not assigned"
                }
              />
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {branch.description ||
                "No description available."}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => onView(branch)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700"
              >
                <Eye size={16} />
                View
              </button>

              <button
                type="button"
                onClick={() => onEdit(branch)}
                className="flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2.5 text-slate-700"
              >
                <Pencil size={16} />
              </button>

              <button
                type="button"
                onClick={() => onDelete(branch)}
                className="flex items-center justify-center rounded-lg border border-red-100 px-3 py-2.5 text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function BranchFormModal({
  title,
  description,
  form,
  courses,
  faculty,
  saving,
  isEdit,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <Modal onClose={onClose}>
      <div className="flex max-h-[92vh] flex-col">
        <ModalHeader
          title={title}
          description={description}
          onClose={onClose}
        />

        <form
          onSubmit={onSubmit}
          className="overflow-y-auto p-4 sm:p-6"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SelectInput
              label="Course"
              name="courseId"
              value={form.courseId}
              onChange={onChange}
              options={courses.map((course) => ({
                label: `${course.courseCode} - ${course.courseName}`,
                value: course._id,
              }))}
              required
            />

            <InputField
              label="Branch Code"
              name="branchCode"
              value={form.branchCode}
              onChange={onChange}
              placeholder="Example: IT"
              required
            />

            <InputField
              label="Branch Name"
              name="branchName"
              value={form.branchName}
              onChange={onChange}
              placeholder="Example: Information Technology"
              required
            />

            <SelectInput
              label="Head of Department"
              name="hod"
              value={form.hod}
              onChange={onChange}
              options={faculty
                .filter(
                  (member) =>
                    member.userId?.isActive !==
                    false
                )
                .map((member) => ({
                  label:
                    member.userId?.name ||
                    member.facultyId ||
                    member.employeeId ||
                    "Faculty",
                  value: member._id,
                }))}
            />

            <div className="sm:col-span-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </span>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows={4}
                  placeholder="Describe this branch..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400"
                />
              </label>
            </div>

            {isEdit && (
              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={(event) =>
                      onChange({
                        target: {
                          name: "isActive",
                          value:
                            event.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Active Branch
                    </p>

                    <p className="text-xs text-slate-500">
                      Inactive branches should not be
                      used for new academic assignments.
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {isEdit
                ? "Save Changes"
                : "Create Branch"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function BranchViewModal({
  branch,
  onClose,
  onEdit,
}) {
  return (
    <Modal onClose={onClose}>
      <div className="max-h-[92vh] overflow-y-auto">
        <ModalHeader
          title="Branch Details"
          description="Academic branch information."
          onClose={onClose}
        />

        <div className="p-4 sm:p-6">
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <GitBranch size={25} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    {branch.branchName}
                  </h3>

                  <StatusBadge
                    active={branch.isActive}
                  />
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {branch.branchCode} •{" "}
                  {branch.courseId?.courseName ||
                    "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Pencil size={16} />
                Edit
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard
              icon={GitBranch}
              label="Branch Code"
              value={branch.branchCode}
            />

            <InfoCard
              icon={GraduationCap}
              label="Course"
              value={
                branch.courseId?.courseName
              }
            />

            <InfoCard
              icon={FileText}
              label="Course Code"
              value={
                branch.courseId?.courseCode
              }
            />

            <InfoCard
              icon={UserRound}
              label="Head of Department"
              value={
                branch.hod?.facultyId ||
                branch.hod?.employeeId ||
                "Not assigned"
              }
            />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <FileText
                size={19}
                className="mt-0.5 shrink-0 text-slate-500"
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {branch.description ||
                    "No branch description available."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StructureCard
              title="Semesters"
              value="0"
              description="Configure next"
              icon={GraduationCap}
            />

            <StructureCard
              title="Subjects"
              value="0"
              description="Configure next"
              icon={BookIcon}
            />

            <StructureCard
              title="Students"
              value="0"
              description="Will be connected"
              icon={Users}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function DeleteModal({
  branch,
  saving,
  onClose,
  onConfirm,
}) {
  return (
    <Modal onClose={onClose}>
      <div className="p-5 sm:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <AlertTriangle size={23} />
        </div>

        <h3 className="mt-4 text-xl font-bold text-slate-900">
          Delete Branch
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">
            {branch.branchName}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {saving && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            Delete Branch
          </button>
        </div>
      </div>
    </Modal>
  );
}

function StructureCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon size={18} />
        </div>

        <span className="text-xl font-bold text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-3 font-semibold text-slate-800">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <Icon
          size={18}
          className="mt-0.5 shrink-0 text-slate-500"
        />

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-medium text-slate-800">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

function MobileInfo({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ActionButton({
  icon: Icon,
  label,
  danger,
  onClick,
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
        danger
          ? "text-red-500 hover:bg-red-50 hover:text-red-600"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      <Icon size={17} />
    </button>
  );
}

function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm text-slate-800 outline-none focus:border-slate-400"
        >
          <option value="">
            Select {label}
          </option>

          {options.map((option) => (
            <option
              key={option.value || option}
              value={option.value || option}
            >
              {option.label || option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={17}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </label>
  );
}

function SelectField({
  value,
  onChange,
  options,
  placeholder,
}) {
  return (
    <div className="relative min-w-44">
      <select
        value={value}
        onChange={onChange}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option
            key={option.value || option}
            value={option.value || option}
          >
            {option.label || option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400"
      />
    </label>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({
  title,
  description,
  onClose,
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4 sm:p-6">
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <X size={19} />
      </button>
    </div>
  );
}

function BookIcon({ size = 18 }) {
  return <GraduationCap size={size} />;
}

export default Branches;