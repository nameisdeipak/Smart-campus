import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  BookOpen,
  GraduationCap,
  GitBranch,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Award,
  Hash,
} from "lucide-react";

import toast from "react-hot-toast";
import axiosClient from "../../services/axiosClient";

const initialForm = {
  courseId: "",
  branchId: "",
  semesterId: "",
  subjectCode: "",
  subjectName: "",
  subjectType: "Core",
  credits: "",
  maxMarks: "",
  passingMarks: "",
  isActive: true,
};

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [loading, setLoading] = useState(true);
  const [supportLoading, setSupportLoading] =
    useState(true);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] =
    useState("");
  const [branchFilter, setBranchFilter] =
    useState("");
  const [semesterFilter, setSemesterFilter] =
    useState("");
  const [typeFilter, setTypeFilter] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("");

  const [modal, setModal] = useState(null);
  const [selectedSubject, setSelectedSubject] =
    useState(null);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchSubjects = async () => {
    try {
      setLoading(true);

      const response =
        await axiosClient.get(
          "/admin/subjects/getAllSubjects"
        );

      setSubjects(
        response.data.subjects || []
      );
    } catch (error) {
      console.error(
        "FETCH SUBJECTS ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load subjects"
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
        semestersResponse,
      ] = await Promise.all([
        axiosClient.get(
          "/admin/courses/getAllCourses"
        ),
        axiosClient.get(
          "/admin/branches/getAllBranches"
        ),
        axiosClient.get(
          "/admin/semesters/getAllSemesters"
        ),
      ]);

      setCourses(
        coursesResponse.data.courses || []
      );

      setBranches(
        branchesResponse.data.branches || []
      );

      setSemesters(
        semestersResponse.data.semesters || []
      );
    } catch (error) {
      console.error(
        "FETCH SUBJECT SUPPORT DATA ERROR:",
        error
      );

      toast.error(
        "Failed to load academic structure"
      );
    } finally {
      setSupportLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchSupportData();
  }, []);

  const formBranches = useMemo(() => {
    if (!form.courseId) {
      return [];
    }

    return branches.filter(
      (branch) =>
        branch.courseId?._id === form.courseId
    );
  }, [branches, form.courseId]);

  const formSemesters = useMemo(() => {
    if (
      !form.courseId ||
      !form.branchId
    ) {
      return [];
    }

    return semesters.filter(
      (semester) =>
        semester.courseId?._id ===
          form.courseId &&
        semester.branchId?._id ===
          form.branchId
    );
  }, [
    semesters,
    form.courseId,
    form.branchId,
  ]);

  const filterBranches = useMemo(() => {
    if (!courseFilter) {
      return branches;
    }

    return branches.filter(
      (branch) =>
        branch.courseId?._id ===
        courseFilter
    );
  }, [branches, courseFilter]);

  const filterSemesters = useMemo(() => {
    let result = semesters;

    if (courseFilter) {
      result = result.filter(
        (semester) =>
          semester.courseId?._id ===
          courseFilter
      );
    }

    if (branchFilter) {
      result = result.filter(
        (semester) =>
          semester.branchId?._id ===
          branchFilter
      );
    }

    return result;
  }, [
    semesters,
    courseFilter,
    branchFilter,
  ]);

  const filteredSubjects = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    return subjects.filter((subject) => {
      const course = subject.courseId || {};
      const branch = subject.branchId || {};
      const semester =
        subject.semesterId || {};

      const matchesSearch =
        !value ||
        subject.subjectCode
          ?.toLowerCase()
          .includes(value) ||
        subject.subjectName
          ?.toLowerCase()
          .includes(value) ||
        course.courseCode
          ?.toLowerCase()
          .includes(value) ||
        course.courseName
          ?.toLowerCase()
          .includes(value) ||
        branch.branchCode
          ?.toLowerCase()
          .includes(value) ||
        branch.branchName
          ?.toLowerCase()
          .includes(value) ||
        semester.semesterName
          ?.toLowerCase()
          .includes(value);

      const matchesCourse =
        !courseFilter ||
        course._id === courseFilter;

      const matchesBranch =
        !branchFilter ||
        branch._id === branchFilter;

      const matchesSemester =
        !semesterFilter ||
        semester._id === semesterFilter;

      const matchesType =
        !typeFilter ||
        subject.subjectType === typeFilter;

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active"
          ? subject.isActive
          : !subject.isActive);

      return (
        matchesSearch &&
        matchesCourse &&
        matchesBranch &&
        matchesSemester &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    subjects,
    search,
    courseFilter,
    branchFilter,
    semesterFilter,
    typeFilter,
    statusFilter,
  ]);

  const activeSubjects = subjects.filter(
    (subject) => subject.isActive
  ).length;

  const inactiveSubjects = subjects.filter(
    (subject) => !subject.isActive
  ).length;

  const totalCredits = subjects.reduce(
    (total, subject) =>
      total + Number(subject.credits || 0),
    0
  );

  const openAddModal = () => {
    setForm(initialForm);
    setSelectedSubject(null);
    setModal("add");
  };

  const openEditModal = (subject) => {
    setSelectedSubject(subject);

    setForm({
      courseId: subject.courseId?._id || "",
      branchId: subject.branchId?._id || "",
      semesterId:
        subject.semesterId?._id || "",
      subjectCode:
        subject.subjectCode || "",
      subjectName:
        subject.subjectName || "",
      subjectType:
        subject.subjectType || "Core",
      credits:
        subject.credits ?? "",
      maxMarks:
        subject.maxMarks ?? "",
      passingMarks:
        subject.passingMarks ?? "",
      isActive:
        subject.isActive !== false,
    });

    setModal("edit");
  };

  const openViewModal = (subject) => {
    setSelectedSubject(subject);
    setModal("view");
  };

  const openDeleteModal = (subject) => {
    setSelectedSubject(subject);
    setModal("delete");
  };

  const closeModal = () => {
    if (saving) return;

    setModal(null);
    setSelectedSubject(null);
    setForm(initialForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "courseId") {
      setForm((previous) => ({
        ...previous,
        courseId: value,
        branchId: "",
        semesterId: "",
      }));

      return;
    }

    if (name === "branchId") {
      setForm((previous) => ({
        ...previous,
        branchId: value,
        semesterId: "",
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

  const validateForm = () => {
    if (
      !form.courseId ||
      !form.branchId ||
      !form.semesterId ||
      !form.subjectCode ||
      !form.subjectName ||
      !form.subjectType ||
      form.credits === "" ||
      form.maxMarks === "" ||
      form.passingMarks === ""
    ) {
      toast.error(
        "Please fill all required fields"
      );

      return false;
    }

    if (
      Number(form.credits) < 0 ||
      Number(form.maxMarks) <= 0 ||
      Number(form.passingMarks) < 0
    ) {
      toast.error(
        "Please enter valid academic values"
      );

      return false;
    }

    if (
      Number(form.passingMarks) >
      Number(form.maxMarks)
    ) {
      toast.error(
        "Passing marks cannot exceed maximum marks"
      );

      return false;
    }

    return true;
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const response =
        await axiosClient.post(
          "/admin/subjects/createSubject",
          {
            courseId: form.courseId,
            branchId: form.branchId,
            semesterId: form.semesterId,
            subjectCode:
              form.subjectCode.trim(),
            subjectName:
              form.subjectName.trim(),
            subjectType: form.subjectType,
            credits: Number(form.credits),
            maxMarks: Number(
              form.maxMarks
            ),
            passingMarks: Number(
              form.passingMarks
            ),
          }
        );

      toast.success(
        response.data.message ||
          "Subject created successfully"
      );

      closeModal();
      await fetchSubjects();
    } catch (error) {
      console.error(
        "CREATE SUBJECT ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create subject"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!selectedSubject?._id) return;

    if (!validateForm()) return;

    try {
      setSaving(true);

      const response =
        await axiosClient.put(
          `/admin/subjects/updateSubject/${selectedSubject._id}`,
          {
            courseId: form.courseId,
            branchId: form.branchId,
            semesterId: form.semesterId,
            subjectCode:
              form.subjectCode.trim(),
            subjectName:
              form.subjectName.trim(),
            subjectType: form.subjectType,
            credits: Number(form.credits),
            maxMarks: Number(
              form.maxMarks
            ),
            passingMarks: Number(
              form.passingMarks
            ),
            isActive: form.isActive,
          }
        );

      toast.success(
        response.data.message ||
          "Subject updated successfully"
      );

      closeModal();
      await fetchSubjects();
    } catch (error) {
      console.error(
        "UPDATE SUBJECT ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update subject"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSubject?._id) return;

    try {
      setSaving(true);

      const response =
        await axiosClient.delete(
          `/admin/subjects/deleteSubject/${selectedSubject._id}`
        );

      toast.success(
        response.data.message ||
          "Subject deleted successfully"
      );

      closeModal();
      await fetchSubjects();
    } catch (error) {
      console.error(
        "DELETE SUBJECT ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete subject"
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
                Subjects
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage subjects, credits and
                examination configuration for
                each semester.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              disabled={
                supportLoading ||
                courses.length === 0 ||
                branches.length === 0 ||
                semesters.length === 0
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Plus size={18} />
              Add Subject
            </button>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Subjects"
            value={subjects.length}
            icon={BookOpen}
          />

          <SummaryCard
            title="Active Subjects"
            value={activeSubjects}
            icon={CheckCircle2}
          />

          <SummaryCard
            title="Inactive Subjects"
            value={inactiveSubjects}
            icon={XCircle}
          />

          <SummaryCard
            title="Total Credits"
            value={totalCredits}
            icon={Award}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Subject List
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredSubjects.length} subject
                  {filteredSubjects.length !== 1
                    ? "s"
                    : ""}{" "}
                  found
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <div className="relative sm:col-span-2 lg:col-span-3 xl:col-span-2">
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
                    placeholder="Search subjects..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <SelectField
                  value={courseFilter}
                  onChange={(event) => {
                    setCourseFilter(
                      event.target.value
                    );
                    setBranchFilter("");
                    setSemesterFilter("");
                  }}
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
                  onChange={(event) => {
                    setBranchFilter(
                      event.target.value
                    );
                    setSemesterFilter("");
                  }}
                  options={filterBranches.map(
                    (branch) => ({
                      label: `${branch.branchCode} - ${branch.branchName}`,
                      value: branch._id,
                    })
                  )}
                  placeholder="All Branches"
                />

                <SelectField
                  value={semesterFilter}
                  onChange={(event) =>
                    setSemesterFilter(
                      event.target.value
                    )
                  }
                  options={filterSemesters.map(
                    (semester) => ({
                      label:
                        semester.semesterName,
                      value: semester._id,
                    })
                  )}
                  placeholder="All Semesters"
                />

                <SelectField
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target.value
                    )
                  }
                  options={[
                    {
                      label: "Core",
                      value: "Core",
                    },
                    {
                      label: "Elective",
                      value: "Elective",
                    },
                    {
                      label: "Practical",
                      value: "Practical",
                    },
                    {
                      label: "Lab",
                      value: "Lab",
                    },
                    {
                      label: "Project",
                      value: "Project",
                    },
                    {
                      label: "Training",
                      value: "Training",
                    },
                  ]}
                  placeholder="All Types"
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

          <SubjectTable
            subjects={filteredSubjects}
            loading={loading}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        </section>
      </div>

      {(modal === "add" ||
        modal === "edit") && (
        <SubjectFormModal
          title={
            modal === "add"
              ? "Add Subject"
              : "Edit Subject"
          }
          description={
            modal === "add"
              ? "Create a subject under a semester."
              : "Update subject configuration."
          }
          form={form}
          courses={courses}
          branches={formBranches}
          semesters={formSemesters}
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
        selectedSubject && (
          <SubjectViewModal
            subject={selectedSubject}
            onClose={closeModal}
            onEdit={() => {
              closeModal();

              setTimeout(() => {
                openEditModal(
                  selectedSubject
                );
              }, 0);
            }}
          />
        )}

      {modal === "delete" &&
        selectedSubject && (
          <DeleteModal
            subject={selectedSubject}
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

function SubjectTable({
  subjects,
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
          Loading subjects...
        </div>
      </div>
    );
  }

  if (!subjects.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <BookOpen size={25} />
        </div>

        <h3 className="mt-4 font-semibold text-slate-900">
          No subjects found
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
        <table className="w-full min-w-[1250px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Subject
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Course
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Branch
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Semester
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Type
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Credits
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Marks
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
            {subjects.map((subject) => (
              <tr
                key={subject._id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <BookOpen size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {subject.subjectName}
                      </p>

                      <p className="text-xs font-bold text-slate-400">
                        {subject.subjectCode}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium text-slate-700">
                    {subject.courseId
                      ?.courseName || "-"}
                  </p>

                  <p className="text-xs text-slate-400">
                    {subject.courseId
                      ?.courseCode || "-"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium text-slate-700">
                    {subject.branchId
                      ?.branchName || "-"}
                  </p>

                  <p className="text-xs text-slate-400">
                    {subject.branchId
                      ?.branchCode || "-"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  {subject.semesterId
                    ?.semesterName || "-"}
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {subject.subjectType}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className="font-semibold text-slate-700">
                    {subject.credits}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-700">
                    {subject.passingMarks}/
                    {subject.maxMarks}
                  </p>

                  <p className="text-xs text-slate-400">
                    Pass / Max
                  </p>
                </td>

                <td className="px-5 py-4">
                  <StatusBadge
                    active={subject.isActive}
                  />
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <ActionButton
                      icon={Eye}
                      label="View subject"
                      onClick={() =>
                        onView(subject)
                      }
                    />

                    <ActionButton
                      icon={Pencil}
                      label="Edit subject"
                      onClick={() =>
                        onEdit(subject)
                      }
                    />

                    <ActionButton
                      icon={Trash2}
                      label="Delete subject"
                      danger
                      onClick={() =>
                        onDelete(subject)
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
        {subjects.map((subject) => (
          <div
            key={subject._id}
            className="p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <BookOpen size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {subject.subjectName}
                  </h3>

                  <StatusBadge
                    active={subject.isActive}
                  />
                </div>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {subject.subjectCode} •{" "}
                  {subject.subjectType}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <MobileInfo
                label="Course"
                value={
                  subject.courseId
                    ?.courseName || "-"
                }
              />

              <MobileInfo
                label="Branch"
                value={
                  subject.branchId
                    ?.branchName || "-"
                }
              />

              <MobileInfo
                label="Semester"
                value={
                  subject.semesterId
                    ?.semesterName || "-"
                }
              />

              <MobileInfo
                label="Credits"
                value={subject.credits}
              />

              <MobileInfo
                label="Marks"
                value={`${subject.passingMarks}/${subject.maxMarks}`}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  onView(subject)
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700"
              >
                <Eye size={16} />
                View
              </button>

              <button
                type="button"
                onClick={() =>
                  onEdit(subject)
                }
                className="flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2.5 text-slate-700"
              >
                <Pencil size={16} />
              </button>

              <button
                type="button"
                onClick={() =>
                  onDelete(subject)
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

function SubjectFormModal({
  title,
  description,
  form,
  courses,
  branches,
  semesters,
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

            <SelectInput
              label="Semester"
              name="semesterId"
              value={form.semesterId}
              onChange={onChange}
              options={semesters.map(
                (semester) => ({
                  label:
                    semester.semesterName,
                  value: semester._id,
                })
              )}
              required
            />

            <InputField
              label="Subject Code"
              name="subjectCode"
              value={form.subjectCode}
              onChange={onChange}
              placeholder="Example: IT501"
              required
            />

            <InputField
              label="Subject Name"
              name="subjectName"
              value={form.subjectName}
              onChange={onChange}
              placeholder="Example: Database Management System"
              required
            />

            <SelectInput
              label="Subject Type"
              name="subjectType"
              value={form.subjectType}
              onChange={onChange}
              options={[
                {
                  label: "Core",
                  value: "Core",
                },
                {
                  label: "Elective",
                  value: "Elective",
                },
                {
                  label: "Practical",
                  value: "Practical",
                },
                {
                  label: "Lab",
                  value: "Lab",
                },
                {
                  label: "Project",
                  value: "Project",
                },
                {
                  label: "Training",
                  value: "Training",
                },
              ]}
              required
            />

            <InputField
              label="Credits"
              name="credits"
              type="number"
              value={form.credits}
              onChange={onChange}
              placeholder="Example: 4"
              required
            />

            <InputField
              label="Maximum Marks"
              name="maxMarks"
              type="number"
              value={form.maxMarks}
              onChange={onChange}
              placeholder="Example: 100"
              required
            />

            <InputField
              label="Passing Marks"
              name="passingMarks"
              type="number"
              value={form.passingMarks}
              onChange={onChange}
              placeholder="Example: 40"
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
                      Active Subject
                    </p>

                    <p className="text-xs text-slate-500">
                      Inactive subjects should not
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
                : "Create Subject"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function SubjectViewModal({
  subject,
  onClose,
  onEdit,
}) {
  return (
    <Modal onClose={onClose}>
      <div className="max-h-[92vh] overflow-y-auto">
        <ModalHeader
          title="Subject Details"
          description="Academic subject information."
          onClose={onClose}
        />

        <div className="p-4 sm:p-6">
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <BookOpen size={25} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    {subject.subjectName}
                  </h3>

                  <StatusBadge
                    active={subject.isActive}
                  />
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {subject.subjectCode} •{" "}
                  {subject.subjectType}
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
              icon={Hash}
              label="Subject Code"
              value={subject.subjectCode}
            />

            <InfoCard
              icon={BookOpen}
              label="Subject Type"
              value={subject.subjectType}
            />

            <InfoCard
              icon={GraduationCap}
              label="Course"
              value={
                subject.courseId
                  ?.courseName
              }
            />

            <InfoCard
              icon={GitBranch}
              label="Branch"
              value={
                subject.branchId
                  ?.branchName
              }
            />

            <InfoCard
              icon={GraduationCap}
              label="Semester"
              value={
                subject.semesterId
                  ?.semesterName
              }
            />

            <InfoCard
              icon={Award}
              label="Credits"
              value={subject.credits}
            />

            <InfoCard
              icon={BookOpen}
              label="Maximum Marks"
              value={subject.maxMarks}
            />

            <InfoCard
              icon={CheckCircle2}
              label="Passing Marks"
              value={subject.passingMarks}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function DeleteModal({
  subject,
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
          Delete Subject
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">
            {subject.subjectName}
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

            Delete Subject
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
        min={type === "number" ? 0 : undefined}
        step={
          name === "credits"
            ? "0.5"
            : "1"
        }
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

          <p className="mt-1 break-word text-sm font-medium text-slate-800">
            {value || "-"}
          </p>
        </div>
      </div>
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

      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
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

export default Subjects;