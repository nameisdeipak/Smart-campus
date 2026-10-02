import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Loader2,
  Search,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosClient from "../../services/axiosClient";

const StudentSubjectEnrollment = () => {
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const [searchStudent, setSearchStudent] = useState("");
  const [searchSubject, setSearchSubject] = useState("");

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);

  const [enrollingSubjectId, setEnrollingSubjectId] = useState(null);
  const [removingRelationId, setRemovingRelationId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);

      const response = await axiosClient.get(
        "/admin/courses/getAllCourses",
      );

      setCourses(response.data.courses || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load courses",
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchBranches = async (courseId) => {
    if (!courseId) {
      setBranches([]);
      return;
    }

    try {
      setLoadingBranches(true);

      const response = await axiosClient.get(
        "/admin/branches/getAllBranches",
      );

      const allBranches = response.data.branches || [];

      const filteredBranches = allBranches.filter(
        (branch) =>
          String(branch.courseId?._id || branch.courseId) ===
          String(courseId),
      );

      setBranches(filteredBranches);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load branches",
      );
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchSemesters = async (branchId) => {
    if (!branchId) {
      setSemesters([]);
      return;
    }

    try {
      setLoadingSemesters(true);

      const response = await axiosClient.get(
        "/admin/semesters/getAllSemesters",
      );

      const allSemesters = response.data.semesters || [];

      const filteredSemesters = allSemesters.filter(
        (semester) =>
          String(semester.branchId?._id || semester.branchId) ===
          String(branchId),
      );

      setSemesters(filteredSemesters);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load semesters",
      );
    } finally {
      setLoadingSemesters(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);

      const response = await axiosClient.get(
        "/admin/students/getAllStudent",
      );

      setStudents(response.data.students || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load students",
      );
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchSubjects = async (semesterId) => {
    if (!semesterId) {
      setSubjects([]);
      return;
    }

    try {
      setLoadingSubjects(true);

      const response = await axiosClient.get(
        "/admin/subjects/getAllSubjects",
      );

      const allSubjects = response.data.subjects || [];

      const filteredSubjects = allSubjects.filter(
        (subject) =>
          String(subject.semesterId?._id || subject.semesterId) ===
          String(semesterId),
      );

      setSubjects(filteredSubjects);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load subjects",
      );
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchStudentSubjects = async (studentId) => {
    if (!studentId) {
      setEnrolledSubjects([]);
      return;
    }

    try {
      setLoadingEnrollment(true);

      const response = await axiosClient.get(
        `/admin/student-subjects/student/${studentId}`,
      );

      setEnrolledSubjects(response.data.studentSubjects || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load student's subjects",
      );
    } finally {
      setLoadingEnrollment(false);
    }
  };

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedBranch("");
    setSelectedSemester("");
    setSelectedStudent("");
    setBranches([]);
    setSemesters([]);
    setSubjects([]);
    setEnrolledSubjects([]);

    await fetchBranches(courseId);
  };

  const handleBranchChange = async (branchId) => {
    setSelectedBranch(branchId);
    setSelectedSemester("");
    setSelectedStudent("");
    setSemesters([]);
    setSubjects([]);
    setEnrolledSubjects([]);

    await fetchSemesters(branchId);
  };

  const handleSemesterChange = async (semesterId) => {
    setSelectedSemester(semesterId);
    setSelectedStudent("");
    setSubjects([]);
    setEnrolledSubjects([]);

    await fetchSubjects(semesterId);

    if (students.length === 0) {
      await fetchStudents();
    }
  };

  const handleStudentChange = async (studentId) => {
    setSelectedStudent(studentId);

    await fetchStudentSubjects(studentId);
  };

  const getStudentCourseId = (student) => {
    return student.course?._id || student.course;
  };

  const getStudentBranchId = (student) => {
    return student.branch?._id || student.branch;
  };

  const getStudentSemester = (student) => {
    return student.semester;
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesCourse =
        String(getStudentCourseId(student)) ===
        String(selectedCourse);

      const matchesBranch =
        String(getStudentBranchId(student)) ===
        String(selectedBranch);

      const matchesSemester =
        String(getStudentSemester(student)) ===
        String(
          semesters.find(
            (semester) =>
              String(semester._id) === String(selectedSemester),
          )?.semesterNumber,
        );

      const user = student.userId || {};

      const searchText = searchStudent.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        user.name?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText) ||
        student.enrollmentNumber
          ?.toLowerCase()
          .includes(searchText) ||
        student.rollNumber
          ?.toLowerCase()
          .includes(searchText);

      return (
        matchesCourse &&
        matchesBranch &&
        matchesSemester &&
        matchesSearch
      );
    });
  }, [
    students,
    selectedCourse,
    selectedBranch,
    selectedSemester,
    semesters,
    searchStudent,
  ]);

  const filteredSubjects = useMemo(() => {
    const searchText = searchSubject.toLowerCase().trim();

    return subjects.filter((subject) => {
      if (!searchText) return true;

      return (
        subject.subjectName
          ?.toLowerCase()
          .includes(searchText) ||
        subject.subjectCode
          ?.toLowerCase()
          .includes(searchText) ||
        subject.subjectType
          ?.toLowerCase()
          .includes(searchText)
      );
    });
  }, [subjects, searchSubject]);

  const isSubjectEnrolled = (subjectId) => {
    return enrolledSubjects.some(
      (relation) =>
        String(relation.subjectId?._id || relation.subjectId) ===
        String(subjectId),
    );
  };

  const getEnrollmentRelation = (subjectId) => {
    return enrolledSubjects.find(
      (relation) =>
        String(relation.subjectId?._id || relation.subjectId) ===
        String(subjectId),
    );
  };

  const enrollSubject = async (subjectId) => {
    if (!selectedStudent) {
      toast.error("Please select a student first");
      return;
    }

    try {
      setEnrollingSubjectId(subjectId);

      const response = await axiosClient.post(
        "/admin/student-subjects/createStudentSubject",
        {
          studentId: selectedStudent,
          subjectId,
        },
      );

      toast.success(
        response.data.message ||
          "Student enrolled in subject successfully",
      );

      await fetchStudentSubjects(selectedStudent);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to enroll student in subject",
      );
    } finally {
      setEnrollingSubjectId(null);
    }
  };

  const removeSubject = async (relationId) => {
    try {
      setRemovingRelationId(relationId);

      const response = await axiosClient.delete(
        `/admin/student-subjects/deleteStudentSubject/${relationId}`,
      );

      toast.success(
        response.data.message ||
          "Subject removed from student successfully",
      );

      await fetchStudentSubjects(selectedStudent);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to remove subject",
      );
    } finally {
      setRemovingRelationId(null);
    }
  };

  const selectedStudentData = students.find(
    (student) => String(student._id) === String(selectedStudent),
  );

  const selectedSemesterData = semesters.find(
    (semester) =>
      String(semester._id) === String(selectedSemester),
  );

  const getStudentName = (student) => {
    return (
      student?.userId?.name ||
      student?.name ||
      "Unnamed Student"
    );
  };

  const getStudentEmail = (student) => {
    return student?.userId?.email || student?.email || "";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <GraduationCap size={24} />
                </div>

                <div>
                  <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                    Student Subject Enrollment
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage subjects assigned to individual students
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3">
              <Users size={19} className="text-indigo-600" />

              <div>
                <p className="text-xs text-indigo-600">
                  Enrolled Subjects
                </p>

                <p className="text-lg font-bold text-indigo-700">
                  {enrolledSubjects.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">
              Select Academic Structure
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select course, branch and semester before choosing a
              student.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SelectField
              label="Course"
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
              loading={loadingCourses}
              disabled={loadingCourses}
              options={courses.map((course) => ({
                value: course._id,
                label: `${course.courseCode} - ${course.courseName}`,
              }))}
              placeholder="Select Course"
            />

            <SelectField
              label="Branch"
              value={selectedBranch}
              onChange={(e) => handleBranchChange(e.target.value)}
              loading={loadingBranches}
              disabled={!selectedCourse || loadingBranches}
              options={branches.map((branch) => ({
                value: branch._id,
                label: `${branch.branchCode} - ${branch.branchName}`,
              }))}
              placeholder={
                selectedCourse
                  ? "Select Branch"
                  : "Select course first"
              }
            />

            <SelectField
              label="Semester"
              value={selectedSemester}
              onChange={(e) =>
                handleSemesterChange(e.target.value)
              }
              loading={loadingSemesters}
              disabled={!selectedBranch || loadingSemesters}
              options={semesters.map((semester) => ({
                value: semester._id,
                label: `Semester ${semester.semesterNumber} - ${semester.semesterName}`,
              }))}
              placeholder={
                selectedBranch
                  ? "Select Semester"
                  : "Select branch first"
              }
            />
          </div>
        </div>

        {selectedSemester && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Select Student
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Students from selected academic structure
                  </p>
                </div>

                <UserRound
                  size={20}
                  className="text-indigo-600"
                />
              </div>

              <div className="relative mb-4">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchStudent}
                  onChange={(e) =>
                    setSearchStudent(e.target.value)
                  }
                  placeholder="Search student..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
                />
              </div>

              {loadingStudents ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2
                    size={24}
                    className="animate-spin text-indigo-600"
                  />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                  <Users
                    size={30}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-700">
                    No students found
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    No student matches the selected academic
                    structure.
                  </p>
                </div>
              ) : (
                <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
                  {filteredStudents.map((student) => {
                    const isSelected =
                      String(selectedStudent) ===
                      String(student._id);

                    return (
                      <button
                        key={student._id}
                        type="button"
                        onClick={() =>
                          handleStudentChange(student._id)
                        }
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <UserRound size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {getStudentName(student)}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {student.enrollmentNumber ||
                                student.rollNumber ||
                                getStudentEmail(student)}
                            </p>
                          </div>

                          {isSelected && (
                            <CheckCircle2
                              size={19}
                              className="shrink-0 text-indigo-600"
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {selectedStudentData ? (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <UserRound size={21} />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {getStudentName(selectedStudentData)}
                        </p>

                        <p className="text-xs text-slate-600">
                          {selectedStudentData.enrollmentNumber ||
                            selectedStudentData.rollNumber ||
                            getStudentEmail(selectedStudentData)}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs text-indigo-600">
                        Current Semester
                      </p>

                      <p className="text-sm font-semibold text-indigo-800">
                        {selectedSemesterData?.semesterName ||
                          `Semester ${selectedSemesterData?.semesterNumber}`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <UserRound
                    size={36}
                    className="mx-auto text-slate-300"
                  />

                  <h3 className="mt-3 font-semibold text-slate-700">
                    Select a student
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Choose a student to manage subject enrollment.
                  </p>
                </div>
              )}

              {selectedStudent && (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="font-semibold text-slate-900">
                          Available Subjects
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Subjects available for the selected
                          semester
                        </p>
                      </div>

                      <div className="relative w-full sm:w-64">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          value={searchSubject}
                          onChange={(e) =>
                            setSearchSubject(e.target.value)
                          }
                          placeholder="Search subject..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    {loadingSubjects ? (
                      <div className="flex justify-center py-12">
                        <Loader2
                          size={28}
                          className="animate-spin text-indigo-600"
                        />
                      </div>
                    ) : filteredSubjects.length === 0 ? (
                      <EmptyState
                        icon={BookOpen}
                        title="No subjects found"
                        description="No subjects are configured for this semester."
                      />
                    ) : (
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        {filteredSubjects.map((subject) => {
                          const enrolled =
                            isSubjectEnrolled(subject._id);

                          const enrolling =
                            enrollingSubjectId === subject._id;

                          return (
                            <div
                              key={subject._id}
                              className={`rounded-xl border p-4 transition ${
                                enrolled
                                  ? "border-emerald-200 bg-emerald-50/60"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-start gap-3">
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                      enrolled
                                        ? "bg-emerald-100 text-emerald-600"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    <BookOpen size={19} />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="font-semibold text-slate-900">
                                      {subject.subjectName}
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                      {subject.subjectCode}
                                    </p>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                        {subject.subjectType}
                                      </span>

                                      <span className="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-600">
                                        {subject.credits} Credits
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {enrolled ? (
                                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">
                                    <CheckCircle2 size={15} />
                                    Enrolled
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      enrollSubject(subject._id)
                                    }
                                    disabled={enrolling}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {enrolling ? (
                                      <Loader2
                                        size={15}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CheckCircle2 size={15} />
                                    )}

                                    {enrolling
                                      ? "Enrolling..."
                                      : "Enroll"}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5">
                      <h2 className="font-semibold text-slate-900">
                        Enrolled Subjects
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Subjects currently assigned to this student
                      </p>
                    </div>

                    {loadingEnrollment ? (
                      <div className="flex justify-center py-10">
                        <Loader2
                          size={27}
                          className="animate-spin text-indigo-600"
                        />
                      </div>
                    ) : enrolledSubjects.length === 0 ? (
                      <EmptyState
                        icon={BookOpen}
                        title="No subjects enrolled"
                        description="Enroll subjects from the available subjects section."
                      />
                    ) : (
                      <div className="space-y-3">
                        {enrolledSubjects.map((relation) => {
                          const subject = relation.subjectId;
                          const removing =
                            removingRelationId === relation._id;

                          return (
                            <div
                              key={relation._id}
                              className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                  <BookOpen size={18} />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-slate-900">
                                    {subject?.subjectName ||
                                      "Subject"}
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {subject?.subjectCode ||
                                      "N/A"}
                                  </p>
                                </div>

                                <span
                                  className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                    relation.enrollmentStatus ===
                                    "Enrolled"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : relation.enrollmentStatus ===
                                          "Completed"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {relation.enrollmentStatus}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeSubject(relation._id)
                                }
                                disabled={removing}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {removing ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <XCircle size={15} />
                                )}

                                {removing
                                  ? "Removing..."
                                  : "Remove"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  loading,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {loading ? (
          <Loader2
            size={17}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-indigo-500"
          />
        ) : (
          <ChevronDown
            size={17}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
      </div>
    </div>
  );
};

const EmptyState = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
      <Icon
        size={32}
        className="mx-auto text-slate-300"
      />

      <p className="mt-3 text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
};

export default StudentSubjectEnrollment;