import { useEffect, useMemo, useState } from "react";
import {
  Edit,
  Eye,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
  Loader2,
  Mail,
  BriefcaseBusiness,
} from "lucide-react";
import toast from "react-hot-toast";

import axiosClient from "../../services/axiosClient";

const initialForm = {
  studentId: "",

  fatherName: "",
  fatherPhone: "",
  fatherEmail: "",
  fatherOccupation: "",

  motherName: "",
  motherPhone: "",
  motherEmail: "",
  motherOccupation: "",

  guardianName: "",
  guardianPhone: "",
  guardianRelation: "",

  address: "",
  city: "",
  state: "",
  pincode: "",
};

function Parents() {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] =
    useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] =
    useState(false);

  const [editingParent, setEditingParent] =
    useState(null);
  const [viewingParent, setViewingParent] =
    useState(null);

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchParents();
    fetchStudents();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);

      const response = await axiosClient.get(
        "/admin/parents/getAllParents",
      );

      setParents(response.data.parents || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load parents",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);

      const response = await axiosClient.get(
        "/admin/students/getAllStudent",
      );

      setStudents(response.data.students || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load students",
      );
    } finally {
      setStudentsLoading(false);
    }
  };

  const getStudentName = (student) => {
    return (
      student?.userId?.name ||
      student?.name ||
      "Unknown Student"
    );
  };

  const getStudentEmail = (student) => {
    return (
      student?.userId?.email ||
      student?.email ||
      ""
    );
  };

  const getStudentById = (studentId) => {
    return students.find(
      (student) =>
        String(student._id) === String(studentId),
    );
  };

  const filteredParents = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return parents;
    }

    return parents.filter((parent) => {
      const studentName = getStudentName(
        parent.studentId,
      );

      const studentEnrollment =
        parent.studentId?.enrollmentNumber || "";

      return (
        parent.fatherName
          ?.toLowerCase()
          .includes(query) ||
        parent.motherName
          ?.toLowerCase()
          .includes(query) ||
        parent.fatherPhone
          ?.toLowerCase()
          .includes(query) ||
        parent.motherPhone
          ?.toLowerCase()
          .includes(query) ||
        studentName
          ?.toLowerCase()
          .includes(query) ||
        studentEnrollment
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [parents, search]);

  const openCreateModal = () => {
    setEditingParent(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (parent) => {
    setEditingParent(parent);

    setForm({
      studentId:
        parent.studentId?._id ||
        parent.studentId ||
        "",

      fatherName: parent.fatherName || "",
      fatherPhone: parent.fatherPhone || "",
      fatherEmail: parent.fatherEmail || "",
      fatherOccupation:
        parent.fatherOccupation || "",

      motherName: parent.motherName || "",
      motherPhone: parent.motherPhone || "",
      motherEmail: parent.motherEmail || "",
      motherOccupation:
        parent.motherOccupation || "",

      guardianName: parent.guardianName || "",
      guardianPhone: parent.guardianPhone || "",
      guardianRelation:
        parent.guardianRelation || "",

      address: parent.address || "",
      city: parent.city || "",
      state: parent.state || "",
      pincode: parent.pincode || "",
    });

    setShowModal(true);
  };

  const openViewModal = (parent) => {
    setViewingParent(parent);
    setShowViewModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingParent(null);
    setForm(initialForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.studentId) {
      toast.error("Please select a student");
      return;
    }

    if (
      !form.fatherName.trim() ||
      !form.fatherPhone.trim() ||
      !form.motherName.trim() ||
      !form.motherPhone.trim()
    ) {
      toast.error(
        "Father and mother basic details are required",
      );
      return;
    }

    try {
      setSubmitting(true);

      if (editingParent) {
        const response = await axiosClient.put(
          `/admin/parents/updateParent/${editingParent._id}`,
          form,
        );

        toast.success(
          response.data.message ||
            "Parent details updated successfully",
        );
      } else {
        const response = await axiosClient.post(
          "/admin/parents/createParent",
          form,
        );

        toast.success(
          response.data.message ||
            "Parent details created successfully",
        );
      }

      closeModal();
      await fetchParents();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save parent details",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (parent) => {
    const studentName = getStudentName(
      parent.studentId,
    );

    const confirmed = window.confirm(
      `Delete parent details for ${studentName}?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(parent._id);

      const response = await axiosClient.delete(
        `/admin/parents/deleteParent/${parent._id}`,
      );

      toast.success(
        response.data.message ||
          "Parent details deleted successfully",
      );

      await fetchParents();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete parent details",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getParentStudent = (parent) => {
    if (
      parent.studentId &&
      typeof parent.studentId === "object"
    ) {
      return parent.studentId;
    }

    return getStudentById(parent.studentId);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users size={24} />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Parents
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage student parent and guardian
                  information
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus size={18} />
              Add Parent
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Parents"
            value={parents.length}
            icon={Users}
          />

          <StatCard
            title="With Guardian"
            value={
              parents.filter(
                (parent) =>
                  parent.guardianName?.trim(),
              ).length
            }
            icon={UserRound}
          />

          <StatCard
            title="With Email"
            value={
              parents.filter(
                (parent) =>
                  parent.fatherEmail?.trim() ||
                  parent.motherEmail?.trim(),
              ).length
            }
            icon={Mail}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Parent Records
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View and manage parent information
              </p>
            </div>

            <div className="relative w-full lg:w-80">
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
                placeholder="Search parent or student..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2
                size={28}
                className="animate-spin text-indigo-600"
              />
            </div>
          ) : filteredParents.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Users
                size={42}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-700">
                No parent records found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add parent details for a student to see
                them here.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Student
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Father
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Mother
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Contact
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Location
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredParents.map((parent) => {
                      const student =
                        getParentStudent(parent);

                      return (
                        <tr
                          key={parent._id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                <UserRound size={18} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {getStudentName(
                                    student,
                                  )}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                  {student?.enrollmentNumber ||
                                    student?.rollNumber ||
                                    getStudentEmail(
                                      student,
                                    )}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {parent.fatherName}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {parent.fatherOccupation ||
                                  "Occupation not added"}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {parent.motherName}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {parent.motherOccupation ||
                                  "Occupation not added"}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Phone size={13} />
                                {parent.fatherPhone}
                              </div>

                              {parent.motherPhone && (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <Phone size={13} />
                                  {parent.motherPhone}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <MapPin size={14} />

                              <span>
                                {[
                                  parent.city,
                                  parent.state,
                                ]
                                  .filter(Boolean)
                                  .join(", ") ||
                                  "Not added"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <ActionButton
                                title="View"
                                onClick={() =>
                                  openViewModal(
                                    parent,
                                  )
                                }
                              >
                                <Eye size={16} />
                              </ActionButton>

                              <ActionButton
                                title="Edit"
                                onClick={() =>
                                  openEditModal(
                                    parent,
                                  )
                                }
                              >
                                <Edit size={16} />
                              </ActionButton>

                              <ActionButton
                                title="Delete"
                                danger
                                loading={
                                  deletingId ===
                                  parent._id
                                }
                                onClick={() =>
                                  handleDelete(
                                    parent,
                                  )
                                }
                              >
                                <Trash2 size={16} />
                              </ActionButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredParents.map((parent) => {
                  const student =
                    getParentStudent(parent);

                  return (
                    <div
                      key={parent._id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                          <UserRound size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900">
                            {getStudentName(student)}
                          </p>

                          <p className="text-xs text-slate-500">
                            {student?.enrollmentNumber ||
                              student?.rollNumber ||
                              "Student"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InfoItem
                          label="Father"
                          value={
                            parent.fatherName
                          }
                        />

                        <InfoItem
                          label="Mother"
                          value={
                            parent.motherName
                          }
                        />

                        <InfoItem
                          label="Father Phone"
                          value={
                            parent.fatherPhone
                          }
                        />

                        <InfoItem
                          label="Mother Phone"
                          value={
                            parent.motherPhone
                          }
                        />
                      </div>

                      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                        <ActionButton
                          title="View"
                          className="flex-1"
                          onClick={() =>
                            openViewModal(
                              parent,
                            )
                          }
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </ActionButton>

                        <ActionButton
                          title="Edit"
                          className="flex-1"
                          onClick={() =>
                            openEditModal(
                              parent,
                            )
                          }
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </ActionButton>

                        <ActionButton
                          title="Delete"
                          danger
                          className="flex-1"
                          loading={
                            deletingId ===
                            parent._id
                          }
                          onClick={() =>
                            handleDelete(parent)
                          }
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </ActionButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <ParentFormModal
          form={form}
          students={students}
          studentsLoading={studentsLoading}
          editingParent={editingParent}
          submitting={submitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={closeModal}
          getStudentName={getStudentName}
          getStudentEmail={getStudentEmail}
        />
      )}

      {showViewModal && viewingParent && (
        <ParentViewModal
          parent={viewingParent}
          onClose={() => {
            setShowViewModal(false);
            setViewingParent(null);
          }}
          getStudentName={getStudentName}
          getStudentEmail={getStudentEmail}
        />
      )}
    </div>
  );
}

function ParentFormModal({
  form,
  students,
  studentsLoading,
  editingParent,
  submitting,
  onChange,
  onSubmit,
  onClose,
  getStudentName,
  getStudentEmail,
}) {
  return (
    <ModalShell
      title={
        editingParent
          ? "Edit Parent Details"
          : "Add Parent Details"
      }
      description={
        editingParent
          ? "Update parent information for the student"
          : "Add father, mother and guardian information"
      }
      onClose={onClose}
    >
      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          {/* Student */}
          <FormSection
            title="Student Information"
            icon={UserRound}
          >
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Student *
              </label>

              <select
                name="studentId"
                value={form.studentId}
                onChange={onChange}
                disabled={
                  studentsLoading ||
                  Boolean(editingParent)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 disabled:bg-slate-100"
                required
              >
                <option value="">
                  {studentsLoading
                    ? "Loading students..."
                    : "Select Student"}
                </option>

                {students.map((student) => (
                  <option
                    key={student._id}
                    value={student._id}
                  >
                    {getStudentName(student)}
                    {student.enrollmentNumber
                      ? ` - ${student.enrollmentNumber}`
                      : getStudentEmail(
                            student,
                          )
                        ? ` - ${getStudentEmail(
                            student,
                          )}`
                        : ""}
                  </option>
                ))}
              </select>
            </div>
          </FormSection>

          {/* Father */}
          <FormSection
            title="Father Information"
            icon={UserRound}
          >
            <InputField
              label="Father Name"
              name="fatherName"
              value={form.fatherName}
              onChange={onChange}
              required
            />

            <InputField
              label="Phone"
              name="fatherPhone"
              value={form.fatherPhone}
              onChange={onChange}
              required
            />

            <InputField
              label="Email"
              name="fatherEmail"
              type="email"
              value={form.fatherEmail}
              onChange={onChange}
            />

            <InputField
              label="Occupation"
              name="fatherOccupation"
              value={form.fatherOccupation}
              onChange={onChange}
            />
          </FormSection>

          {/* Mother */}
          <FormSection
            title="Mother Information"
            icon={UserRound}
          >
            <InputField
              label="Mother Name"
              name="motherName"
              value={form.motherName}
              onChange={onChange}
              required
            />

            <InputField
              label="Phone"
              name="motherPhone"
              value={form.motherPhone}
              onChange={onChange}
              required
            />

            <InputField
              label="Email"
              name="motherEmail"
              type="email"
              value={form.motherEmail}
              onChange={onChange}
            />

            <InputField
              label="Occupation"
              name="motherOccupation"
              value={form.motherOccupation}
              onChange={onChange}
            />
          </FormSection>

          {/* Guardian */}
          <FormSection
            title="Guardian Information"
            icon={BriefcaseBusiness}
            optional
          >
            <InputField
              label="Guardian Name"
              name="guardianName"
              value={form.guardianName}
              onChange={onChange}
            />

            <InputField
              label="Guardian Phone"
              name="guardianPhone"
              value={form.guardianPhone}
              onChange={onChange}
            />

            <InputField
              label="Relation"
              name="guardianRelation"
              value={form.guardianRelation}
              onChange={onChange}
            />
          </FormSection>

          {/* Address */}
          <FormSection
            title="Address"
            icon={MapPin}
          >
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Address
              </label>

              <textarea
                name="address"
                value={form.address}
                onChange={onChange}
                rows={3}
                placeholder="Enter complete address"
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <InputField
              label="City"
              name="city"
              value={form.city}
              onChange={onChange}
            />

            <InputField
              label="State"
              name="state"
              value={form.state}
              onChange={onChange}
            />

            <InputField
              label="Pincode"
              name="pincode"
              value={form.pincode}
              onChange={onChange}
            />
          </FormSection>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {submitting
              ? "Saving..."
              : editingParent
                ? "Update Parent"
                : "Save Parent"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ParentViewModal({
  parent,
  onClose,
  getStudentName,
  getStudentEmail,
}) {
  const student = parent.studentId;

  return (
    <ModalShell
      title="Parent Details"
      description="Complete parent information"
      onClose={onClose}
    >
      <div className="space-y-6">
        <div className="rounded-xl bg-indigo-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white">
              <UserRound size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {getStudentName(student)}
              </p>

              <p className="text-xs text-slate-500">
                {student?.enrollmentNumber ||
                  student?.rollNumber ||
                  getStudentEmail(student)}
              </p>
            </div>
          </div>
        </div>

        <ViewSection title="Father Information">
          <ViewItem
            label="Name"
            value={parent.fatherName}
          />

          <ViewItem
            label="Phone"
            value={parent.fatherPhone}
          />

          <ViewItem
            label="Email"
            value={parent.fatherEmail}
          />

          <ViewItem
            label="Occupation"
            value={parent.fatherOccupation}
          />
        </ViewSection>

        <ViewSection title="Mother Information">
          <ViewItem
            label="Name"
            value={parent.motherName}
          />

          <ViewItem
            label="Phone"
            value={parent.motherPhone}
          />

          <ViewItem
            label="Email"
            value={parent.motherEmail}
          />

          <ViewItem
            label="Occupation"
            value={parent.motherOccupation}
          />
        </ViewSection>

        {(parent.guardianName ||
          parent.guardianPhone ||
          parent.guardianRelation) && (
          <ViewSection title="Guardian Information">
            <ViewItem
              label="Name"
              value={parent.guardianName}
            />

            <ViewItem
              label="Phone"
              value={parent.guardianPhone}
            />

            <ViewItem
              label="Relation"
              value={parent.guardianRelation}
            />
          </ViewSection>
        )}

        <ViewSection title="Address">
          <ViewItem
            label="Address"
            value={parent.address}
            full
          />

          <ViewItem
            label="City"
            value={parent.city}
          />

          <ViewItem
            label="State"
            value={parent.state}
          />

          <ViewItem
            label="Pincode"
            value={parent.pincode}
          />
        </ViewSection>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  title,
  description,
  onClose,
  children,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function FormSection({
  title,
  icon: Icon,
  children,
  optional,
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Icon
          size={18}
          className="text-indigo-600"
        />

        <h3 className="text-sm font-semibold text-slate-900">
          {title}
        </h3>

        {optional && (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
            Optional
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  title,
  onClick,
  danger = false,
  loading = false,
  className = "",
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-slate-200 text-slate-600 hover:bg-slate-50"
      } ${className}`}
    >
      {loading ? (
        <Loader2
          size={16}
          className="animate-spin"
        />
      ) : (
        children
      )}
    </button>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-700">
        {value || "Not added"}
      </p>
    </div>
  );
}

function ViewSection({
  title,
  children,
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function ViewItem({
  label,
  value,
  full = false,
}) {
  return (
    <div
      className={
        full ? "sm:col-span-2" : ""
      }
    >
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-700">
        {value || "Not added"}
      </p>
    </div>
  );
}

export default Parents;