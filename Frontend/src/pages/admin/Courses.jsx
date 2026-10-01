import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  BookOpen,
  Clock3,
  GraduationCap,
  Layers3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
  FileText,
} from "lucide-react";

import toast from "react-hot-toast";
import axiosClient from "../../services/axiosClient";

const initialForm = {
  courseCode: "",
  courseName: "",
  courseType: "",
  duration: "",
  durationUnit: "Years",
  description: "",
  isActive: true,
};

const courseTypes = [
  "Undergraduate",
  "Postgraduate",
  "Diploma",
  "Certificate",
];

const durationUnits = [
  "Years",
  "Semesters",
];

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("");

  const [modal, setModal] = useState(null);
  const [selectedCourse, setSelectedCourse] =
    useState(null);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const response = await axiosClient.get(
        "/admin/courses/getAllCourses"
      );

      setCourses(response.data.courses || []);
    } catch (error) {
      console.error(
        "FETCH COURSES ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load courses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const value = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !value ||
        course.courseCode
          ?.toLowerCase()
          .includes(value) ||
        course.courseName
          ?.toLowerCase()
          .includes(value) ||
        course.courseType
          ?.toLowerCase()
          .includes(value);

      const matchesType =
        !typeFilter ||
        course.courseType === typeFilter;

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active"
          ? course.isActive
          : !course.isActive);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    courses,
    search,
    typeFilter,
    statusFilter,
  ]);

  const openAddModal = () => {
    setForm(initialForm);
    setSelectedCourse(null);
    setModal("add");
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);

    setForm({
      courseCode: course.courseCode || "",
      courseName: course.courseName || "",
      courseType: course.courseType || "",
      duration:
        course.duration !== undefined
          ? String(course.duration)
          : "",
      durationUnit:
        course.durationUnit || "Years",
      description: course.description || "",
      isActive: course.isActive !== false,
    });

    setModal("edit");
  };

  const openViewModal = (course) => {
    setSelectedCourse(course);
    setModal("view");
  };

  const openDeleteModal = (course) => {
    setSelectedCourse(course);
    setModal("delete");
  };

  const closeModal = () => {
    if (saving) return;

    setModal(null);
    setSelectedCourse(null);
    setForm(initialForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateCourse = async (event) => {
    event.preventDefault();

    if (
      !form.courseCode ||
      !form.courseName ||
      !form.courseType ||
      !form.duration
    ) {
      toast.error(
        "Please fill all required fields"
      );
      return;
    }

    try {
      setSaving(true);

      const response = await axiosClient.post(
        "/admin/courses/createCourse",
        {
          courseCode: form.courseCode,
          courseName: form.courseName,
          courseType: form.courseType,
          duration: Number(form.duration),
          durationUnit: form.durationUnit,
          description: form.description,
        }
      );

      toast.success(
        response.data.message ||
          "Course created successfully"
      );

      closeModal();
      await fetchCourses();
    } catch (error) {
      console.error(
        "CREATE COURSE ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create course"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCourse = async (event) => {
    event.preventDefault();

    if (!selectedCourse?._id) return;

    try {
      setSaving(true);

      const response = await axiosClient.put(
        `/admin/courses/updateCourse/${selectedCourse._id}`,
        {
          courseCode: form.courseCode,
          courseName: form.courseName,
          courseType: form.courseType,
          duration: Number(form.duration),
          durationUnit: form.durationUnit,
          description: form.description,
          isActive: form.isActive,
        }
      );

      toast.success(
        response.data.message ||
          "Course updated successfully"
      );

      closeModal();
      await fetchCourses();
    } catch (error) {
      console.error(
        "UPDATE COURSE ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update course"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse?._id) return;

    try {
      setSaving(true);

      const response = await axiosClient.delete(
        `/admin/courses/deleteCourse/${selectedCourse._id}`
      );

      toast.success(
        response.data.message ||
          "Course deleted successfully"
      );

      closeModal();
      await fetchCourses();
    } catch (error) {
      console.error(
        "DELETE COURSE ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete course"
      );
    } finally {
      setSaving(false);
    }
  };

  const activeCourses = courses.filter(
    (course) => course.isActive
  ).length;

  const inactiveCourses = courses.filter(
    (course) => !course.isActive
  ).length;

  const undergraduateCourses = courses.filter(
    (course) =>
      course.courseType === "Undergraduate"
  ).length;

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
                Courses & Subjects
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage academic courses and build the
                academic structure used by students and
                faculty.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
            >
              <Plus size={18} />
              Add Course
            </button>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Courses"
            value={courses.length}
            icon={BookOpen}
          />

          <SummaryCard
            title="Active Courses"
            value={activeCourses}
            icon={CheckCircle2}
          />

          <SummaryCard
            title="Inactive Courses"
            value={inactiveCourses}
            icon={XCircle}
          />

          <SummaryCard
            title="Undergraduate"
            value={undergraduateCourses}
            icon={GraduationCap}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Course List
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredCourses.length} course
                  {filteredCourses.length !== 1
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
                    placeholder="Search courses..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <SelectField
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value)
                  }
                  options={courseTypes}
                  placeholder="All Types"
                />

                <SelectField
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
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
                  objectOptions
                />
              </div>
            </div>
          </div>

          <CourseTable
            courses={filteredCourses}
            loading={loading}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        </section>
      </div>

      {modal === "add" && (
        <CourseFormModal
          title="Add Course"
          description="Create a new academic course."
          form={form}
          saving={saving}
          isEdit={false}
          onChange={handleChange}
          onSubmit={handleCreateCourse}
          onClose={closeModal}
        />
      )}

      {modal === "edit" && (
        <CourseFormModal
          title="Edit Course"
          description="Update course information and configuration."
          form={form}
          saving={saving}
          isEdit
          onChange={handleChange}
          onSubmit={handleUpdateCourse}
          onClose={closeModal}
        />
      )}

      {modal === "view" && selectedCourse && (
        <CourseViewModal
          course={selectedCourse}
          onClose={closeModal}
          onEdit={() => {
            closeModal();

            setTimeout(() => {
              openEditModal(selectedCourse);
            }, 0);
          }}
        />
      )}

      {modal === "delete" && selectedCourse && (
        <DeleteModal
          course={selectedCourse}
          saving={saving}
          onClose={closeModal}
          onConfirm={handleDeleteCourse}
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

function CourseTable({
  courses,
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
          Loading courses...
        </div>
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <BookOpen size={25} />
        </div>

        <h3 className="mt-4 font-semibold text-slate-900">
          No courses found
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
        <table className="w-full min-w-[950px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Course
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Code
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Type
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Duration
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
            {courses.map((course) => (
              <tr
                key={course._id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <BookOpen size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {course.courseName}
                      </p>

                      <p className="max-w-60 truncate text-xs text-slate-500">
                        {course.description ||
                          "No description"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {course.courseCode}
                  </span>
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {course.courseType}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock3 size={16} />
                    {course.duration}{" "}
                    {course.durationUnit}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <StatusBadge
                    active={course.isActive}
                  />
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <IconButton
                      icon={Eye}
                      label="View course"
                      onClick={() =>
                        onView(course)
                      }
                    />

                    <IconButton
                      icon={Pencil}
                      label="Edit course"
                      onClick={() =>
                        onEdit(course)
                      }
                    />

                    <IconButton
                      icon={Trash2}
                      label="Delete course"
                      danger
                      onClick={() =>
                        onDelete(course)
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
        {courses.map((course) => (
          <div
            key={course._id}
            className="p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <BookOpen size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {course.courseName}
                  </h3>

                  <StatusBadge
                    active={course.isActive}
                  />
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {course.courseCode} •{" "}
                  {course.courseType}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <MobileInfo
                label="Duration"
                value={`${course.duration} ${course.durationUnit}`}
              />

              <MobileInfo
                label="Type"
                value={course.courseType}
              />
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {course.description ||
                "No description available."}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => onView(course)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700"
              >
                <Eye size={16} />
                View
              </button>

              <button
                type="button"
                onClick={() => onEdit(course)}
                className="flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2.5 text-slate-700"
              >
                <Pencil size={16} />
              </button>

              <button
                type="button"
                onClick={() => onDelete(course)}
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

function CourseFormModal({
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <InputField
              label="Course Name"
              name="courseName"
              value={form.courseName}
              onChange={onChange}
              placeholder="Example: Bachelor of Technology"
              required
            />

            <InputField
              label="Course Code"
              name="courseCode"
              value={form.courseCode}
              onChange={onChange}
              placeholder="Example: BTECH"
              required
            />

            <SelectInput
              label="Course Type"
              name="courseType"
              value={form.courseType}
              onChange={onChange}
              options={courseTypes}
              required
            />

            <div>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Duration
                <span className="ml-1 text-red-500">
                  *
                </span>
              </span>

              <div className="grid grid-cols-[1fr_1fr] gap-3">
                <input
                  type="number"
                  name="duration"
                  min="1"
                  value={form.duration}
                  onChange={onChange}
                  placeholder="4"
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-slate-400"
                />

                <SelectInput
                  label=""
                  name="durationUnit"
                  value={form.durationUnit}
                  onChange={onChange}
                  options={durationUnits}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </span>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  placeholder="Describe the academic course..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400"
                />
              </label>
            </div>

            {isEdit && (
              <div className="lg:col-span-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={(event) =>
                      setFormValue(
                        event,
                        onChange
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Active Course
                    </p>

                    <p className="text-xs text-slate-500">
                      Inactive courses cannot be used for
                      new academic assignments.
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
                : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function CourseViewModal({
  course,
  onClose,
  onEdit,
}) {
  return (
    <Modal onClose={onClose}>
      <div className="max-h-[92vh] overflow-y-auto">
        <ModalHeader
          title="Course Details"
          description="Academic course information."
          onClose={onClose}
        />

        <div className="p-4 sm:p-6">
          <div className="rounded-2xl bg-slate-50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <BookOpen size={25} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    {course.courseName}
                  </h3>

                  <StatusBadge
                    active={course.isActive}
                  />
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {course.courseCode} •{" "}
                  {course.courseType}
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
              icon={HashIcon}
              label="Course Code"
              value={course.courseCode}
            />

            <InfoCard
              icon={GraduationCap}
              label="Course Type"
              value={course.courseType}
            />

            <InfoCard
              icon={Clock3}
              label="Duration"
              value={`${course.duration} ${course.durationUnit}`}
            />

            <InfoCard
              icon={Layers3}
              label="Academic Structure"
              value="Will be configured"
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
                  {course.description ||
                    "No course description available."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StructureCard
              title="Branches"
              value="0"
              description="Configure branches next"
              icon={Layers3}
            />

            <StructureCard
              title="Semesters"
              value="0"
              description="Configure semesters next"
              icon={GraduationCap}
            />

            <StructureCard
              title="Subjects"
              value="0"
              description="Configure subjects next"
              icon={BookOpen}
            />
          </div>
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

function DeleteModal({
  course,
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
          Delete Course
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">
            {course.courseName}
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

            Delete Course
          </button>
        </div>
      </div>
    </Modal>
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
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </span>
      )}

      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm text-slate-800 outline-none focus:border-slate-400"
        >
          <option value="">
            {label ? `Select ${label}` : "Select"}
          </option>

          {options.map((option) => (
            <option
              key={
                typeof option === "object"
                  ? option.value
                  : option
              }
              value={
                typeof option === "object"
                  ? option.value
                  : option
              }
            >
              {typeof option === "object"
                ? option.label
                : option}
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
  objectOptions = false,
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
          <option
            key={
              objectOptions
                ? option.value
                : option
            }
            value={
              objectOptions
                ? option.value
                : option
            }
          >
            {objectOptions
              ? option.label
              : option}
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
  type = "text",
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

function HashIcon({ size = 18, ...props }) {
  return (
    <span {...props}>
      <span className="text-lg">#</span>
    </span>
  );
}

function setFormValue(event, onChange) {
  onChange({
    target: {
      name: event.target.name,
      value: event.target.checked,
      type: "checkbox",
    },
  });
}

export default Courses;