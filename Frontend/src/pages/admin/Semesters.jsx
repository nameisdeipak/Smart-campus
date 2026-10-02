import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  GraduationCap,
  BookOpen,
  GitBranch,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
} from "lucide-react";

import toast from "react-hot-toast";
import axiosClient from "../../services/axiosClient";

const initialForm = {
  courseId: "",
  branchId: "",
  semesterNumber: "",
  semesterName: "",
  isActive: true,
};

function Semesters() {
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [supportLoading, setSupportLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedSemester, setSelectedSemester] =
    useState(null);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchSemesters = async () => {
    try {
      setLoading(true);

      const response = await axiosClient.get(
        "/admin/semesters/getAllSemesters"
      );

      setSemesters(response.data.semesters || []);
    } catch (error) {
      console.error("FETCH SEMESTERS ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load semesters"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      setSupportLoading(true);

      const [
        coursesResponse,
        branchesResponse,
      ] = await Promise.all([
        axiosClient.get(
          "/admin/courses/getAllCourses"
        ),
        axiosClient.get(
          "/admin/branches/getAllBranches"
        ),
      ]);

      setCourses(
        coursesResponse.data.courses || []
      );

      setBranches(
        branchesResponse.data.branches || []
      );
    } catch (error) {
      console.error(
        "FETCH SEMESTER SUPPORT DATA ERROR:",
        error
      );

      toast.error(
        "Failed to load course or branch data"
      );
    } finally {
      setSupportLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
    fetchSupportData();
  }, []);

  const filteredBranches = useMemo(() => {
    if (!form.courseId) return branches;

    return branches.filter(
      (branch) =>
        branch.courseId?._id === form.courseId
    );
  }, [branches, form.courseId]);

  const filteredList = useMemo(() => {
    const value = search.trim().toLowerCase();

    return semesters.filter((semester) => {
      const course = semester.courseId || {};
      const branch = semester.branchId || {};

      const matchesSearch =
        !value ||
        semester.semesterName
          ?.toLowerCase()
          .includes(value) ||
        String(
          semester.semesterNumber
        ).includes(value) ||
        course.courseName
          ?.toLowerCase()
          .includes(value) ||
        course.courseCode
          ?.toLowerCase()
          .includes(value) ||
        branch.branchName
          ?.toLowerCase()
          .includes(value) ||
        branch.branchCode
          ?.toLowerCase()
          .includes(value);

      const matchesCourse =
        !courseFilter ||
        course._id === courseFilter;

      const matchesBranch =
        !branchFilter ||
        branch._id === branchFilter;

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active"
          ? semester.isActive
          : !semester.isActive);

      return (
        matchesSearch &&
        matchesCourse &&
        matchesBranch &&
        matchesStatus
      );
    });
  }, [
    semesters,
    search,
    courseFilter,
    branchFilter,
    statusFilter,
  ]);

  const activeSemesters = semesters.filter(
    (semester) => semester.isActive
  ).length;

  const inactiveSemesters = semesters.filter(
    (semester) => !semester.isActive
  ).length;

  const branchesWithSemesters = new Set(
    semesters.map(
      (semester) => semester.branchId?._id
    )
  ).size;

  const openAddModal = () => {
    setForm(initialForm);
    setSelectedSemester(null);
    setModal("add");
  };

  const openEditModal = (semester) => {
    setSelectedSemester(semester);

    setForm({
      courseId: semester.courseId?._id || "",
      branchId: semester.branchId?._id || "",
      semesterNumber:
        semester.semesterNumber || "",
      semesterName:
        semester.semesterName || "",
      isActive:
        semester.isActive !== false,
    });

    setModal("edit");
  };

  const openViewModal = (semester) => {
    setSelectedSemester(semester);
    setModal("view");
  };

  const openDeleteModal = (semester) => {
    setSelectedSemester(semester);
    setModal("delete");
  };

  const closeModal = () => {
    if (saving) return;

    setModal(null);
    setSelectedSemester(null);
    setForm(initialForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "courseId") {
      setForm((previous) => ({
        ...previous,
        courseId: value,
        branchId: "",
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleActiveChange = (event) => {
    setForm((previous) => ({
      ...previous,
      isActive: event.target.checked,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (
      !form.courseId ||
      !form.branchId ||
      !form.semesterNumber ||
      !form.semesterName
    ) {
      toast.error(
        "Please fill all required fields"
      );

      return;
    }

    try {
      setSaving(true);

      const response =
        await axiosClient.post(
          "/admin/semesters/createSemester",
          {
            courseId: form.courseId,
            branchId: form.branchId,
            semesterNumber: Number(
              form.semesterNumber
            ),
            semesterName: form.semesterName,
          }
        );

      toast.success(
        response.data.message ||
          "Semester created successfully"
      );

      closeModal();
      await fetchSemesters();
    } catch (error) {
      console.error(
        "CREATE SEMESTER ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create semester"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!selectedSemester?._id) return;

    try {
      setSaving(true);

      const response =
        await axiosClient.put(
          `/admin/semesters/updateSemester/${selectedSemester._id}`,
          {
            courseId: form.courseId,
            branchId: form.branchId,
            semesterNumber: Number(
              form.semesterNumber
            ),
            semesterName: form.semesterName,
            isActive: form.isActive,
          }
        );

      toast.success(
        response.data.message ||
          "Semester updated successfully"
      );

      closeModal();
      await fetchSemesters();
    } catch (error) {
      console.error(
        "UPDATE SEMESTER ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update semester"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSemester?._id) return;

    try {
      setSaving(true);

      const response =
        await axiosClient.delete(
          `/admin/semesters/deleteSemester/${selectedSemester._id}`
        );

      toast.success(
        response.data.message ||
          "Semester deleted successfully"
      );

      closeModal();
      await fetchSemesters();
    } catch (error) {
      console.error(
        "DELETE SEMESTER ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete semester"
      );
    } finally {
      setSaving(false);
    }
  };

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
                Semesters
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage semester structures for
                every academic branch.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              disabled={
                supportLoading ||
                courses.length === 0 ||
                branches.length === 0
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Plus size={18} />
              Add Semester
            </button>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Semesters"
            value={semesters.length}
            icon={GraduationCap}
          />

          <SummaryCard
            title="Active Semesters"
            value={activeSemesters}
            icon={CheckCircle2}
          />

          <SummaryCard
            title="Inactive Semesters"
            value={inactiveSemesters}
            icon={XCircle}
          />

          <SummaryCard
            title="Branches Covered"
            value={branchesWithSemesters}
            icon={GitBranch}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Semester List
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredList.length} semester
                  {filteredList.length !== 1
                    ? "s"
                    : ""}{" "}
                  found
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex">
                <div className="relative sm:col-span-2 xl:w-72">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search semesters..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <SelectField
                  value={courseFilter}
                  onChange={(event) =>
                    setCourseFilter(
                      event.target.value
                    )
                  }
                  options={courses.map(
                    (course) => ({
                      label: `${course.courseCode} - ${course.courseName}`,
                      value: course._id,
                    })
                  )}
                  placeholder="All Courses"
                />

                <SelectField
                  value={branchFilter}
                  onChange={(event) =>
                    setBranchFilter(
                      event.target.value
                    )
                  }
                  options={branches.map(
                    (branch) => ({
                      label: `${branch.branchCode} - ${branch.branchName}`,
                      value: branch._id,
                    })
                  )}
                  placeholder="All Branches"
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

          <SemesterTable
            semesters={filteredList}
            loading={loading}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        </section>
      </div>

      {(modal === "add" ||
        modal === "edit") && (
        <SemesterFormModal
          title={
            modal === "add"
              ? "Add Semester"
              : "Edit Semester"
          }
          description={
            modal === "add"
              ? "Create a semester under a branch."
              : "Update semester configuration."
          }
          form={form}
          courses={courses}
          branches={filteredBranches}
          saving={saving}
          isEdit={modal === "edit"}
          onChange={handleChange}
          onActiveChange={handleActiveChange}
          onSubmit={
            modal === "add"
              ? handleCreate
              : handleUpdate
          }
          onClose={closeModal}
        />
      )}

      {modal === "view" &&
        selectedSemester && (
          <SemesterViewModal
            semester={selectedSemester}
            onClose={closeModal}
            onEdit={() => {
              closeModal();

              setTimeout(() => {
                openEditModal(
                  selectedSemester
                );
              }, 0);
            }}
          />
        )}

      {modal === "delete" &&
        selectedSemester && (
          <DeleteModal
            semester={selectedSemester}
            saving={saving}
            onClose={closeModal}
            onConfirm={handleDelete}
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

function SemesterTable({
  semesters,
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
          Loading semesters...
        </div>
      </div>
    );
  }

  if (!semesters.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <GraduationCap size={25} />
        </div>

        <h3 className="mt-4 font-semibold text-slate-900">
          No semesters found
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
        <table className="w-full min-w-[1050px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Semester
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Course
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Branch
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Number
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
            {semesters.map((semester) => (
              <tr
                key={semester._id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <GraduationCap size={18} />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {semester.semesterName}
                      </p>

                      <p className="text-xs text-slate-400">
                        Academic semester
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium text-slate-700">
                    {semester.courseId
                      ?.courseName || "-"}
                  </p>

                  <p className="text-xs text-slate-400">
                    {semester.courseId
                      ?.courseCode || "-"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium text-slate-700">
                    {semester.branchId
                      ?.branchName || "-"}
                  </p>

                  <p className="text-xs text-slate-400">
                    {semester.branchId
                      ?.branchCode || "-"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                    {semester.semesterNumber}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <StatusBadge
                    active={semester.isActive}
                  />
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <ActionButton
                      icon={Eye}
                      label="View semester"
                      onClick={() =>
                        onView(semester)
                      }
                    />

                    <ActionButton
                      icon={Pencil}
                      label="Edit semester"
                      onClick={() =>
                        onEdit(semester)
                      }
                    />

                    <ActionButton
                      icon={Trash2}
                      label="Delete semester"
                      danger
                      onClick={() =>
                        onDelete(semester)
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
        {semesters.map((semester) => (
          <div
            key={semester._id}
            className="p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <GraduationCap size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {semester.semesterName}
                  </h3>

                  <StatusBadge
                    active={semester.isActive}
                  />
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Semester{" "}
                  {semester.semesterNumber}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MobileInfo
                label="Course"
                value={
                  semester.courseId
                    ?.courseName || "-"
                }
              />

              <MobileInfo
                label="Branch"
                value={
                  semester.branchId
                    ?.branchName || "-"
                }
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  onView(semester)
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700"
              >
                <Eye size={16} />
                View
              </button>

              <button
                type="button"
                onClick={() =>
                  onEdit(semester)
                }
                className="flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2.5 text-slate-700"
              >
                <Pencil size={16} />
              </button>

              <button
                type="button"
                onClick={() =>
                  onDelete(semester)
                }
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

function SemesterFormModal({
  title,
  description,
  form,
  courses,
  branches,
  saving,
  isEdit,
  onChange,
  onActiveChange,
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
              options={courses.map(
                (course) => ({
                  label: `${course.courseCode} - ${course.courseName}`,
                  value: course._id,
                })
              )}
              required
            />

            <SelectInput
              label="Branch"
              name="branchId"
              value={form.branchId}
              onChange={onChange}
              options={branches.map(
                (branch) => ({
                  label: `${branch.branchCode} - ${branch.branchName}`,
                  value: branch._id,
                })
              )}
              required
            />

            <InputField
              label="Semester Number"
              name="semesterNumber"
              type="number"
              value={form.semesterNumber}
              onChange={onChange}
              placeholder="Example: 5"
              required
            />

            <InputField
              label="Semester Name"
              name="semesterName"
              value={form.semesterName}
              onChange={onChange}
              placeholder="Example: Semester 5"
              required
            />

            {isEdit && (
              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={onActiveChange}
                    className="h-4 w-4 rounded border-slate-300"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Active Semester
                    </p>

                    <p className="text-xs text-slate-500">
                      Inactive semesters should not
                      be used for new academic
                      assignments.
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
                : "Create Semester"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function SemesterViewModal({
  semester,
  onClose,
  onEdit,
}) {
  return (
    <Modal onClose={onClose}>
      <div className="max-h-[92vh] overflow-y-auto">
        <ModalHeader
          title="Semester Details"
          description="Academic semester information."
          onClose={onClose}
        />

        <div className="p-4 sm:p-6">
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <GraduationCap size={25} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    {semester.semesterName}
                  </h3>

                  <StatusBadge
                    active={semester.isActive}
                  />
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Semester{" "}
                  {semester.semesterNumber} •{" "}
                  {semester.branchId
                    ?.branchName || "-"}
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
              icon={GraduationCap}
              label="Semester Number"
              value={
                semester.semesterNumber
              }
            />

            <InfoCard
              icon={BookOpen}
              label="Course"
              value={
                semester.courseId
                  ?.courseName
              }
            />

            <InfoCard
              icon={BookOpen}
              label="Course Code"
              value={
                semester.courseId
                  ?.courseCode
              }
            />

            <InfoCard
              icon={GitBranch}
              label="Branch"
              value={
                semester.branchId
                  ?.branchName
              }
            />

            <InfoCard
              icon={GitBranch}
              label="Branch Code"
              value={
                semester.branchId
                  ?.branchCode
              }
            />

            <InfoCard
              icon={
                semester.isActive
                  ? CheckCircle2
                  : XCircle
              }
              label="Status"
              value={
                semester.isActive
                  ? "Active"
                  : "Inactive"
              }
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function DeleteModal({
  semester,
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
          Delete Semester
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">
            {semester.semesterName}
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

            Delete Semester
          </button>
        </div>
      </div>
    </Modal>
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
              key={option.value}
              value={option.value}
            >
              {option.label}
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
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
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
  type = "text",
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
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={type === "number" ? 1 : undefined}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400"
      />
    </label>
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

export default Semesters;