import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  UserRound,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  GraduationCap,
  Hash,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronDown,
} from "lucide-react";

import toast from "react-hot-toast";
import axiosClient from "../../services/axiosClient";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  enrollmentNumber: "",
  dateOfBirth: "",
  gender: "",
  course: "",
  branch: "",
  semester: "",
  section: "",
  admissionYear: "",
  address: "",
};

const courses = [
  "B.Tech",
  "M.Tech",
  "BCA",
  "MCA",
  "BBA",
  "MBA",
];

const branches = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
];

const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await axiosClient.get(
        "/admin/students/getAllStudent"
      );

      setStudents(response.data.students || []);
    } catch (error) {
      console.error("FETCH STUDENTS ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load students"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();

    return students.filter((student) => {
      const user = student.userId || {};

      const matchesSearch =
        !value ||
        user.name?.toLowerCase().includes(value) ||
        user.email?.toLowerCase().includes(value) ||
        student.enrollmentNumber
          ?.toLowerCase()
          .includes(value) ||
        student.rollNumber
          ?.toLowerCase()
          .includes(value) ||
        student.branch?.toLowerCase().includes(value);

      const matchesCourse =
        !courseFilter ||
        student.course === courseFilter;

      const matchesSemester =
        !semesterFilter ||
        String(student.semester) === semesterFilter;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesSemester
      );
    });
  }, [
    students,
    search,
    courseFilter,
    semesterFilter,
  ]);

  const openAddModal = () => {
    setForm(initialForm);
    setSelectedStudent(null);
    setModal("add");
  };

  const openEditModal = (student) => {
    const user = student.userId || {};

    setSelectedStudent(student);

    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      enrollmentNumber:
        student.enrollmentNumber || "",
      rollNumber: student.rollNumber || "",
      dateOfBirth: formatDateForInput(
        student.dateOfBirth
      ),
      gender: student.gender || "",
      course: student.course || "",
      branch: student.branch || "",
      semester:
        student.semester !== undefined
          ? String(student.semester)
          : "",
      section: student.section || "",
      admissionYear:
        student.admissionYear !== undefined
          ? String(student.admissionYear)
          : "",
      address: student.address || "",
    });

    setModal("edit");
  };

  const openViewModal = (student) => {
    setSelectedStudent(student);
    setModal("view");
  };

  const openDeleteModal = (student) => {
    setSelectedStudent(student);
    setModal("delete");
  };

  const closeModal = () => {
    if (saving) return;

    setModal(null);
    setSelectedStudent(null);
    setForm(initialForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateStudent = async (event) => {
    event.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.course ||
      !form.branch ||
      !form.semester
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);

      const response = await axiosClient.post(
        "/admin/students/createStudent",
        {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          rollNumber: form.rollNumber,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          course: form.course,
          branch: form.branch,
          semester: form.semester,
          section: form.section,
          admissionYear: form.admissionYear,
          address: form.address,
        }
      );

      toast.success(
        response.data.message ||
          "Student created successfully"
      );

      closeModal();
      await fetchStudents();
    } catch (error) {
      console.error(
        "CREATE STUDENT ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create student"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStudent = async (event) => {
    event.preventDefault();

    if (!selectedStudent?._id) return;

    try {
      setSaving(true);

      const response = await axiosClient.put(
        `/admin/students/updateStudentInfo/${selectedStudent._id}`,
        {
          name: form.name,
          phone: form.phone,
          rollNumber: form.rollNumber,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          course: form.course,
          branch: form.branch,
          semester: form.semester,
          section: form.section,
          admissionYear: form.admissionYear,
          address: form.address,
        }
      );

      toast.success(
        response.data.message ||
          "Student updated successfully"
      );

      closeModal();
      await fetchStudents();
    } catch (error) {
      console.error(
        "UPDATE STUDENT ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update student"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent?._id) return;

    try {
      setSaving(true);

      const response = await axiosClient.delete(
        `/admin/students/removeStudent/${selectedStudent._id}`
      );

      toast.success(
        response.data.message ||
          "Student deleted successfully"
      );

      closeModal();
      await fetchStudents();
    } catch (error) {
      console.error(
        "DELETE STUDENT ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete student"
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
                Students
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage student profiles, academic information,
                enrollment details and performance records.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
            >
              <Plus size={18} />
              Add Student
            </button>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Students"
            value={students.length}
            icon={Users}
          />

          <SummaryCard
            title="Active Students"
            value={students.filter(
              (student) =>
                student.userId?.isActive !== false
            ).length}
            icon={CheckCircle2}
          />

          <SummaryCard
            title="Courses"
            value={
              new Set(
                students.map(
                  (student) => student.course
                )
              ).size
            }
            icon={BookOpen}
          />

          <SummaryCard
            title="Performance"
            value="View"
            icon={TrendingUp}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Student List
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredStudents.length} student
                  {filteredStudents.length !== 1
                    ? "s"
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
                    placeholder="Search student..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <SelectField
                  value={courseFilter}
                  onChange={(event) =>
                    setCourseFilter(event.target.value)
                  }
                  options={courses}
                  placeholder="All Courses"
                />

                <SelectField
                  value={semesterFilter}
                  onChange={(event) =>
                    setSemesterFilter(event.target.value)
                  }
                  options={semesters}
                  placeholder="All Semesters"
                />
              </div>
            </div>
          </div>

          <StudentTable
            students={filteredStudents}
            loading={loading}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        </section>
      </div>

      {modal === "add" && (
        <StudentFormModal
          title="Add Student"
          description="Create a new student account and academic profile."
          form={form}
          saving={saving}
          isEdit={false}
          onChange={handleChange}
          onSubmit={handleCreateStudent}
          onClose={closeModal}
        />
      )}

      {modal === "edit" && (
        <StudentFormModal
          title="Edit Student"
          description="Update student profile and academic information."
          form={form}
          saving={saving}
          isEdit={true}
          onChange={handleChange}
          onSubmit={handleUpdateStudent}
          onClose={closeModal}
        />
      )}

      {modal === "view" && selectedStudent && (
        <StudentViewModal
          student={selectedStudent}
          onClose={closeModal}
          onEdit={() => {
            closeModal();
            setTimeout(() => {
              openEditModal(selectedStudent);
            }, 0);
          }}
        />
      )}

      {modal === "delete" && selectedStudent && (
        <DeleteModal
          student={selectedStudent}
          saving={saving}
          onClose={closeModal}
          onConfirm={handleDeleteStudent}
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

function StudentTable({
  students,
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
          Loading students...
        </div>
      </div>
    );
  }

  if (!students.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <Users size={25} />
        </div>

        <h3 className="mt-4 font-semibold text-slate-900">
          No students found
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
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Student
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Enrollment
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Course
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Semester
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
            {students.map((student) => {
              const user = student.userId || {};

              return (
                <tr
                  key={student._id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={user.name}
                      />

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {user.name || "Unnamed Student"}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {user.email || "-"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-700">
                      {student.enrollmentNumber || "-"}
                    </p>

                    {/* <p className="text-xs text-slate-400">
                      Roll: {student.rollNumber || "-"}
                    </p> */}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-700">
                      {student.course || "-"}
                    </p>

                    <p className="max-w-48 truncate text-xs text-slate-400">
                      {student.branch || "-"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    Sem {student.semester || "-"}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge
                      active={user.isActive !== false}
                    />
                  </td>

                  <td className="px-5 py-4">
                    <ActionButtons
                      onView={() => onView(student)}
                      onEdit={() => onEdit(student)}
                      onDelete={() => onDelete(student)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {students.map((student) => {
          const user = student.userId || {};

          return (
            <div
              key={student._id}
              className="p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <Avatar name={user.name} />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {user.name || "Unnamed Student"}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {user.email || "-"}
                  </p>

                  <div className="mt-2">
                    <StatusBadge
                      active={user.isActive !== false}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MobileInfo
                  label="Enrollment"
                  value={
                    student.enrollmentNumber || "-"
                  }
                />

                {/* <MobileInfo
                  label="Roll Number"
                  value={student.rollNumber || "-"}
                /> */}

                <MobileInfo
                  label="Course"
                  value={student.course || "-"}
                />

                <MobileInfo
                  label="Semester"
                  value={
                    student.semester
                      ? `Semester ${student.semester}`
                      : "-"
                  }
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => onView(student)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700"
                >
                  <Eye size={16} />
                  View
                </button>

                <button
                  type="button"
                  onClick={() => onEdit(student)}
                  className="flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2.5 text-slate-700"
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(student)}
                  className="flex items-center justify-center rounded-lg border border-red-100 px-3 py-2.5 text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function ActionButtons({
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex justify-end gap-1">
      <IconButton
        icon={Eye}
        label="View student"
        onClick={onView}
      />

      <IconButton
        icon={Pencil}
        label="Edit student"
        onClick={onEdit}
      />

      <IconButton
        icon={Trash2}
        label="Delete student"
        danger
        onClick={onDelete}
      />
    </div>
  );
}

function IconButton({
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

function StudentFormModal({
  title,
  description,
  form,
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
          <div className="space-y-6">
            <FormSection
              title="Personal Information"
              icon={UserRound}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Enter full name"
                  required
                />

                <InputField
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="Enter phone number"
                />

                <InputField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="student@example.com"
                  type="email"
                  required={!isEdit}
                  disabled={isEdit}
                />

                {!isEdit && (
                  <InputField
                    label="Password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="Create login password"
                    type="password"
                    required
                  />
                )}

                <SelectInput
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={onChange}
                  options={[
                    "Male",
                    "Female",
                    "Other",
                  ]}
                />

                <InputField
                  label="Date of Birth"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={onChange}
                  type="date"
                />

                <div className="sm:col-span-2">
                  <InputField
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder="Enter complete address"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Academic Information"
              icon={GraduationCap}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  label="Enrollment Number"
                  name="enrollmentNumber"
                  value={
                    isEdit
                      ? form.enrollmentNumber
                      : "Generated automatically"
                  }
                  onChange={() => {}}
                  disabled
                />

                {/* <InputField
                  label="Roll Number"
                  name="rollNumber"
                  value={form.rollNumber}
                  onChange={onChange}
                  placeholder="Enter roll number"
                /> */}

                <SelectInput
                  label="Course"
                  name="course"
                  value={form.course}
                  onChange={onChange}
                  options={courses}
                  required
                />

                <SelectInput
                  label="Branch"
                  name="branch"
                  value={form.branch}
                  onChange={onChange}
                  options={branches}
                  required
                />

                <SelectInput
                  label="Semester"
                  name="semester"
                  value={form.semester}
                  onChange={onChange}
                  options={semesters}
                  required
                />

                <InputField
                  label="Section"
                  name="section"
                  value={form.section}
                  onChange={onChange}
                  placeholder="Example: A"
                />

                <InputField
                  label="Admission Year"
                  name="admissionYear"
                  value={form.admissionYear}
                  onChange={onChange}
                  placeholder="Example: 2026"
                  type="number"
                />
              </div>
            </FormSection>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {isEdit
                ? "Save Changes"
                : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function StudentViewModal({
  student,
  onClose,
  onEdit,
}) {
  const user = student.userId || {};

  return (
    <Modal onClose={onClose}>
      <div className="max-h-[92vh] overflow-y-auto">
        <ModalHeader
          title="Student Profile"
          description="Student information and academic performance."
          onClose={onClose}
        />

        <div className="p-4 sm:p-6">
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar
                name={user.name}
                large
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <h3 className="text-xl font-bold text-slate-900">
                    {user.name || "Unnamed Student"}
                  </h3>

                  <StatusBadge
                    active={user.isActive !== false}
                  />
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {student.enrollmentNumber || "-"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {student.course || "-"} •{" "}
                  {student.branch || "-"}
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
              icon={Mail}
              label="Email"
              value={user.email}
            />

            <InfoCard
              icon={Phone}
              label="Phone"
              value={user.phone}
            />

            {/* <InfoCard
              icon={Hash}
              label="Roll Number"
              value={student.rollNumber}
            /> */}

            <InfoCard
              icon={CalendarDays}
              label="Date of Birth"
              value={formatDisplayDate(
                student.dateOfBirth
              )}
            />

            <InfoCard
              icon={UserRound}
              label="Gender"
              value={student.gender}
            />

            <InfoCard
              icon={BookOpen}
              label="Semester"
              value={
                student.semester
                  ? `Semester ${student.semester}`
                  : "-"
              }
            />

            <InfoCard
              icon={GraduationCap}
              label="Admission Year"
              value={student.admissionYear}
            />

            <InfoCard
              icon={MapPin}
              label="Section"
              value={student.section}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <MapPin
                size={19}
                className="text-slate-500"
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Address
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {student.address ||
                    "Address not available"}
                </p>
              </div>
            </div>
          </div>

          <StudentPerformance />

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <Clock3
                size={18}
                className="mt-0.5 shrink-0 text-slate-500"
              />

              <div>
                <p className="font-semibold text-slate-800">
                  Performance Integration
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Attendance, marks, CGPA and detailed
                  academic analytics will be connected
                  here when the Performance module is
                  implemented.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function StudentPerformance() {
  const performance = [
    {
      label: "Attendance",
      value: "—",
      icon: Clock3,
    },
    {
      label: "CGPA",
      value: "—",
      icon: Award,
    },
    {
      label: "Average Marks",
      value: "—",
      icon: TrendingUp,
    },
    {
      label: "Academic Status",
      value: "Not Available",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="mt-6">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Academic Analytics
        </p>

        <h3 className="mt-1 text-lg font-bold text-slate-900">
          Student Performance
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Performance overview for administrator.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {performance.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Icon size={18} />
                </div>

                <span className="text-lg font-bold text-slate-900">
                  {item.value}
                </span>
              </div>

              <p className="mt-3 text-sm font-medium text-slate-600">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DeleteModal({
  student,
  saving,
  onClose,
  onConfirm,
}) {
  const name =
    student.userId?.name || "this student";

  return (
    <Modal onClose={onClose}>
      <div className="p-5 sm:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <AlertTriangle size={23} />
        </div>

        <h3 className="mt-4 text-xl font-bold text-slate-900">
          Delete Student
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">
            {name}
          </span>
          ? This will remove the student profile and
          associated user account.
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

            Delete Student
          </button>
        </div>
      </div>
    </Modal>
  );
}

function FormSection({
  title,
  icon: Icon,
  children,
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon size={17} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">
            {title}
          </h3>
        </div>
      </div>

      {children}
    </section>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
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
        disabled={disabled}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      />
    </label>
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
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-slate-400"
        >
          <option value="">
            Select {label}
          </option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
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
    <div className="relative min-w-40">
      <select
        value={value}
        onChange={onChange}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
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

function Avatar({ name, large = false }) {
  const initial =
    name?.trim()?.charAt(0)?.toUpperCase() || "S";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-slate-900 font-bold text-white ${
        large
          ? "h-16 w-16 text-xl"
          : "h-10 w-10 text-sm"
      }`}
    >
      {initial}
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

function formatDateForInput(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().split("T")[0];
}

function formatDisplayDate(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default Students;