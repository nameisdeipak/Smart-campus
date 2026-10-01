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
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronDown,
  BriefcaseBusiness,
  Building2,
  UserCheck,
  Layers3,
} from "lucide-react";

import toast from "react-hot-toast";
import axiosClient from "../../services/axiosClient";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  facultyId: "",
  employeeId: "",
  dateOfBirth: "",
  gender: "",
  department: "",
  designation: "",
  qualification: "",
  specialization: "",
  joiningDate: "",
  experience: "",
  employmentType: "",
  section: "",
  address: "",
};

const departments = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Management",
  "Mathematics",
  "Physics",
  "Chemistry",
];

const designations = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "HOD",
  "Visiting Faculty",
];

const employmentTypes = [
  "Full Time",
  "Part Time",
  "Contract",
  "Visiting",
];

const genders = [
  "Male",
  "Female",
  "Other",
];

function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("");
  const [designationFilter, setDesignationFilter] =
    useState("");

  const [modal, setModal] = useState(null);
  const [selectedFaculty, setSelectedFaculty] =
    useState(null);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchFaculty = async () => {
    try {
      setLoading(true);

      const response = await axiosClient.get(
        "/admin/faculty/getAllFaculty"
      );

      setFaculty(response.data.faculty || []);
    } catch (error) {
      console.error("FETCH FACULTY ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load faculty"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const filteredFaculty = useMemo(() => {
    const value = search.trim().toLowerCase();

    return faculty.filter((member) => {
      const user = member.userId || {};

      const matchesSearch =
        !value ||
        user.name?.toLowerCase().includes(value) ||
        user.email?.toLowerCase().includes(value) ||
        member.facultyId
          ?.toLowerCase()
          .includes(value) ||
        member.employeeId
          ?.toLowerCase()
          .includes(value) ||
        member.department
          ?.toLowerCase()
          .includes(value) ||
        member.designation
          ?.toLowerCase()
          .includes(value);

      const matchesDepartment =
        !departmentFilter ||
        member.department === departmentFilter;

      const matchesDesignation =
        !designationFilter ||
        member.designation === designationFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesDesignation
      );
    });
  }, [
    faculty,
    search,
    departmentFilter,
    designationFilter,
  ]);

  const openAddModal = () => {
    setForm(initialForm);
    setSelectedFaculty(null);
    setModal("add");
  };

  const openEditModal = (member) => {
    const user = member.userId || {};

    setSelectedFaculty(member);

    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      facultyId: member.facultyId || "",
      employeeId: member.employeeId || "",
      dateOfBirth: formatDateForInput(
        member.dateOfBirth
      ),
      gender: member.gender || "",
      department: member.department || "",
      designation: member.designation || "",
      qualification: member.qualification || "",
      specialization:
        member.specialization || "",
      joiningDate: formatDateForInput(
        member.joiningDate
      ),
      experience:
        member.experience !== undefined
          ? String(member.experience)
          : "",
      employmentType:
        member.employmentType || "",
      section: member.section || "",
      address: member.address || "",
    });

    setModal("edit");
  };

  const openViewModal = (member) => {
    setSelectedFaculty(member);
    setModal("view");
  };

  const openDeleteModal = (member) => {
    setSelectedFaculty(member);
    setModal("delete");
  };

  const closeModal = () => {
    if (saving) return;

    setModal(null);
    setSelectedFaculty(null);
    setForm(initialForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateFaculty = async (event) => {
    event.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.department ||
      !form.designation
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);

      const response = await axiosClient.post(
        "/admin/faculty/createFaculty",
        {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          employeeId: form.employeeId,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          department: form.department,
          designation: form.designation,
          qualification: form.qualification,
          specialization: form.specialization,
          joiningDate: form.joiningDate,
          experience: form.experience,
          employmentType: form.employmentType,
          section: form.section,
          address: form.address,
        }
      );

      toast.success(
        response.data.message ||
          "Faculty created successfully"
      );

      closeModal();
      await fetchFaculty();
    } catch (error) {
      console.error(
        "CREATE FACULTY ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create faculty"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateFaculty = async (event) => {
    event.preventDefault();

    if (!selectedFaculty?._id) return;

    try {
      setSaving(true);

      const response = await axiosClient.put(
        `/admin/faculty/updateFacultyInfo/${selectedFaculty._id}`,
        {
          name: form.name,
          phone: form.phone,
          employeeId: form.employeeId,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          department: form.department,
          designation: form.designation,
          qualification: form.qualification,
          specialization: form.specialization,
          joiningDate: form.joiningDate,
          experience: form.experience,
          employmentType: form.employmentType,
          section: form.section,
          address: form.address,
        }
      );

      toast.success(
        response.data.message ||
          "Faculty updated successfully"
      );

      closeModal();
      await fetchFaculty();
    } catch (error) {
      console.error(
        "UPDATE FACULTY ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update faculty"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaculty = async () => {
    if (!selectedFaculty?._id) return;

    try {
      setSaving(true);

      const response = await axiosClient.delete(
        `/admin/faculty/removeFaculty/${selectedFaculty._id}`
      );

      toast.success(
        response.data.message ||
          "Faculty deleted successfully"
      );

      closeModal();
      await fetchFaculty();
    } catch (error) {
      console.error(
        "DELETE FACULTY ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete faculty"
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
                Faculty
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage faculty profiles, departments,
                professional information and teaching
                assignments.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
            >
              <Plus size={18} />
              Add Faculty
            </button>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Faculty"
            value={faculty.length}
            icon={Users}
          />

          <SummaryCard
            title="Active Faculty"
            value={
              faculty.filter(
                (member) =>
                  member.userId?.isActive !== false
              ).length
            }
            icon={UserCheck}
          />

          <SummaryCard
            title="Departments"
            value={
              new Set(
                faculty.map(
                  (member) => member.department
                )
              ).size
            }
            icon={Building2}
          />

          <SummaryCard
            title="HOD / Senior"
            value={
              faculty.filter((member) =>
                [
                  "HOD",
                  "Professor",
                  "Associate Professor",
                ].includes(member.designation)
              ).length
            }
            icon={Award}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Faculty List
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredFaculty.length} faculty member
                  {filteredFaculty.length !== 1
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
                    placeholder="Search faculty..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <SelectField
                  value={departmentFilter}
                  onChange={(event) =>
                    setDepartmentFilter(
                      event.target.value
                    )
                  }
                  options={departments}
                  placeholder="All Departments"
                />

                <SelectField
                  value={designationFilter}
                  onChange={(event) =>
                    setDesignationFilter(
                      event.target.value
                    )
                  }
                  options={designations}
                  placeholder="All Designations"
                />
              </div>
            </div>
          </div>

          <FacultyTable
            faculty={filteredFaculty}
            loading={loading}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        </section>
      </div>

      {modal === "add" && (
        <FacultyFormModal
          title="Add Faculty"
          description="Create a faculty account and professional profile."
          form={form}
          saving={saving}
          isEdit={false}
          onChange={handleChange}
          onSubmit={handleCreateFaculty}
          onClose={closeModal}
        />
      )}

      {modal === "edit" && (
        <FacultyFormModal
          title="Edit Faculty"
          description="Update faculty profile and professional information."
          form={form}
          saving={saving}
          isEdit
          onChange={handleChange}
          onSubmit={handleUpdateFaculty}
          onClose={closeModal}
        />
      )}

      {modal === "view" && selectedFaculty && (
        <FacultyViewModal
          faculty={selectedFaculty}
          onClose={closeModal}
          onEdit={() => {
            closeModal();

            setTimeout(() => {
              openEditModal(selectedFaculty);
            }, 0);
          }}
        />
      )}

      {modal === "delete" && selectedFaculty && (
        <DeleteModal
          faculty={selectedFaculty}
          saving={saving}
          onClose={closeModal}
          onConfirm={handleDeleteFaculty}
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

function FacultyTable({
  faculty,
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
          Loading faculty...
        </div>
      </div>
    );
  }

  if (!faculty.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <Users size={25} />
        </div>

        <h3 className="mt-4 font-semibold text-slate-900">
          No faculty found
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
                Faculty
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Faculty ID
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Department
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Designation
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
            {faculty.map((member) => {
              const user = member.userId || {};

              return (
                <tr
                  key={member._id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={user.name}
                      />

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {user.name ||
                            "Unnamed Faculty"}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {user.email || "-"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-700">
                      {member.facultyId ||
                        member.employeeId ||
                        "-"}
                    </p>

                    {member.employeeId && (
                      <p className="text-xs text-slate-400">
                        Employee: {member.employeeId}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <p className="max-w-52 truncate font-medium text-slate-700">
                      {member.department || "-"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-700">
                      {member.designation || "-"}
                    </p>

                    <p className="text-xs text-slate-400">
                      {member.qualification || ""}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge
                      active={
                        user.isActive !== false
                      }
                    />
                  </td>

                  <td className="px-5 py-4">
                    <ActionButtons
                      onView={() => onView(member)}
                      onEdit={() => onEdit(member)}
                      onDelete={() =>
                        onDelete(member)
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {faculty.map((member) => {
          const user = member.userId || {};

          return (
            <div
              key={member._id}
              className="p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <Avatar name={user.name} />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {user.name || "Unnamed Faculty"}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {user.email || "-"}
                  </p>

                  <div className="mt-2">
                    <StatusBadge
                      active={
                        user.isActive !== false
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MobileInfo
                  label="Faculty ID"
                  value={
                    member.facultyId ||
                    member.employeeId ||
                    "-"
                  }
                />

                <MobileInfo
                  label="Designation"
                  value={member.designation || "-"}
                />

                <MobileInfo
                  label="Department"
                  value={member.department || "-"}
                />

                <MobileInfo
                  label="Experience"
                  value={
                    member.experience
                      ? `${member.experience} years`
                      : "-"
                  }
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => onView(member)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700"
                >
                  <Eye size={16} />
                  View
                </button>

                <button
                  type="button"
                  onClick={() => onEdit(member)}
                  className="flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2.5 text-slate-700"
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(member)}
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

function FacultyFormModal({
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
                  placeholder="faculty@example.com"
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
                  options={genders}
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
              title="Professional Information"
              icon={BriefcaseBusiness}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  label="Faculty ID"
                  name="facultyId"
                  value={
                    isEdit
                      ? form.facultyId
                      : "Generated automatically"
                  }
                  onChange={() => {}}
                  disabled
                />

                <InputField
                  label="Employee ID"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={onChange}
                  placeholder="Employee ID"
                />

                <SelectInput
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={onChange}
                  options={departments}
                  required
                />

                <SelectInput
                  label="Designation"
                  name="designation"
                  value={form.designation}
                  onChange={onChange}
                  options={designations}
                  required
                />

                <InputField
                  label="Qualification"
                  name="qualification"
                  value={form.qualification}
                  onChange={onChange}
                  placeholder="Example: M.Tech, PhD"
                />

                <InputField
                  label="Specialization"
                  name="specialization"
                  value={form.specialization}
                  onChange={onChange}
                  placeholder="Example: AI / ML"
                />

                <InputField
                  label="Joining Date"
                  name="joiningDate"
                  value={form.joiningDate}
                  onChange={onChange}
                  type="date"
                />

                <InputField
                  label="Experience"
                  name="experience"
                  value={form.experience}
                  onChange={onChange}
                  placeholder="Years of experience"
                  type="number"
                  min="0"
                />

                <SelectInput
                  label="Employment Type"
                  name="employmentType"
                  value={form.employmentType}
                  onChange={onChange}
                  options={employmentTypes}
                />

                <InputField
                  label="Section"
                  name="section"
                  value={form.section}
                  onChange={onChange}
                  placeholder="Example: A"
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
                : "Create Faculty"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function FacultyViewModal({
  faculty,
  onClose,
  onEdit,
}) {
  const user = faculty.userId || {};

  return (
    <Modal onClose={onClose}>
      <div className="max-h-[92vh] overflow-y-auto">
        <ModalHeader
          title="Faculty Profile"
          description="Faculty profile, professional information and teaching overview."
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
                    {user.name || "Unnamed Faculty"}
                  </h3>

                  <StatusBadge
                    active={
                      user.isActive !== false
                    }
                  />
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {faculty.facultyId ||
                    faculty.employeeId ||
                    "-"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {faculty.designation || "-"} •{" "}
                  {faculty.department || "-"}
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

          <section className="mt-6">
            <SectionTitle
              title="Contact & Personal Information"
              icon={UserRound}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              <InfoCard
                icon={UserRound}
                label="Gender"
                value={faculty.gender}
              />

              <InfoCard
                icon={CalendarDays}
                label="Date of Birth"
                value={formatDisplayDate(
                  faculty.dateOfBirth
                )}
              />
            </div>

            <div className="mt-4">
              <InfoCard
                icon={MapPin}
                label="Address"
                value={
                  faculty.address ||
                  "Address not available"
                }
              />
            </div>
          </section>

          <section className="mt-7">
            <SectionTitle
              title="Professional Information"
              icon={BriefcaseBusiness}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard
                icon={Hash}
                label="Faculty ID"
                value={
                  faculty.facultyId ||
                  faculty.employeeId
                }
              />

              <InfoCard
                icon={Building2}
                label="Department"
                value={faculty.department}
              />

              <InfoCard
                icon={GraduationCap}
                label="Designation"
                value={faculty.designation}
              />

              <InfoCard
                icon={Award}
                label="Qualification"
                value={faculty.qualification}
              />

              <InfoCard
                icon={BookOpen}
                label="Specialization"
                value={faculty.specialization}
              />

              <InfoCard
                icon={CalendarDays}
                label="Joining Date"
                value={formatDisplayDate(
                  faculty.joiningDate
                )}
              />

              <InfoCard
                icon={Clock3}
                label="Experience"
                value={
                  faculty.experience
                    ? `${faculty.experience} years`
                    : "-"
                }
              />

              <InfoCard
                icon={UserCheck}
                label="Employment Type"
                value={faculty.employmentType}
              />
            </div>
          </section>

          <FacultyTeachingOverview />

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <Layers3
                size={18}
                className="mt-0.5 shrink-0 text-slate-500"
              />

              <div>
                <p className="font-semibold text-slate-800">
                  Teaching Module Integration
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Courses, subjects, timetable,
                  attendance and student assignments
                  will be connected to this faculty profile
                  through their respective modules.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function FacultyTeachingOverview() {
  const items = [
    {
      label: "Assigned Subjects",
      value: "—",
      icon: BookOpen,
    },
    {
      label: "Assigned Classes",
      value: "—",
      icon: Users,
    },
    {
      label: "Weekly Classes",
      value: "—",
      icon: CalendarDays,
    },
    {
      label: "Teaching Load",
      value: "—",
      icon: Clock3,
    },
  ];

  return (
    <section className="mt-7">
      <SectionTitle
        title="Teaching Overview"
        icon={GraduationCap}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
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
  faculty,
  saving,
  onClose,
  onConfirm,
}) {
  const name =
    faculty.userId?.name || "this faculty member";

  return (
    <Modal onClose={onClose}>
      <div className="p-5 sm:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <AlertTriangle size={23} />
        </div>

        <h3 className="mt-4 text-xl font-bold text-slate-900">
          Delete Faculty
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">
            {name}
          </span>
          ? This will remove the faculty profile and
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

            Delete Faculty
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

        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

function SectionTitle({
  title,
  icon: Icon,
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon size={17} />
      </div>

      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>
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
  disabled = false,
  min,
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
        min={min}
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
    <div className="relative min-w-44">
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

function ActionButtons({
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex justify-end gap-1">
      <IconButton
        icon={Eye}
        label="View faculty"
        onClick={onView}
      />

      <IconButton
        icon={Pencil}
        label="Edit faculty"
        onClick={onEdit}
      />

      <IconButton
        icon={Trash2}
        label="Delete faculty"
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

function Avatar({ name, large = false }) {
  const initial =
    name?.trim()?.charAt(0)?.toUpperCase() || "F";

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

export default Faculty;