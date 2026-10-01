import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Building2,
  ChevronDown,
  Edit,
  GraduationCap,
  Layers3,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  Eye,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import axiosClient from "../../services/axiosClient";

const initialCourseForm = {
  courseCode: "",
  courseName: "",
  courseType: "Undergraduate",
  duration: "",
  durationUnit: "Years",
  description: "",
  isActive: true,
};

const initialBranchForm = {
  courseId: "",
  branchCode: "",
  branchName: "",
  hod: "",
  description: "",
  isActive: true,
};

const initialSemesterForm = {
  courseId: "",
  branchId: "",
  semesterNumber: "",
  semesterName: "",
  isActive: true,
};

const initialSubjectForm = {
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
  facultyId: "",
  section: "",
  academicYear: "",
};

function AcademicStructure() {
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [subjectTypeFilter, setSubjectTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modal, setModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [branchForm, setBranchForm] = useState(initialBranchForm);
  const [semesterForm, setSemesterForm] =
    useState(initialSemesterForm);
  const [subjectForm, setSubjectForm] =
    useState(initialSubjectForm);

  const [deleteInfo, setDeleteInfo] = useState(null);

  const [assignments, setAssignments] = useState([]);
const [assignmentLoading, setAssignmentLoading] =
  useState(false);

const [assignmentModal, setAssignmentModal] =
  useState(false);

const [editingAssignment, setEditingAssignment] =
  useState(null);

const [assignmentForm, setAssignmentForm] = useState({
  facultyId: "",
  section: "",
  academicYear: "",
});

const fetchSubjectAssignments = async (subjectId) => {
  if (!subjectId) {
    setAssignments([]);
    return;
  }

  try {
    setAssignmentLoading(true);

    const response = await axiosClient.get(
      `/admin/subject-faculty/subject/${subjectId}`,
    );

    setAssignments(
      response.data?.assignments || [],
    );
  } catch (error) {
    console.error(error);

    toast.error(
      error.response?.data?.message ||
        "Failed to load faculty assignments",
    );

    setAssignments([]);
  } finally {
    setAssignmentLoading(false);
  }
};

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [
        coursesResponse,
        branchesResponse,
        semestersResponse,
        subjectsResponse,
        facultyResponse,
      ] = await Promise.all([
        axiosClient.get("/admin/courses/getAllCourses"),
        axiosClient.get("/admin/branches/getAllBranches"),
        axiosClient.get("/admin/semesters/getAllSemesters"),
        axiosClient.get("/admin/subjects/getAllSubjects"),
        axiosClient.get("/admin/faculty/getAllFaculty"),
      ]);

      setCourses(coursesResponse.data?.courses || []);
      setBranches(branchesResponse.data?.branches || []);
      setSemesters(semestersResponse.data?.semesters || []);
      setSubjects(subjectsResponse.data?.subjects || []);
      setFaculty(facultyResponse.data?.faculty || []);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to load academic structure",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const activeFaculty = useMemo(() => {
    return faculty.filter(
      (member) => member.userId?.isActive !== false,
    );
  }, [faculty]);

  const filteredBranches = useMemo(() => {
    if (!selectedCourse) return [];

    return branches.filter((branch) => {
      const courseId =
        branch.courseId?._id || branch.courseId;

      return String(courseId) === String(selectedCourse);
    });
  }, [branches, selectedCourse]);

  const filteredSemesters = useMemo(() => {
    if (!selectedBranch) return [];

    return semesters.filter((semester) => {
      const branchId =
        semester.branchId?._id || semester.branchId;

      return String(branchId) === String(selectedBranch);
    });
  }, [semesters, selectedBranch]);

  const filteredSubjects = useMemo(() => {
    let result = subjects;

    if (selectedSemester) {
      result = result.filter((subject) => {
        const semesterId =
          subject.semesterId?._id || subject.semesterId;

        return String(semesterId) === String(selectedSemester);
      });
    } else {
      result = [];
    }

    if (search.trim()) {
      const value = search.toLowerCase();

      result = result.filter(
        (subject) =>
          subject.subjectName
            ?.toLowerCase()
            .includes(value) ||
          subject.subjectCode
            ?.toLowerCase()
            .includes(value),
      );
    }

    if (subjectTypeFilter !== "All") {
      result = result.filter(
        (subject) =>
          subject.subjectType === subjectTypeFilter,
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((subject) =>
        statusFilter === "Active"
          ? subject.isActive !== false
          : subject.isActive === false,
      );
    }

    return result;
  }, [
    subjects,
    selectedSemester,
    search,
    subjectTypeFilter,
    statusFilter,
  ]);

  const totalCredits = useMemo(() => {
    return filteredSubjects.reduce(
      (sum, subject) =>
        sum + Number(subject.credits || 0),
      0,
    );
  }, [filteredSubjects]);

  const openCourseCreate = () => {
    setEditingItem(null);
    setCourseForm(initialCourseForm);
    setModal("course");
  };

  const openCourseEdit = (course) => {
    setEditingItem(course);

    setCourseForm({
      courseCode: course.courseCode || "",
      courseName: course.courseName || "",
      courseType:
        course.courseType || "Undergraduate",
      duration: course.duration || "",
      durationUnit:
        course.durationUnit || "Years",
      description: course.description || "",
      isActive: course.isActive !== false,
    });

    setModal("course");
  };

  const openBranchCreate = () => {
    setEditingItem(null);

    setBranchForm({
      ...initialBranchForm,
      courseId: selectedCourse || "",
    });

    setModal("branch");
  };

  const openBranchEdit = (branch) => {
    setEditingItem(branch);

    setBranchForm({
      courseId:
        branch.courseId?._id ||
        branch.courseId ||
        "",
      branchCode: branch.branchCode || "",
      branchName: branch.branchName || "",
      hod: branch.hod?._id || branch.hod || "",
      description: branch.description || "",
      isActive: branch.isActive !== false,
    });

    setModal("branch");
  };

  const openSemesterCreate = () => {
    setEditingItem(null);

    setSemesterForm({
      ...initialSemesterForm,
      courseId: selectedCourse || "",
      branchId: selectedBranch || "",
    });

    setModal("semester");
  };

  const openSemesterEdit = (semester) => {
    setEditingItem(semester);

    setSemesterForm({
      courseId:
        semester.courseId?._id ||
        semester.courseId ||
        "",
      branchId:
        semester.branchId?._id ||
        semester.branchId ||
        "",
      semesterNumber:
        semester.semesterNumber || "",
      semesterName:
        semester.semesterName || "",
      isActive: semester.isActive !== false,
    });

    setModal("semester");
  };

  const openSubjectCreate = () => {
    if (!selectedCourse) {
      toast.error("Select a course first");
      return;
    }

    if (!selectedBranch) {
      toast.error("Select a branch first");
      return;
    }

    if (!selectedSemester) {
      toast.error("Select a semester first");
      return;
    }

    setAssignments([]);
    setEditingItem(null);

    setSubjectForm({
      ...initialSubjectForm,
      courseId: selectedCourse,
      branchId: selectedBranch,
      semesterId: selectedSemester,
    });

    setModal("subject");
  };

  const openSubjectEdit = (subject) => {
    setEditingItem(subject);

    setSubjectForm({
      courseId:
        subject.courseId?._id ||
        subject.courseId ||
        "",
      branchId:
        subject.branchId?._id ||
        subject.branchId ||
        "",
      semesterId:
        subject.semesterId?._id ||
        subject.semesterId ||
        "",
      subjectCode: subject.subjectCode || "",
      subjectName: subject.subjectName || "",
      subjectType:
        subject.subjectType || "Core",
      credits: subject.credits ?? "",
      maxMarks: subject.maxMarks ?? "",
      passingMarks: subject.passingMarks ?? "",
      isActive: subject.isActive !== false,
      facultyId: "",
      section: "",
      academicYear: "",
    });

    setModal("subject");
    fetchSubjectAssignments(subject._id);
  };

  const closeModal = () => {
    setModal(null);
    setEditingItem(null);
  };

  const submitCourse = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...courseForm,
        duration: Number(courseForm.duration),
      };

      if (editingItem) {
        await axiosClient.put(
          `/admin/courses/updateCourse/${editingItem._id}`,
          payload,
        );

        toast.success("Course updated successfully");
      } else {
        await axiosClient.post(
          "/admin/courses/createCourse",
          payload,
        );

        toast.success("Course created successfully");
      }

      closeModal();
      await fetchAllData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save course",
      );
    }
  };

  const submitBranch = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        courseId: branchForm.courseId,
        branchCode: branchForm.branchCode,
        branchName: branchForm.branchName,
        hod: branchForm.hod || null,
        description: branchForm.description,
        isActive: branchForm.isActive,
      };

      if (editingItem) {
        await axiosClient.put(
          `/admin/branches/updateBranch/${editingItem._id}`,
          payload,
        );

        toast.success("Branch updated successfully");
      } else {
        await axiosClient.post(
          "/admin/branches/createBranch",
          payload,
        );

        toast.success("Branch created successfully");
      }

      closeModal();
      await fetchAllData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save branch",
      );
    }
  };

  const submitSemester = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        courseId: semesterForm.courseId,
        branchId: semesterForm.branchId,
        semesterNumber: Number(
          semesterForm.semesterNumber,
        ),
        semesterName: semesterForm.semesterName,
        isActive: semesterForm.isActive,
      };

      if (editingItem) {
        await axiosClient.put(
          `/admin/semesters/updateSemester/${editingItem._id}`,
          payload,
        );

        toast.success("Semester updated successfully");
      } else {
        await axiosClient.post(
          "/admin/semesters/createSemester",
          payload,
        );

        toast.success("Semester created successfully");
      }

      closeModal();
      await fetchAllData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save semester",
      );
    }
  };

  const createFacultyAssignment = async (subjectId) => {
  if (
    !subjectForm.facultyId ||
    !subjectForm.section ||
    !subjectForm.academicYear
  ) {
    return;
  }

  await axiosClient.post(
    "/admin/subject-faculty/createAssignment",
    {
      subjectId,
      facultyId: subjectForm.facultyId,
      section: subjectForm.section,
      academicYear: subjectForm.academicYear,
    },
  );
};

const submitAssignment = async (event) => {
  event.preventDefault();

  if (!editingItem) return;

  try {
    const payload = {
      subjectId: editingItem._id,
      facultyId: assignmentForm.facultyId,
      section: assignmentForm.section,
      academicYear:
        assignmentForm.academicYear,
    };

    if (editingAssignment) {
      await axiosClient.put(
        `/admin/subject-faculty/updateAssignment/${editingAssignment._id}`,
        payload,
      );

      toast.success(
        "Faculty assignment updated successfully",
      );
    } else {
      await axiosClient.post(
        "/admin/subject-faculty/createAssignment",
        payload,
      );

      toast.success(
        "Faculty assigned successfully",
      );
    }

    setAssignmentModal(false);
    setEditingAssignment(null);

    setAssignmentForm({
      facultyId: "",
      section: "",
      academicYear: "",
    });

    await fetchSubjectAssignments(
      editingItem._id,
    );
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Failed to save faculty assignment",
    );
  }
};

const openAssignmentEdit = (assignment) => {
  setEditingAssignment(assignment);

  setAssignmentForm({
    facultyId:
      assignment.facultyId?._id ||
      assignment.facultyId ||
      "",
    section: assignment.section || "",
    academicYear:
      assignment.academicYear || "",
  });

  setAssignmentModal(true);
};

const deleteAssignment = async (assignment) => {
  const confirmed = window.confirm(
    `Remove ${getFacultyName(
      assignment.facultyId,
    )} from Section ${assignment.section}?`,
  );

  if (!confirmed) return;

  try {
    await axiosClient.delete(
      `/admin/subject-faculty/deleteAssignment/${assignment._id}`,
    );

    toast.success(
      "Faculty assignment removed",
    );

    if (editingItem) {
      await fetchSubjectAssignments(
        editingItem._id,
      );
    }
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Failed to remove assignment",
    );
  }
};

  const submitSubject = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        courseId: subjectForm.courseId,
        branchId: subjectForm.branchId,
        semesterId: subjectForm.semesterId,
        subjectCode: subjectForm.subjectCode,
        subjectName: subjectForm.subjectName,
        subjectType: subjectForm.subjectType,
        credits: Number(subjectForm.credits),
        maxMarks: Number(subjectForm.maxMarks),
        passingMarks: Number(subjectForm.passingMarks),
        isActive: subjectForm.isActive,
      };

      let subjectId;

      if (editingItem) {
        const response = await axiosClient.put(
          `/admin/subjects/updateSubject/${editingItem._id}`,
          payload,
        );

        subjectId =
          response.data?.subject?._id ||
          response.data?.updatedSubject?._id ||
          editingItem._id;

        toast.success("Subject updated successfully");
      } else {
        const response = await axiosClient.post(
          "/admin/subjects/createSubject",
          payload,
        );

        subjectId =
          response.data?.subject?._id ||
          response.data?.createdSubject?._id ||
          response.data?.data?._id;

        if (!subjectId) {
          const subjectsResponse = await axiosClient.get(
            "/admin/subjects/getAllSubjects",
          );

          const createdSubject =
            (subjectsResponse.data?.subjects || []).find(
              (subject) =>
                subject.subjectCode ===
                  subjectForm.subjectCode.toUpperCase() &&
                String(
                  subject.semesterId?._id ||
                    subject.semesterId,
                ) === String(subjectForm.semesterId),
            );

          subjectId = createdSubject?._id;
        }

        toast.success("Subject created successfully");
      }

      if (
        !editingItem &&
        subjectId &&
        subjectForm.facultyId &&
        subjectForm.section &&
        subjectForm.academicYear
      ) {
        try {
          await createFacultyAssignment(subjectId);
          toast.success("Faculty assigned successfully");
        } catch (assignmentError) {
          console.error("Faculty Assignment Error:", assignmentError);
          toast.error(
            assignmentError.response?.data?.message ||
              "Subject saved but faculty assignment failed",
          );
        }
      }

      closeModal();
      setAssignments([]);
      await fetchAllData();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to save subject",
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteInfo) return;

    try {
      const { type, item } = deleteInfo;

      let endpoint = "";

      if (type === "course") {
        endpoint = `/admin/courses/deleteCourse/${item._id}`;
      }

      if (type === "branch") {
        endpoint = `/admin/branches/deleteBranch/${item._id}`;
      }

      if (type === "semester") {
        endpoint = `/admin/semesters/deleteSemester/${item._id}`;
      }

      if (type === "subject") {
        endpoint = `/admin/subjects/deleteSubject/${item._id}`;
      }

      await axiosClient.delete(endpoint);

      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`,
      );

      setDeleteInfo(null);

      if (type === "course") {
        setSelectedCourse("");
        setSelectedBranch("");
        setSelectedSemester("");
      }

      if (type === "branch") {
        setSelectedBranch("");
        setSelectedSemester("");
      }

      if (type === "semester") {
        setSelectedSemester("");
      }

      await fetchAllData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Delete failed. This record may have dependent data.",
      );
    }
  };

  const handleCourseChange = (value) => {
    setSelectedCourse(value);
    setSelectedBranch("");
    setSelectedSemester("");
  };

  const handleBranchChange = (value) => {
    setSelectedBranch(value);
    setSelectedSemester("");
  };

  const getFacultyName = (facultyMember) => {
    if (!facultyMember) return "Not Assigned";

    return (
      facultyMember.userId?.name ||
      facultyMember.name ||
      facultyMember.facultyId ||
      facultyMember.employeeId ||
      "Faculty"
    );
  };

  const getCourseName = (courseId) => {
    const course =
      courses.find(
        (item) =>
          String(item._id) === String(courseId),
      );

    return course?.courseName || "Unknown Course";
  };

  const getBranchName = (branchId) => {
    const branch =
      branches.find(
        (item) =>
          String(item._id) === String(branchId),
      );

    return branch?.branchName || "Unknown Branch";
  };

  const getSemesterName = (semesterId) => {
    const semester =
      semesters.find(
        (item) =>
          String(item._id) === String(semesterId),
      );

    return (
      semester?.semesterName ||
      "Unknown Semester"
    );
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-600 p-3 text-white shadow-sm">
                <GraduationCap size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Academic Structure
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage courses, branches, semesters,
                  subjects and academic configuration.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={openCourseCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus size={17} />
              Add Course
            </button>

            <button
              onClick={openBranchCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Plus size={17} />
              Add Branch
            </button>

            <button
              onClick={openSemesterCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Plus size={17} />
              Add Semester
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Courses"
            value={courses.length}
            icon={<GraduationCap size={21} />}
          />

          <StatCard
            title="Branches"
            value={branches.length}
            icon={<Building2 size={21} />}
          />

          <StatCard
            title="Semesters"
            value={semesters.length}
            icon={<Layers3 size={21} />}
          />

          <StatCard
            title="Subjects"
            value={subjects.length}
            icon={<BookOpen size={21} />}
          />
        </div>

        {/* Academic Explorer */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Academic Explorer
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select the academic hierarchy to manage
                subjects.
              </p>
            </div>

            <button
              onClick={fetchAllData}
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <SelectField
              label="Course"
              value={selectedCourse}
              onChange={(event) =>
                handleCourseChange(event.target.value)
              }
            >
              <option value="">Select Course</option>

              {courses.map((course) => (
                <option
                  key={course._id}
                  value={course._id}
                >
                  {course.courseCode} -{" "}
                  {course.courseName}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Branch"
              value={selectedBranch}
              disabled={!selectedCourse}
              onChange={(event) =>
                handleBranchChange(event.target.value)
              }
            >
              <option value="">
                {selectedCourse
                  ? "Select Branch"
                  : "Select Course First"}
              </option>

              {filteredBranches.map((branch) => (
                <option
                  key={branch._id}
                  value={branch._id}
                >
                  {branch.branchCode} -{" "}
                  {branch.branchName}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Semester"
              value={selectedSemester}
              disabled={!selectedBranch}
              onChange={(event) =>
                setSelectedSemester(
                  event.target.value,
                )
              }
            >
              <option value="">
                {selectedBranch
                  ? "Select Semester"
                  : "Select Branch First"}
              </option>

              {filteredSemesters.map((semester) => (
                <option
                  key={semester._id}
                  value={semester._id}
                >
                  Semester {semester.semesterNumber} -{" "}
                  {semester.semesterName}
                </option>
              ))}
            </SelectField>
          </div>
        </section>

        {/* Selected hierarchy management */}
        {selectedCourse && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Structure Management
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage the selected academic hierarchy.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const course = courses.find(
                      (item) =>
                        String(item._id) ===
                        String(selectedCourse),
                    );

                    if (course) {
                      openCourseEdit(course);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Edit size={15} />
                  Edit Course
                </button>

                <button
                  onClick={() => {
                    const course = courses.find(
                      (item) =>
                        String(item._id) ===
                        String(selectedCourse),
                    );

                    if (course) {
                      setDeleteInfo({
                        type: "course",
                        item: course,
                      });
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={15} />
                  Delete Course
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <StructureCard
                title="Branches"
                icon={<Building2 size={19} />}
                count={filteredBranches.length}
                buttonText="Add Branch"
                onAdd={openBranchCreate}
              >
                {filteredBranches.length === 0 ? (
                  <EmptySmall
                    text="No branches available for this course."
                  />
                ) : (
                  <div className="space-y-2">
                    {filteredBranches.map((branch) => (
                      <div
                        key={branch._id}
                        className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${
                          String(selectedBranch) ===
                          String(branch._id)
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-slate-200"
                        }`}
                      >
                        <button
                          onClick={() =>
                            handleBranchChange(
                              branch._id,
                            )
                          }
                          className="min-w-0 text-left"
                        >
                          <p className="font-semibold text-slate-900">
                            {branch.branchCode} -{" "}
                            {branch.branchName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            HOD:{" "}
                            {getFacultyName(branch.hod)}
                          </p>
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              openBranchEdit(branch)
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-white"
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            onClick={() =>
                              setDeleteInfo({
                                type: "branch",
                                item: branch,
                              })
                            }
                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </StructureCard>

              <StructureCard
                title="Semesters"
                icon={<Layers3 size={19} />}
                count={filteredSemesters.length}
                buttonText="Add Semester"
                onAdd={openSemesterCreate}
              >
                {!selectedBranch ? (
                  <EmptySmall text="Select a branch to view semesters." />
                ) : filteredSemesters.length === 0 ? (
                  <EmptySmall text="No semesters available for this branch." />
                ) : (
                  <div className="space-y-2">
                    {filteredSemesters.map(
                      (semester) => (
                        <div
                          key={semester._id}
                          className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${
                            String(
                              selectedSemester,
                            ) ===
                            String(semester._id)
                              ? "border-indigo-300 bg-indigo-50"
                              : "border-slate-200"
                          }`}
                        >
                          <button
                            onClick={() =>
                              setSelectedSemester(
                                semester._id,
                              )
                            }
                            className="text-left"
                          >
                            <p className="font-semibold text-slate-900">
                              Semester{" "}
                              {
                                semester.semesterNumber
                              }{" "}
                              -{" "}
                              {semester.semesterName}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {subjects.filter(
                                (subject) =>
                                  String(
                                    subject.semesterId?._id ||
                                      subject.semesterId,
                                  ) ===
                                  String(
                                    semester._id,
                                  ),
                              ).length}{" "}
                              subjects
                            </p>
                          </button>

                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                openSemesterEdit(
                                  semester,
                                )
                              }
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-white"
                            >
                              <Edit size={15} />
                            </button>

                            <button
                              onClick={() =>
                                setDeleteInfo({
                                  type: "semester",
                                  item: semester,
                                })
                              }
                              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </StructureCard>
            </div>
          </section>
        )}

        {/* Subject Management */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen
                    size={20}
                    className="text-indigo-600"
                  />

                  <h2 className="text-lg font-bold text-slate-900">
                    Subject Management
                  </h2>
                </div>

                {selectedSemester && (
                  <p className="mt-1 text-sm text-slate-500">
                    {getCourseName(selectedCourse)} /{" "}
                    {getBranchName(selectedBranch)} /{" "}
                    {getSemesterName(selectedSemester)}
                  </p>
                )}
              </div>

              <button
                onClick={openSubjectCreate}
                disabled={!selectedSemester}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Plus size={17} />
                Add Subject
              </button>
            </div>

            {selectedSemester && (
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <MiniStat
                  title="Subjects"
                  value={filteredSubjects.length}
                />

                <MiniStat
                  title="Active"
                  value={
                    filteredSubjects.filter(
                      (subject) =>
                        subject.isActive !== false,
                    ).length
                  }
                />

                <MiniStat
                  title="Inactive"
                  value={
                    filteredSubjects.filter(
                      (subject) =>
                        subject.isActive === false,
                    ).length
                  }
                />

                <MiniStat
                  title="Credits"
                  value={totalCredits}
                />
              </div>
            )}

            {selectedSemester && (
              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_160px]">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search subject code or name..."
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <SelectField
                  value={subjectTypeFilter}
                  onChange={(event) =>
                    setSubjectTypeFilter(
                      event.target.value,
                    )
                  }
                >
                  <option value="All">All Types</option>
                  <option value="Core">Core</option>
                  <option value="Elective">
                    Elective
                  </option>
                  <option value="Practical">
                    Practical
                  </option>
                  <option value="Lab">Lab</option>
                  <option value="Project">
                    Project
                  </option>
                  <option value="Training">
                    Training
                  </option>
                </SelectField>

                <SelectField
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value,
                    )
                  }
                >
                  <option value="All">
                    All Status
                  </option>
                  <option value="Active">
                    Active
                  </option>
                  <option value="Inactive">
                    Inactive
                  </option>
                </SelectField>
              </div>
            )}
          </div>

          {!selectedSemester ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <div className="rounded-full bg-indigo-50 p-4 text-indigo-600">
                <BookOpen size={28} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Select a Semester
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Select Course, Branch and Semester above
                to view and manage subjects.
              </p>
            </div>
          ) : loading ? (
            <div className="flex min-h-[280PX] items-center justify-center">
              <div className="text-sm text-slate-500">
                Loading academic data...
              </div>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="flex min-h-[280PX] flex-col items-center justify-center px-6 text-center">
              <div className="rounded-full bg-slate-100 p-4 text-slate-500">
                <BookOpen size={28} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No subjects found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Add a subject for this semester or
                change the search/filter.
              </p>

              <button
                onClick={openSubjectCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus size={17} />
                Add Subject
              </button>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[950px]">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-6 py-4">
                        Subject
                      </th>
                      <th className="px-6 py-4">
                        Type
                      </th>
                      <th className="px-6 py-4">
                        Credits
                      </th>
                      <th className="px-6 py-4">
                        Marks
                      </th>
                      <th className="px-6 py-4">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredSubjects.map(
                      (subject) => (
                        <tr
                          key={subject._id}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">
                              {subject.subjectName}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {subject.subjectCode}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              {subject.subjectType}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm font-medium text-slate-700">
                            {subject.credits}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {subject.maxMarks} /{" "}
                            {subject.passingMarks}
                          </td>

                          <td className="px-6 py-4">
                            <StatusBadge
                              active={
                                subject.isActive !==
                                false
                              }
                            />
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <ActionButton
                                title="View"
                                onClick={() =>
                                  setViewingItem(
                                    subject,
                                  )
                                }
                              >
                                <Eye size={15} />
                              </ActionButton>

                              <ActionButton
                                title="Edit"
                                onClick={() =>
                                  openSubjectEdit(
                                    subject,
                                  )
                                }
                              >
                                <Edit size={15} />
                              </ActionButton>

                              <ActionButton
                                danger
                                title="Delete"
                                onClick={() =>
                                  setDeleteInfo({
                                    type: "subject",
                                    item: subject,
                                  })
                                }
                              >
                                <Trash2 size={15} />
                              </ActionButton>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-4 lg:hidden">
                {filteredSubjects.map(
                  (subject) => (
                    <div
                      key={subject._id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {subject.subjectName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {subject.subjectCode}
                          </p>
                        </div>

                        <StatusBadge
                          active={
                            subject.isActive !==
                            false
                          }
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <InfoBox
                          label="Type"
                          value={
                            subject.subjectType
                          }
                        />

                        <InfoBox
                          label="Credits"
                          value={
                            subject.credits
                          }
                        />

                        <InfoBox
                          label="Marks"
                          value={`${subject.maxMarks}/${subject.passingMarks}`}
                        />
                      </div>

                      <div className="mt-4 flex justify-end gap-2">
                        <ActionButton
                          title="View"
                          onClick={() =>
                            setViewingItem(
                              subject,
                            )
                          }
                        >
                          <Eye size={15} />
                        </ActionButton>

                        <ActionButton
                          title="Edit"
                          onClick={() =>
                            openSubjectEdit(
                              subject,
                            )
                          }
                        >
                          <Edit size={15} />
                        </ActionButton>

                        <ActionButton
                          danger
                          title="Delete"
                          onClick={() =>
                            setDeleteInfo({
                              type: "subject",
                              item: subject,
                            })
                          }
                        >
                          <Trash2 size={15} />
                        </ActionButton>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Course Modal */}
      {modal === "course" && (
        <Modal
          title={
            editingItem
              ? "Edit Course"
              : "Add Course"
          }
          onClose={closeModal}
        >
          <form
            onSubmit={submitCourse}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Course Code"
                value={courseForm.courseCode}
                onChange={(event) =>
                  setCourseForm({
                    ...courseForm,
                    courseCode:
                      event.target.value.toUpperCase(),
                  })
                }
                placeholder="BTECH"
                required
              />

              <InputField
                label="Course Name"
                value={courseForm.courseName}
                onChange={(event) =>
                  setCourseForm({
                    ...courseForm,
                    courseName:
                      event.target.value,
                  })
                }
                placeholder="Bachelor of Technology"
                required
              />

              <SelectField
                label="Course Type"
                value={courseForm.courseType}
                onChange={(event) =>
                  setCourseForm({
                    ...courseForm,
                    courseType:
                      event.target.value,
                  })
                }
              >
                <option value="Undergraduate">
                  Undergraduate
                </option>
                <option value="Postgraduate">
                  Postgraduate
                </option>
                <option value="Diploma">
                  Diploma
                </option>
                <option value="Certificate">
                  Certificate
                </option>
              </SelectField>

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Duration"
                  type="number"
                  min="1"
                  value={courseForm.duration}
                  onChange={(event) =>
                    setCourseForm({
                      ...courseForm,
                      duration:
                        event.target.value,
                    })
                  }
                  placeholder="4"
                  required
                />

                <SelectField
                  label="Unit"
                  value={courseForm.durationUnit}
                  onChange={(event) =>
                    setCourseForm({
                      ...courseForm,
                      durationUnit:
                        event.target.value,
                    })
                  }
                >
                  <option value="Years">
                    Years
                  </option>
                  <option value="Semesters">
                    Semesters
                  </option>
                </SelectField>
              </div>
            </div>

            <TextAreaField
              label="Description"
              value={courseForm.description}
              onChange={(event) =>
                setCourseForm({
                  ...courseForm,
                  description:
                    event.target.value,
                })
              }
              placeholder="Course description..."
            />

            <ActiveCheckbox
              checked={courseForm.isActive}
              onChange={(value) =>
                setCourseForm({
                  ...courseForm,
                  isActive: value,
                })
              }
            />

            <ModalActions
              onCancel={closeModal}
              submitText={
                editingItem
                  ? "Update Course"
                  : "Create Course"
              }
            />
          </form>
        </Modal>
      )}

      {/* Branch Modal */}
      {modal === "branch" && (
        <Modal
          title={
            editingItem
              ? "Edit Branch"
              : "Add Branch"
          }
          onClose={closeModal}
        >
          <form
            onSubmit={submitBranch}
            className="space-y-4"
          >
            <SelectField
              label="Course"
              value={branchForm.courseId}
              onChange={(event) =>
                setBranchForm({
                  ...branchForm,
                  courseId:
                    event.target.value,
                })
              }
              required
            >
              <option value="">
                Select Course
              </option>

              {courses.map((course) => (
                <option
                  key={course._id}
                  value={course._id}
                >
                  {course.courseCode} -{" "}
                  {course.courseName}
                </option>
              ))}
            </SelectField>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Branch Code"
                value={branchForm.branchCode}
                onChange={(event) =>
                  setBranchForm({
                    ...branchForm,
                    branchCode:
                      event.target.value.toUpperCase(),
                  })
                }
                placeholder="CSE"
                required
              />

              <InputField
                label="Branch Name"
                value={branchForm.branchName}
                onChange={(event) =>
                  setBranchForm({
                    ...branchForm,
                    branchName:
                      event.target.value,
                  })
                }
                placeholder="Computer Science and Engineering"
                required
              />
            </div>

            <SelectField
              label="HOD"
              value={branchForm.hod}
              onChange={(event) =>
                setBranchForm({
                  ...branchForm,
                  hod: event.target.value,
                })
              }
            >
              <option value="">
                Not Assigned
              </option>

              {activeFaculty.map((member) => (
                <option
                  key={member._id}
                  value={member._id}
                >
                  {getFacultyName(member)}
                </option>
              ))}
            </SelectField>

            <TextAreaField
              label="Description"
              value={branchForm.description}
              onChange={(event) =>
                setBranchForm({
                  ...branchForm,
                  description:
                    event.target.value,
                })
              }
              placeholder="Branch description..."
            />

            <ActiveCheckbox
              checked={branchForm.isActive}
              onChange={(value) =>
                setBranchForm({
                  ...branchForm,
                  isActive: value,
                })
              }
            />

            <ModalActions
              onCancel={closeModal}
              submitText={
                editingItem
                  ? "Update Branch"
                  : "Create Branch"
              }
            />
          </form>
        </Modal>
      )}

      {/* Semester Modal */}
      {modal === "semester" && (
        <Modal
          title={
            editingItem
              ? "Edit Semester"
              : "Add Semester"
          }
          onClose={closeModal}
        >
          <form
            onSubmit={submitSemester}
            className="space-y-4"
          >
            <SelectField
              label="Course"
              value={semesterForm.courseId}
              onChange={(event) => {
                setSemesterForm({
                  ...semesterForm,
                  courseId:
                    event.target.value,
                  branchId: "",
                });
              }}
              required
            >
              <option value="">
                Select Course
              </option>

              {courses.map((course) => (
                <option
                  key={course._id}
                  value={course._id}
                >
                  {course.courseCode} -{" "}
                  {course.courseName}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Branch"
              value={semesterForm.branchId}
              disabled={!semesterForm.courseId}
              onChange={(event) =>
                setSemesterForm({
                  ...semesterForm,
                  branchId:
                    event.target.value,
                })
              }
              required
            >
              <option value="">
                Select Branch
              </option>

              {branches
                .filter(
                  (branch) =>
                    String(
                      branch.courseId?._id ||
                        branch.courseId,
                    ) ===
                    String(
                      semesterForm.courseId,
                    ),
                )
                .map((branch) => (
                  <option
                    key={branch._id}
                    value={branch._id}
                  >
                    {branch.branchCode} -{" "}
                    {branch.branchName}
                  </option>
                ))}
            </SelectField>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Semester Number"
                type="number"
                min="1"
                value={
                  semesterForm.semesterNumber
                }
                onChange={(event) =>
                  setSemesterForm({
                    ...semesterForm,
                    semesterNumber:
                      event.target.value,
                  })
                }
                placeholder="1"
                required
              />

              <InputField
                label="Semester Name"
                value={
                  semesterForm.semesterName
                }
                onChange={(event) =>
                  setSemesterForm({
                    ...semesterForm,
                    semesterName:
                      event.target.value,
                  })
                }
                placeholder="First Semester"
                required
              />
            </div>

            <ActiveCheckbox
              checked={semesterForm.isActive}
              onChange={(value) =>
                setSemesterForm({
                  ...semesterForm,
                  isActive: value,
                })
              }
            />

            <ModalActions
              onCancel={closeModal}
              submitText={
                editingItem
                  ? "Update Semester"
                  : "Create Semester"
              }
            />
          </form>
        </Modal>
      )}

      {/* Subject Modal */}
      {modal === "subject" && (
        <Modal
          title={
            editingItem
              ? "Edit Subject"
              : "Add Subject"
          }
          onClose={closeModal}
          wide
        >
          <form
            onSubmit={submitSubject}
            className="space-y-5"
          >
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Academic Context
              </p>

              <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <span className="text-slate-500">
                    Course
                  </span>
                  <p className="font-medium text-slate-900">
                    {getCourseName(
                      subjectForm.courseId,
                    )}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500">
                    Branch
                  </span>
                  <p className="font-medium text-slate-900">
                    {getBranchName(
                      subjectForm.branchId,
                    )}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500">
                    Semester
                  </span>
                  <p className="font-medium text-slate-900">
                    {getSemesterName(
                      subjectForm.semesterId,
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Subject Code"
                value={subjectForm.subjectCode}
                onChange={(event) =>
                  setSubjectForm({
                    ...subjectForm,
                    subjectCode:
                      event.target.value.toUpperCase(),
                  })
                }
                placeholder="CS101"
                required
              />

              <InputField
                label="Subject Name"
                value={subjectForm.subjectName}
                onChange={(event) =>
                  setSubjectForm({
                    ...subjectForm,
                    subjectName:
                      event.target.value,
                  })
                }
                placeholder="Data Structures"
                required
              />

              <SelectField
                label="Subject Type"
                value={subjectForm.subjectType}
                onChange={(event) =>
                  setSubjectForm({
                    ...subjectForm,
                    subjectType:
                      event.target.value,
                  })
                }
              >
                <option value="Core">Core</option>
                <option value="Elective">
                  Elective
                </option>
                <option value="Practical">
                  Practical
                </option>
                <option value="Lab">Lab</option>
                <option value="Project">
                  Project
                </option>
                <option value="Training">
                  Training
                </option>
              </SelectField>

              <InputField
                label="Credits"
                type="number"
                min="0"
                step="0.5"
                value={subjectForm.credits}
                onChange={(event) =>
                  setSubjectForm({
                    ...subjectForm,
                    credits:
                      event.target.value,
                  })
                }
                placeholder="4"
                required
              />

              <InputField
                label="Maximum Marks"
                type="number"
                min="1"
                value={subjectForm.maxMarks}
                onChange={(event) =>
                  setSubjectForm({
                    ...subjectForm,
                    maxMarks:
                      event.target.value,
                  })
                }
                placeholder="100"
                required
              />

              <InputField
                label="Passing Marks"
                type="number"
                min="0"
                value={
                  subjectForm.passingMarks
                }
                onChange={(event) =>
                  setSubjectForm({
                    ...subjectForm,
                    passingMarks:
                      event.target.value,
                  })
                }
                placeholder="40"
                required
              />
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-indigo-600" />
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Faculty Assignment
                    </h3>
                    <p className="text-xs text-slate-500">
                      Assign faculty by section and academic year.
                    </p>
                  </div>
                </div>

                {editingItem && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAssignment(null);
                      setAssignmentForm({
                        facultyId: "",
                        section: "",
                        academicYear: "",
                      });
                      setAssignmentModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    <Plus size={14} />
                    Assign Faculty
                  </button>
                )}
              </div>

              {!editingItem ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <SelectField
                    label="Faculty"
                    value={subjectForm.facultyId}
                    onChange={(event) =>
                      setSubjectForm({
                        ...subjectForm,
                        facultyId: event.target.value,
                      })
                    }
                  >
                    <option value="">Not Assigned</option>
                    {activeFaculty.map((member) => (
                      <option key={member._id} value={member._id}>
                        {getFacultyName(member)}
                      </option>
                    ))}
                  </SelectField>

                  <InputField
                    label="Section"
                    value={subjectForm.section}
                    onChange={(event) =>
                      setSubjectForm({
                        ...subjectForm,
                        section: event.target.value.toUpperCase(),
                      })
                    }
                    placeholder="A"
                  />

                  <InputField
                    label="Academic Year"
                    value={subjectForm.academicYear}
                    onChange={(event) =>
                      setSubjectForm({
                        ...subjectForm,
                        academicYear: event.target.value,
                      })
                    }
                    placeholder="2026-27"
                  />
                </div>
              ) : assignmentLoading ? (
                <div className="rounded-xl border border-slate-200 p-5 text-center text-sm text-slate-500">
                  Loading faculty assignments...
                </div>
              ) : assignments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                  <Users size={25} className="mx-auto text-slate-400" />
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    No faculty assigned
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Use "Assign Faculty" to assign this subject.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                          <Users size={17} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {getFacultyName(assignment.facultyId)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Section {assignment.section} • {assignment.academicYear}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openAssignmentEdit(assignment)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                          title="Edit Assignment"
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteAssignment(assignment)}
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                          title="Delete Assignment"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <ActiveCheckbox
              checked={subjectForm.isActive}
              onChange={(value) =>
                setSubjectForm({
                  ...subjectForm,
                  isActive: value,
                })
              }
            />

            <ModalActions
              onCancel={closeModal}
              submitText={
                editingItem
                  ? "Update Subject"
                  : "Create Subject"
              }
            />
          </form>
        </Modal>
      )}

      {/* Faculty Assignment Modal */}
      {assignmentModal && (
        <Modal
          title={
            editingAssignment
              ? "Edit Faculty Assignment"
              : "Assign Faculty"
          }
          onClose={() => {
            setAssignmentModal(false);
            setEditingAssignment(null);
          }}
        >
          <form onSubmit={submitAssignment} className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Subject
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {editingItem?.subjectCode} - {editingItem?.subjectName}
              </p>
            </div>

            <SelectField
              label="Faculty"
              value={assignmentForm.facultyId}
              onChange={(event) =>
                setAssignmentForm({
                  ...assignmentForm,
                  facultyId: event.target.value,
                })
              }
              required
            >
              <option value="">Select Faculty</option>
              {activeFaculty.map((member) => (
                <option key={member._id} value={member._id}>
                  {getFacultyName(member)}
                </option>
              ))}
            </SelectField>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Section"
                value={assignmentForm.section}
                onChange={(event) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    section: event.target.value.toUpperCase(),
                  })
                }
                placeholder="A"
                required
              />

              <InputField
                label="Academic Year"
                value={assignmentForm.academicYear}
                onChange={(event) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    academicYear: event.target.value,
                  })
                }
                placeholder="2026-27"
                required
              />
            </div>

            <ModalActions
              onCancel={() => {
                setAssignmentModal(false);
                setEditingAssignment(null);
              }}
              submitText={
                editingAssignment
                  ? "Update Assignment"
                  : "Assign Faculty"
              }
            />
          </form>
        </Modal>
      )}

      {/* View Subject */}
      {viewingItem && (
        <Modal
          title="Subject Details"
          onClose={() => setViewingItem(null)}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500">
                Subject
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-900">
                {viewingItem.subjectName}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {viewingItem.subjectCode}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <InfoBox
                label="Type"
                value={
                  viewingItem.subjectType
                }
              />

              <InfoBox
                label="Credits"
                value={viewingItem.credits}
              />

              <InfoBox
                label="Max Marks"
                value={viewingItem.maxMarks}
              />

              <InfoBox
                label="Passing"
                value={
                  viewingItem.passingMarks
                }
              />

              <InfoBox
                label="Course"
                value={getCourseName(
                  viewingItem.courseId?._id ||
                    viewingItem.courseId,
                )}
              />

              <InfoBox
                label="Branch"
                value={getBranchName(
                  viewingItem.branchId?._id ||
                    viewingItem.branchId,
                )}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() =>
                  setViewingItem(null)
                }
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteInfo && (
        <Modal
          title="Confirm Delete"
          onClose={() => setDeleteInfo(null)}
        >
          <div>
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Are you sure you want to delete{" "}
                <strong>
                  {deleteInfo.item.courseName ||
                    deleteInfo.item.branchName ||
                    deleteInfo.item.semesterName ||
                    deleteInfo.item.subjectName ||
                    deleteInfo.item.subjectCode}
                </strong>
                ?
              </p>

              <p className="mt-2 text-xs text-red-600">
                If this record has dependent academic
                data, the backend may reject the
                deletion.
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() =>
                  setDeleteInfo(null)
                }
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-3 text-sm font-medium text-slate-500">
        {title}
      </p>
    </div>
  );
}

function MiniStat({ title, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function StructureCard({
  title,
  icon,
  count,
  buttonText,
  onAdd,
  children,
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
            {icon}
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              {title}
            </h3>

            <p className="text-xs text-slate-500">
              {count} total
            </p>
          </div>
        </div>

        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Plus size={14} />
          {buttonText}
        </button>
      </div>

      {children}
    </div>
  );
}

function EmptySmall({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  title,
  danger = false,
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-lg border p-2 transition ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-slate-200 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  step,
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
  disabled = false,
  required = false,
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          {children}
        </select>

        <ChevronDown
          size={17}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

function ActiveCheckbox({ checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      Active
    </label>
  );
}

function Modal({
  title,
  onClose,
  children,
  wide = false,
}) {
  return (
    <div className="fixed inset-0 -z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div
        className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${
          wide ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  submitText,
}) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        {submitText}
      </button>
    </div>
  );
}

export default AcademicStructure;