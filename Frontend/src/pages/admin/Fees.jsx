import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  IndianRupee,
  Receipt,
  CreditCard,
  WalletCards,
  GraduationCap,
  CalendarDays,
  Eye,
  RefreshCw,
  CircleDollarSign,
  AlertCircle,
  CheckCircle2,
  Clock3,
  ChevronDown,
} from "lucide-react";

import axiosClient from "../../services/axiosClient";

const emptyFeeItem = {
  feeType: "",
  amount: "",
};

const emptyFeeStructureForm = {
  courseId: "",
  branchId: "",
  semesterId: "",
  academicYear: "",
  feeItems: [{ ...emptyFeeItem }],
};

const emptyStudentFeeForm = {
  studentId: "",
  feeStructureId: "",
  discount: "",
  dueDate: "",
  remarks: "",
};

const emptyPaymentForm = {
  studentFeeId: "",
  amount: "",
  paymentMethod: "UPI",
  transactionId: "",
  paymentDate: new Date().toISOString().split("T")[0],
  receiptNumber: "",
  remarks: "",
};

function Fees() {
  const [activeTab, setActiveTab] = useState("structure");

  const [feeStructures, setFeeStructures] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [payments, setPayments] = useState([]);

  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(false);

  const [searchStructure, setSearchStructure] = useState("");
  const [searchStudentFee, setSearchStudentFee] = useState("");
  const [searchPayment, setSearchPayment] = useState("");

  const [showFeeStructureModal, setShowFeeStructureModal] = useState(false);
  const [showStudentFeeModal, setShowStudentFeeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [viewData, setViewData] = useState(null);

  const [editingFeeStructure, setEditingFeeStructure] = useState(null);

  const [feeStructureForm, setFeeStructureForm] = useState(
    emptyFeeStructureForm
  );

  const [studentFeeForm, setStudentFeeForm] = useState(
    emptyStudentFeeForm
  );

  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: "",
    id: null,
  });

  const tabs = [
    {
      key: "structure",
      label: "Fee Structure",
      icon: WalletCards,
    },
    {
      key: "student-fees",
      label: "Student Fees",
      icon: GraduationCap,
    },
    {
      key: "payments",
      label: "Payments",
      icon: CreditCard,
    },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === "structure") {
      fetchFeeStructures();
    }

    if (activeTab === "student-fees") {
      fetchStudentFees();
    }

    if (activeTab === "payments") {
      fetchPayments();
    }
  }, [activeTab]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [
        coursesResponse,
        branchesResponse,
        semestersResponse,
        studentsResponse,
      ] = await Promise.all([
        axiosClient.get("/admin/courses/getAllCourses"),
        axiosClient.get("/admin/branches/getAllBranches"),
        axiosClient.get("/admin/semesters/getAllSemesters"),
        axiosClient.get("/admin/students/getAllStudent"),
      ]);

      setCourses(coursesResponse.data?.data || []);
      setBranches(branchesResponse.data?.data || []);
      setSemesters(semestersResponse.data?.data || []);
      setStudents(studentsResponse.data?.data || []);

      await Promise.all([
        fetchFeeStructures(),
        fetchStudentFees(),
        fetchPayments(),
      ]);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load fees module data"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      const response = await axiosClient.get(
        "/admin/fee-structures/getAllFeeStructures"
      );

      setFeeStructures(response.data?.data || []);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch fee structures"
      );
    }
  };

  const fetchStudentFees = async () => {
    try {
      const response = await axiosClient.get(
        "/admin/student-fees/getAllStudentFees"
      );

      setStudentFees(response.data?.data || []);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch student fees"
      );
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axiosClient.get(
        "/admin/fee-payments/getAllFeePayments"
      );

      setPayments(response.data?.data || []);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch payments"
      );
    }
  };

  const getId = (value) => {
    if (!value) return "";
    return typeof value === "object" ? value._id : value;
  };

  const getStudentName = (student) => {
    if (!student) return "Unknown Student";

    if (student.userId?.name) {
      return student.userId.name;
    }

    if (student.name) {
      return student.name;
    }

    if (student.studentName) {
      return student.studentName;
    }

    return student.rollNumber || student.studentId || "Unknown Student";
  };

  const getCourseName = (course) => {
    if (!course) return "-";

    if (course.courseName) {
      return `${course.courseCode || ""}${
        course.courseCode ? " - " : ""
      }${course.courseName}`;
    }

    return course.courseCode || "-";
  };

  const getBranchName = (branch) => {
    if (!branch) return "-";

    if (branch.branchName) {
      return `${branch.branchCode || ""}${
        branch.branchCode ? " - " : ""
      }${branch.branchName}`;
    }

    return branch.branchCode || "-";
  };

  const getSemesterName = (semester) => {
    if (!semester) return "-";

    return (
      semester.semesterName ||
      `Semester ${semester.semesterNumber || "-"}`
    );
  };

  const filteredBranches = useMemo(() => {
    if (!selectedCourse) return [];

    return branches.filter(
      (branch) =>
        getId(branch.courseId) === selectedCourse
    );
  }, [branches, selectedCourse]);

  const filteredSemesters = useMemo(() => {
    if (!selectedBranch) return [];

    return semesters.filter(
      (semester) =>
        getId(semester.branchId) === selectedBranch
    );
  }, [semesters, selectedBranch]);

  const filteredStructureRows = useMemo(() => {
    const search = searchStructure.toLowerCase().trim();

    if (!search) return feeStructures;

    return feeStructures.filter((item) => {
      const course = item.courseId;
      const branch = item.branchId;
      const semester = item.semesterId;

      const searchableText = [
        course?.courseCode,
        course?.courseName,
        branch?.branchCode,
        branch?.branchName,
        semester?.semesterName,
        item.academicYear,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [feeStructures, searchStructure]);

  const filteredStudentFees = useMemo(() => {
    const search = searchStudentFee.toLowerCase().trim();

    if (!search) return studentFees;

    return studentFees.filter((item) => {
      const student = item.studentId;
      const feeStructure = item.feeStructureId;

      const searchableText = [
        getStudentName(student),
        student?.studentId,
        student?.rollNumber,
        feeStructure?.courseId?.courseCode,
        feeStructure?.courseId?.courseName,
        feeStructure?.branchId?.branchCode,
        feeStructure?.branchId?.branchName,
        item.academicYear,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [studentFees, searchStudentFee]);

  const filteredPayments = useMemo(() => {
    const search = searchPayment.toLowerCase().trim();

    if (!search) return payments;

    return payments.filter((payment) => {
      const student = payment.studentId;

      const searchableText = [
        getStudentName(student),
        student?.studentId,
        payment.receiptNumber,
        payment.transactionId,
        payment.paymentMethod,
        payment.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [payments, searchPayment]);

  const totalStructureAmount = useMemo(() => {
    return feeStructures.reduce(
      (sum, item) => sum + Number(item.totalAmount || 0),
      0
    );
  }, [feeStructures]);

  const totalStudentPayable = useMemo(() => {
    return studentFees.reduce(
      (sum, item) => sum + Number(item.payableAmount || 0),
      0
    );
  }, [studentFees]);

  const totalCollected = useMemo(() => {
    return studentFees.reduce(
      (sum, item) => sum + Number(item.paidAmount || 0),
      0
    );
  }, [studentFees]);

  const totalDue = useMemo(() => {
    return studentFees.reduce(
      (sum, item) => sum + Number(item.dueAmount || 0),
      0
    );
  }, [studentFees]);

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const resetFeeStructureForm = () => {
    setFeeStructureForm({
      ...emptyFeeStructureForm,
      feeItems: [{ ...emptyFeeItem }],
    });

    setSelectedCourse("");
    setSelectedBranch("");
    setEditingFeeStructure(null);
  };

  const openCreateFeeStructure = () => {
    resetFeeStructureForm();
    setShowFeeStructureModal(true);
  };

  const openEditFeeStructure = (item) => {
    const courseId = getId(item.courseId);
    const branchId = getId(item.branchId);

    setEditingFeeStructure(item);

    setFeeStructureForm({
      courseId,
      branchId,
      semesterId: getId(item.semesterId),
      academicYear: item.academicYear || "",
      feeItems:
        item.feeItems?.length > 0
          ? item.feeItems.map((fee) => ({
              feeType: fee.feeType || "",
              amount: fee.amount ?? "",
            }))
          : [{ ...emptyFeeItem }],
    });

    setSelectedCourse(courseId);
    setSelectedBranch(branchId);

    setShowFeeStructureModal(true);
  };

  const handleFeeStructureCourseChange = (value) => {
    setSelectedCourse(value);

    setSelectedBranch("");

    setFeeStructureForm((prev) => ({
      ...prev,
      courseId: value,
      branchId: "",
      semesterId: "",
    }));
  };

  const handleFeeStructureBranchChange = (value) => {
    setSelectedBranch(value);

    setFeeStructureForm((prev) => ({
      ...prev,
      branchId: value,
      semesterId: "",
    }));
  };

  const handleFeeItemChange = (index, field, value) => {
    setFeeStructureForm((prev) => {
      const updatedItems = [...prev.feeItems];

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      return {
        ...prev,
        feeItems: updatedItems,
      };
    });
  };

  const addFeeItem = () => {
    setFeeStructureForm((prev) => ({
      ...prev,
      feeItems: [
        ...prev.feeItems,
        {
          ...emptyFeeItem,
        },
      ],
    }));
  };

  const removeFeeItem = (index) => {
    if (feeStructureForm.feeItems.length === 1) {
      toast.error("At least one fee item is required");
      return;
    }

    setFeeStructureForm((prev) => ({
      ...prev,
      feeItems: prev.feeItems.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const calculatedFeeTotal = useMemo(() => {
    return feeStructureForm.feeItems.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
  }, [feeStructureForm.feeItems]);

  const submitFeeStructure = async (event) => {
    event.preventDefault();

    try {
      if (
        !feeStructureForm.courseId ||
        !feeStructureForm.branchId ||
        !feeStructureForm.semesterId ||
        !feeStructureForm.academicYear.trim()
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      const validFeeItems = feeStructureForm.feeItems.filter(
        (item) =>
          item.feeType.trim() &&
          Number(item.amount) >= 0
      );

      if (validFeeItems.length === 0) {
        toast.error("Add at least one valid fee item");
        return;
      }

      const payload = {
        courseId: feeStructureForm.courseId,
        branchId: feeStructureForm.branchId,
        semesterId: feeStructureForm.semesterId,
        academicYear: feeStructureForm.academicYear.trim(),
        feeItems: validFeeItems.map((item) => ({
          feeType: item.feeType.trim(),
          amount: Number(item.amount),
        })),
      };

      if (editingFeeStructure) {
        await axiosClient.put(
          `/admin/fee-structures/updateFeeStructure/${editingFeeStructure._id}`,
          payload
        );

        toast.success("Fee structure updated successfully");
      } else {
        await axiosClient.post(
          "/admin/fee-structures/createFeeStructure",
          payload
        );

        toast.success("Fee structure created successfully");
      }

      setShowFeeStructureModal(false);
      resetFeeStructureForm();
      fetchFeeStructures();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to save fee structure"
      );
    }
  };

  const openStudentFeeModal = () => {
    setStudentFeeForm({
      ...emptyStudentFeeForm,
    });

    setShowStudentFeeModal(true);
  };

  const handleStudentFeeStudentChange = (studentId) => {
    setStudentFeeForm((prev) => ({
      ...prev,
      studentId,
      feeStructureId: "",
    }));
  };

  const selectedStudent = useMemo(() => {
    return students.find(
      (student) =>
        getId(student._id || student.id) ===
        studentFeeForm.studentId
    );
  }, [students, studentFeeForm.studentId]);

  const availableStudentFeeStructures = useMemo(() => {
    if (!selectedStudent) {
      return feeStructures;
    }

    const studentCourse = getId(selectedStudent.course);
    const studentBranch = getId(selectedStudent.branch);

    if (!studentCourse && !studentBranch) {
      return feeStructures;
    }

    return feeStructures.filter((fee) => {
      const courseMatch =
        !studentCourse ||
        getId(fee.courseId) === studentCourse;

      const branchMatch =
        !studentBranch ||
        getId(fee.branchId) === studentBranch;

      return courseMatch && branchMatch;
    });
  }, [feeStructures, selectedStudent]);

  const selectedStudentFeeStructure = useMemo(() => {
    return feeStructures.find(
      (item) =>
        item._id === studentFeeForm.feeStructureId
    );
  }, [feeStructures, studentFeeForm.feeStructureId]);

  const studentFeePayableAmount = useMemo(() => {
    const total = Number(
      selectedStudentFeeStructure?.totalAmount || 0
    );

    const discount = Number(
      studentFeeForm.discount || 0
    );

    return Math.max(total - discount, 0);
  }, [
    selectedStudentFeeStructure,
    studentFeeForm.discount,
  ]);

  const submitStudentFee = async (event) => {
    event.preventDefault();

    try {
      if (
        !studentFeeForm.studentId ||
        !studentFeeForm.feeStructureId ||
        !studentFeeForm.dueDate
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      const discount = Number(
        studentFeeForm.discount || 0
      );

      if (discount < 0) {
        toast.error("Discount cannot be negative");
        return;
      }

      if (
        selectedStudentFeeStructure &&
        discount >
          Number(selectedStudentFeeStructure.totalAmount || 0)
      ) {
        toast.error(
          "Discount cannot be greater than total fee"
        );
        return;
      }

      await axiosClient.post(
        "/admin/student-fees/createStudentFee",
        {
          studentId: studentFeeForm.studentId,
          feeStructureId: studentFeeForm.feeStructureId,
          discount,
          dueDate: studentFeeForm.dueDate,
          remarks: studentFeeForm.remarks.trim(),
        }
      );

      toast.success("Student fee assigned successfully");

      setShowStudentFeeModal(false);
      setStudentFeeForm({
        ...emptyStudentFeeForm,
      });

      fetchStudentFees();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to assign student fee"
      );
    }
  };

  const openPaymentModal = (studentFee = null) => {
    setPaymentForm({
      ...emptyPaymentForm,
      studentFeeId: studentFee?._id || "",
      amount: "",
    });

    setShowPaymentModal(true);
  };

  const selectedPaymentStudentFee = useMemo(() => {
    return studentFees.find(
      (item) => item._id === paymentForm.studentFeeId
    );
  }, [studentFees, paymentForm.studentFeeId]);

  const submitPayment = async (event) => {
    event.preventDefault();

    try {
      if (
        !paymentForm.studentFeeId ||
        !paymentForm.amount ||
        !paymentForm.paymentMethod
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      const amount = Number(paymentForm.amount);

      if (amount <= 0) {
        toast.error("Payment amount must be greater than 0");
        return;
      }

      const dueAmount = Number(
        selectedPaymentStudentFee?.dueAmount || 0
      );

      if (amount > dueAmount) {
        toast.error(
          `Payment cannot be greater than due amount ${formatCurrency(
            dueAmount
          )}`
        );
        return;
      }

      await axiosClient.post(
        "/admin/fee-payments/createFeePayment",
        {
          studentFeeId: paymentForm.studentFeeId,
          amount,
          paymentMethod: paymentForm.paymentMethod,
          transactionId:
            paymentForm.transactionId.trim(),
          paymentDate: paymentForm.paymentDate,
          receiptNumber:
            paymentForm.receiptNumber.trim(),
          remarks: paymentForm.remarks.trim(),
        }
      );

      toast.success("Payment recorded successfully");

      setShowPaymentModal(false);
      setPaymentForm({
        ...emptyPaymentForm,
      });

      await Promise.all([
        fetchStudentFees(),
        fetchPayments(),
      ]);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to record payment"
      );
    }
  };

  const openViewModal = (data, type) => {
    setViewData({
      ...data,
      type,
    });

    setShowViewModal(true);
  };

  const askDelete = (type, id) => {
    setDeleteModal({
      open: true,
      type,
      id,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      open: false,
      type: "",
      id: null,
    });
  };

  const confirmDelete = async () => {
    try {
      const { type, id } = deleteModal;

      if (!id) return;

      if (type === "structure") {
        await axiosClient.delete(
          `/admin/fee-structures/deleteFeeStructure/${id}`
        );

        toast.success(
          "Fee structure deleted successfully"
        );

        fetchFeeStructures();
      }

      if (type === "student-fee") {
        await axiosClient.delete(
          `/admin/student-fees/deleteStudentFee/${id}`
        );

        toast.success(
          "Student fee deleted successfully"
        );

        fetchStudentFees();
      }

      if (type === "payment") {
        await axiosClient.delete(
          `/admin/fee-payments/deleteFeePayment/${id}`
        );

        toast.success(
          "Payment deleted successfully"
        );

        await Promise.all([
          fetchPayments(),
          fetchStudentFees(),
        ]);
      }

      closeDeleteModal();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete record"
      );
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Paid":
      case "Success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "Partial":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "Overdue":
        return "bg-red-50 text-red-700 border-red-200";

      case "Failed":
        return "bg-red-50 text-red-700 border-red-200";

      case "Refunded":
        return "bg-purple-50 text-purple-700 border-purple-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const StatusBadge = ({ status }) => {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
          status
        )}`}
      >
        {status === "Paid" || status === "Success" ? (
          <CheckCircle2 size={13} />
        ) : status === "Overdue" || status === "Failed" ? (
          <AlertCircle size={13} />
        ) : (
          <Clock3 size={13} />
        )}

        {status || "Unknown"}
      </span>
    );
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
  }) => {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {title}
            </p>

            <h3 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
              {value}
            </h3>

            {description && (
              <p className="mt-1 text-xs text-gray-500">
                {description}
              </p>
            )}
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon size={20} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-gray-50 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Fees Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage fee structures, student fees and payment
              records.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeTab === "structure" && (
              <button
                type="button"
                onClick={openCreateFeeStructure}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Fee Structure
              </button>
            )}

            {activeTab === "student-fees" && (
              <button
                type="button"
                onClick={openStudentFeeModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Assign Student Fee
              </button>
            )}

            {activeTab === "payments" && (
              <button
                type="button"
                onClick={() => openPaymentModal()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Record Payment
              </button>
            )}

            <button
              type="button"
              onClick={fetchInitialData}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              <RefreshCw size={17} />
              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="Fee Structures"
            value={feeStructures.length}
            icon={WalletCards}
            description="Configured structures"
          />

          <StatCard
            title="Student Fees"
            value={studentFees.length}
            icon={GraduationCap}
            description="Assigned fee records"
          />

          <StatCard
            title="Collected"
            value={formatCurrency(totalCollected)}
            icon={CircleDollarSign}
            description="Total amount received"
          />

          <StatCard
            title="Total Due"
            value={formatCurrency(totalDue)}
            icon={AlertCircle}
            description="Outstanding amount"
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
          <div className="flex min-w-max gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={17} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "structure" && (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Fee Structures
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Configure semester-wise academic fees.
                </p>
              </div>

              <div className="relative w-full md:max-w-xs">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={searchStructure}
                  onChange={(e) =>
                    setSearchStructure(e.target.value)
                  }
                  placeholder="Search structure..."
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">
                      Course
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Branch
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Semester
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Academic Year
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Total
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredStructureRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-5 py-12 text-center text-gray-500"
                      >
                        No fee structures found.
                      </td>
                    </tr>
                  ) : (
                    filteredStructureRows.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-gray-900">
                            {item.courseId?.courseCode}
                          </div>

                          <div className="text-xs text-gray-500">
                            {item.courseId?.courseName}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-800">
                            {item.branchId?.branchCode}
                          </div>

                          <div className="text-xs text-gray-500">
                            {item.branchId?.branchName}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {getSemesterName(item.semesterId)}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {item.academicYear}
                        </td>

                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {formatCurrency(
                            item.totalAmount
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openViewModal(
                                  item,
                                  "structure"
                                )
                              }
                              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                              title="View"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openEditFeeStructure(item)
                              }
                              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                              title="Edit"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                askDelete(
                                  "structure",
                                  item._id
                                )
                              }
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 md:hidden">
              {filteredStructureRows.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-gray-500">
                  No fee structures found.
                </div>
              ) : (
                filteredStructureRows.map((item) => (
                  <div
                    key={item._id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.courseId?.courseCode} -{" "}
                          {item.branchId?.branchCode}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.courseId?.courseName}
                        </p>
                      </div>

                      <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                        {item.academicYear}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                          Semester
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {getSemesterName(
                            item.semesterId
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                          Total
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {formatCurrency(
                            item.totalAmount
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          openViewModal(
                            item,
                            "structure"
                          )
                        }
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openEditFeeStructure(item)
                        }
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          askDelete(
                            "structure",
                            item._id
                          )
                        }
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "student-fees" && (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Student Fees
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Track individual student payable and due
                  amounts.
                </p>
              </div>

              <div className="relative w-full md:max-w-xs">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={searchStudentFee}
                  onChange={(e) =>
                    setSearchStudentFee(e.target.value)
                  }
                  placeholder="Search student fees..."
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">
                      Student
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Academic Year
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Total
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Discount
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Payable
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Paid
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Due
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredStudentFees.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-5 py-12 text-center text-gray-500"
                      >
                        No student fees found.
                      </td>
                    </tr>
                  ) : (
                    filteredStudentFees.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-gray-900">
                            {getStudentName(
                              item.studentId
                            )}
                          </div>

                          <div className="text-xs text-gray-500">
                            {item.studentId?.studentId ||
                              item.studentId?.rollNumber ||
                              "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {item.academicYear}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {formatCurrency(
                            item.totalAmount
                          )}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {formatCurrency(
                            item.discount
                          )}
                        </td>

                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {formatCurrency(
                            item.payableAmount
                          )}
                        </td>

                        <td className="px-5 py-4 font-semibold text-emerald-600">
                          {formatCurrency(
                            item.paidAmount
                          )}
                        </td>

                        <td className="px-5 py-4 font-semibold text-red-600">
                          {formatCurrency(
                            item.dueAmount
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={item.status}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openViewModal(
                                  item,
                                  "student-fee"
                                )
                              }
                              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                            >
                              <Eye size={17} />
                            </button>

                            {Number(item.dueAmount) >
                              0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  openPaymentModal(
                                    item
                                  )
                                }
                                className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                                title="Record Payment"
                              >
                                <CreditCard
                                  size={17}
                                />
                              </button>
                            )}

                            {Number(item.paidAmount) ===
                              0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  askDelete(
                                    "student-fee",
                                    item._id
                                  )
                                }
                                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={17} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 md:hidden">
              {filteredStudentFees.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-gray-500">
                  No student fees found.
                </div>
              ) : (
                filteredStudentFees.map((item) => (
                  <div
                    key={item._id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getStudentName(
                            item.studentId
                          )}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.studentId?.studentId ||
                            item.studentId?.rollNumber ||
                            "Student"}
                        </p>
                      </div>

                      <StatusBadge
                        status={item.status}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                          Payable
                        </p>
                        <p className="mt-1 font-semibold">
                          {formatCurrency(
                            item.payableAmount
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-50 p-3">
                        <p className="text-xs text-emerald-600">
                          Paid
                        </p>
                        <p className="mt-1 font-semibold text-emerald-700">
                          {formatCurrency(
                            item.paidAmount
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-red-50 p-3">
                        <p className="text-xs text-red-600">
                          Due
                        </p>
                        <p className="mt-1 font-semibold text-red-700">
                          {formatCurrency(
                            item.dueAmount
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                          Due Date
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {formatDate(item.dueDate)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          openViewModal(
                            item,
                            "student-fee"
                          )
                        }
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                      >
                        <Eye size={17} />
                      </button>

                      {Number(item.dueAmount) > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            openPaymentModal(item)
                          }
                          className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                        >
                          <CreditCard size={17} />
                        </button>
                      )}

                      {Number(item.paidAmount) === 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            askDelete(
                              "student-fee",
                              item._id
                            )
                          }
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "payments" && (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Payment History
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  View and manage all fee transactions.
                </p>
              </div>

              <div className="relative w-full md:max-w-xs">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={searchPayment}
                  onChange={(e) =>
                    setSearchPayment(e.target.value)
                  }
                  placeholder="Search payments..."
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">
                      Receipt
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Student
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Amount
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Method
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Transaction
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Date
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-5 py-12 text-center text-gray-500"
                      >
                        No payments found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr
                        key={payment._id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-gray-900">
                            {payment.receiptNumber}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-900">
                            {getStudentName(
                              payment.studentId
                            )}
                          </div>

                          <div className="text-xs text-gray-500">
                            {payment.studentId
                              ?.studentId ||
                              payment.studentId
                                ?.rollNumber ||
                              "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {formatCurrency(
                            payment.amount
                          )}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {payment.paymentMethod}
                        </td>

                        <td className="px-5 py-4 text-gray-500">
                          {payment.transactionId || "-"}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {formatDate(
                            payment.paymentDate
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={payment.status}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openViewModal(
                                  payment,
                                  "payment"
                                )
                              }
                              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                            >
                              <Eye size={17} />
                            </button>

                            {payment.status !==
                              "Refunded" && (
                              <button
                                type="button"
                                onClick={() =>
                                  askDelete(
                                    "payment",
                                    payment._id
                                  )
                                }
                                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={17} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 md:hidden">
              {filteredPayments.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-gray-500">
                  No payments found.
                </div>
              ) : (
                filteredPayments.map((payment) => (
                  <div
                    key={payment._id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getStudentName(
                            payment.studentId
                          )}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {payment.receiptNumber}
                        </p>
                      </div>

                      <StatusBadge
                        status={payment.status}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                          Amount
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                          {formatCurrency(
                            payment.amount
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                          Method
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {payment.paymentMethod}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                          Date
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {formatDate(
                            payment.paymentDate
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                          Transaction
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold">
                          {payment.transactionId ||
                            "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          openViewModal(
                            payment,
                            "payment"
                          )
                        }
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                      >
                        <Eye size={17} />
                      </button>

                      {payment.status !== "Refunded" && (
                        <button
                          type="button"
                          onClick={() =>
                            askDelete(
                              "payment",
                              payment._id
                            )
                          }
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">
              Configured Fee Value
            </p>

            <p className="mt-1 text-lg font-bold text-gray-900">
              {formatCurrency(totalStructureAmount)}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">
              Student Payable
            </p>

            <p className="mt-1 text-lg font-bold text-gray-900">
              {formatCurrency(totalStudentPayable)}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">
              Outstanding
            </p>

            <p className="mt-1 text-lg font-bold text-red-600">
              {formatCurrency(totalDue)}
            </p>
          </div>
        </div>
      </div>

      {showFeeStructureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingFeeStructure
                    ? "Edit Fee Structure"
                    : "Add Fee Structure"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Configure semester-wise fee components.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowFeeStructureModal(false);
                  resetFeeStructureForm();
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={submitFeeStructure}
              className="overflow-y-auto p-4 sm:p-6"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField
                  label="Course"
                  required
                  value={feeStructureForm.courseId}
                  onChange={(e) =>
                    handleFeeStructureCourseChange(
                      e.target.value
                    )
                  }
                  options={courses.map((course) => ({
                    value: course._id,
                    label: getCourseName(course),
                  }))}
                />

                <SelectField
                  label="Branch"
                  required
                  value={feeStructureForm.branchId}
                  onChange={(e) =>
                    handleFeeStructureBranchChange(
                      e.target.value
                    )
                  }
                  disabled={!selectedCourse}
                  options={filteredBranches.map(
                    (branch) => ({
                      value: branch._id,
                      label: getBranchName(branch),
                    })
                  )}
                />

                <SelectField
                  label="Semester"
                  required
                  value={feeStructureForm.semesterId}
                  onChange={(e) =>
                    setFeeStructureForm((prev) => ({
                      ...prev,
                      semesterId: e.target.value,
                    }))
                  }
                  disabled={!selectedBranch}
                  options={filteredSemesters.map(
                    (semester) => ({
                      value: semester._id,
                      label: getSemesterName(
                        semester
                      ),
                    })
                  )}
                />

                <InputField
                  label="Academic Year"
                  required
                  value={feeStructureForm.academicYear}
                  onChange={(e) =>
                    setFeeStructureForm((prev) => ({
                      ...prev,
                      academicYear: e.target.value,
                    }))
                  }
                  placeholder="2026-27"
                />
              </div>

              <div className="mt-6">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Fee Items
                    </h3>

                    <p className="text-xs text-gray-500">
                      Add tuition, exam, library, lab etc.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addFeeItem}
                    className="inline-flex items-center justify-center gap-1.5 self-start rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    <Plus size={15} />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {feeStructureForm.feeItems.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
                          <InputField
                            label="Fee Type"
                            value={item.feeType}
                            onChange={(e) =>
                              handleFeeItemChange(
                                index,
                                "feeType",
                                e.target.value
                              )
                            }
                            placeholder="Tuition Fee"
                          />

                          <InputField
                            label="Amount"
                            type="number"
                            min="0"
                            value={item.amount}
                            onChange={(e) =>
                              handleFeeItemChange(
                                index,
                                "amount",
                                e.target.value
                              )
                            }
                            placeholder="45000"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeFeeItem(index)
                            }
                            className="flex h-10 items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl bg-blue-50 p-4">
                <span className="text-sm font-semibold text-blue-800">
                  Total Fee
                </span>

                <span className="text-xl font-bold text-blue-700">
                  {formatCurrency(calculatedFeeTotal)}
                </span>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeeStructureModal(false);
                    resetFeeStructureForm();
                  }}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {editingFeeStructure
                    ? "Update Structure"
                    : "Create Structure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStudentFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5">
          <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Assign Student Fee
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Assign an existing fee structure to a
                  student.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowStudentFeeModal(false)
                }
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={submitStudentFee}
              className="p-4 sm:p-6"
            >
              <div className="space-y-4">
                <SelectField
                  label="Student"
                  required
                  value={studentFeeForm.studentId}
                  onChange={(e) =>
                    handleStudentFeeStudentChange(
                      e.target.value
                    )
                  }
                  options={students.map((student) => ({
                    value: student._id,
                    label: `${getStudentName(
                      student
                    )}${
                      student.studentId
                        ? ` (${student.studentId})`
                        : ""
                    }`,
                  }))}
                />

                <SelectField
                  label="Fee Structure"
                  required
                  value={studentFeeForm.feeStructureId}
                  onChange={(e) =>
                    setStudentFeeForm((prev) => ({
                      ...prev,
                      feeStructureId:
                        e.target.value,
                    }))
                  }
                  options={availableStudentFeeStructures.map(
                    (fee) => ({
                      value: fee._id,
                      label: `${fee.courseId?.courseCode || ""} - ${
                        fee.branchId?.branchCode || ""
                      } - ${getSemesterName(
                        fee.semesterId
                      )} - ${
                        fee.academicYear
                      } (${formatCurrency(
                        fee.totalAmount
                      )})`,
                    })
                  )}
                />

                {selectedStudentFeeStructure && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-blue-600">
                          Total Fee
                        </p>
                        <p className="mt-1 font-bold text-blue-900">
                          {formatCurrency(
                            selectedStudentFeeStructure.totalAmount
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-blue-600">
                          Academic Year
                        </p>
                        <p className="mt-1 font-bold text-blue-900">
                          {
                            selectedStudentFeeStructure.academicYear
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    label="Discount"
                    type="number"
                    min="0"
                    value={studentFeeForm.discount}
                    onChange={(e) =>
                      setStudentFeeForm((prev) => ({
                        ...prev,
                        discount: e.target.value,
                      }))
                    }
                    placeholder="0"
                  />

                  <InputField
                    label="Due Date"
                    type="date"
                    required
                    value={studentFeeForm.dueDate}
                    onChange={(e) =>
                      setStudentFeeForm((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                  />
                </div>

                {selectedStudentFeeStructure && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Payable Amount
                      </span>

                      <span className="text-xl font-bold text-gray-900">
                        {formatCurrency(
                          studentFeePayableAmount
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <TextAreaField
                  label="Remarks"
                  value={studentFeeForm.remarks}
                  onChange={(e) =>
                    setStudentFeeForm((prev) => ({
                      ...prev,
                      remarks: e.target.value,
                    }))
                  }
                  placeholder="Scholarship, concession, special note..."
                />
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowStudentFeeModal(false)
                  }
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Assign Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5">
          <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Record Fee Payment
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Record a student fee installment.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPaymentModal(false)
                }
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={submitPayment}
              className="p-4 sm:p-6"
            >
              <div className="space-y-4">
                <SelectField
                  label="Student Fee"
                  required
                  value={paymentForm.studentFeeId}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      studentFeeId:
                        e.target.value,
                    }))
                  }
                  options={studentFees
                    .filter(
                      (fee) =>
                        Number(fee.dueAmount) > 0
                    )
                    .map((fee) => ({
                      value: fee._id,
                      label: `${getStudentName(
                        fee.studentId
                      )} - Due ${formatCurrency(
                        fee.dueAmount
                      )} - ${
                        fee.academicYear
                      }`,
                    }))}
                />

                {selectedPaymentStudentFee && (
                  <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-500">
                        Payable
                      </p>
                      <p className="mt-1 font-bold text-gray-900">
                        {formatCurrency(
                          selectedPaymentStudentFee.payableAmount
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Paid
                      </p>
                      <p className="mt-1 font-bold text-emerald-600">
                        {formatCurrency(
                          selectedPaymentStudentFee.paidAmount
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Due
                      </p>
                      <p className="mt-1 font-bold text-red-600">
                        {formatCurrency(
                          selectedPaymentStudentFee.dueAmount
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    label="Payment Amount"
                    required
                    type="number"
                    min="1"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder="20000"
                  />

                  <SelectField
                    label="Payment Method"
                    required
                    value={paymentForm.paymentMethod}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        paymentMethod:
                          e.target.value,
                      }))
                    }
                    options={[
                      {
                        value: "Cash",
                        label: "Cash",
                      },
                      {
                        value: "UPI",
                        label: "UPI",
                      },
                      {
                        value: "Card",
                        label: "Card",
                      },
                      {
                        value: "Net Banking",
                        label: "Net Banking",
                      },
                      {
                        value: "Bank Transfer",
                        label: "Bank Transfer",
                      },
                      {
                        value: "Cheque",
                        label: "Cheque",
                      },
                    ]}
                  />

                  <InputField
                    label="Payment Date"
                    required
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        paymentDate:
                          e.target.value,
                      }))
                    }
                  />

                  <InputField
                    label="Transaction ID"
                    value={paymentForm.transactionId}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        transactionId:
                          e.target.value,
                      }))
                    }
                    placeholder="UPI / Bank transaction ID"
                  />

                  <InputField
                    label="Receipt Number"
                    value={paymentForm.receiptNumber}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        receiptNumber:
                          e.target.value,
                      }))
                    }
                    placeholder="Leave blank for auto-generated"
                  />
                </div>

                <TextAreaField
                  label="Remarks"
                  value={paymentForm.remarks}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      remarks: e.target.value,
                    }))
                  }
                  placeholder="Payment note..."
                />
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowPaymentModal(false)
                  }
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {viewData.type === "structure"
                    ? "Fee Structure Details"
                    : viewData.type === "student-fee"
                    ? "Student Fee Details"
                    : "Payment Details"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setViewData(null);
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-4 sm:p-6">
              {viewData.type === "structure" && (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoBox
                      label="Course"
                      value={getCourseName(
                        viewData.courseId
                      )}
                    />

                    <InfoBox
                      label="Branch"
                      value={getBranchName(
                        viewData.branchId
                      )}
                    />

                    <InfoBox
                      label="Semester"
                      value={getSemesterName(
                        viewData.semesterId
                      )}
                    />

                    <InfoBox
                      label="Academic Year"
                      value={viewData.academicYear}
                    />
                  </div>

                  <div>
                    <h3 className="mb-3 font-semibold text-gray-900">
                      Fee Items
                    </h3>

                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      {viewData.feeItems?.map(
                        (item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0"
                          >
                            <span className="text-sm text-gray-600">
                              {item.feeType}
                            </span>

                            <span className="font-semibold text-gray-900">
                              {formatCurrency(
                                item.amount
                              )}
                            </span>
                          </div>
                        )
                      )}

                      <div className="flex items-center justify-between bg-blue-50 px-4 py-4">
                        <span className="font-semibold text-blue-800">
                          Total
                        </span>

                        <span className="text-lg font-bold text-blue-700">
                          {formatCurrency(
                            viewData.totalAmount
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {viewData.type === "student-fee" && (
                <>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {getStudentName(
                          viewData.studentId
                        )}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        {viewData.studentId?.studentId ||
                          viewData.studentId?.rollNumber ||
                          "-"}
                      </p>
                    </div>

                    <StatusBadge
                      status={viewData.status}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <InfoBox
                      label="Total"
                      value={formatCurrency(
                        viewData.totalAmount
                      )}
                    />

                    <InfoBox
                      label="Discount"
                      value={formatCurrency(
                        viewData.discount
                      )}
                    />

                    <InfoBox
                      label="Payable"
                      value={formatCurrency(
                        viewData.payableAmount
                      )}
                    />

                    <InfoBox
                      label="Paid"
                      value={formatCurrency(
                        viewData.paidAmount
                      )}
                    />

                    <InfoBox
                      label="Due"
                      value={formatCurrency(
                        viewData.dueAmount
                      )}
                    />

                    <InfoBox
                      label="Due Date"
                      value={formatDate(
                        viewData.dueDate
                      )}
                    />
                  </div>

                  <InfoBox
                    label="Academic Year"
                    value={viewData.academicYear}
                  />

                  {viewData.remarks && (
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-medium text-gray-500">
                        Remarks
                      </p>

                      <p className="mt-1 text-sm text-gray-800">
                        {viewData.remarks}
                      </p>
                    </div>
                  )}
                </>
              )}

              {viewData.type === "payment" && (
                <>
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-xs text-emerald-600">
                      Payment Amount
                    </p>

                    <p className="mt-1 text-2xl font-bold text-emerald-700">
                      {formatCurrency(
                        viewData.amount
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoBox
                      label="Receipt Number"
                      value={
                        viewData.receiptNumber || "-"
                      }
                    />

                    <InfoBox
                      label="Student"
                      value={getStudentName(
                        viewData.studentId
                      )}
                    />

                    <InfoBox
                      label="Payment Method"
                      value={
                        viewData.paymentMethod || "-"
                      }
                    />

                    <InfoBox
                      label="Transaction ID"
                      value={
                        viewData.transactionId || "-"
                      }
                    />

                    <InfoBox
                      label="Payment Date"
                      value={formatDate(
                        viewData.paymentDate
                      )}
                    />

                    <div className="rounded-xl border border-gray-200 p-3">
                      <p className="text-xs font-medium text-gray-500">
                        Status
                      </p>

                      <div className="mt-2">
                        <StatusBadge
                          status={viewData.status}
                        />
                      </div>
                    </div>
                  </div>

                  {viewData.remarks && (
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-medium text-gray-500">
                        Remarks
                      </p>

                      <p className="mt-1 text-sm text-gray-800">
                        {viewData.remarks}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={21} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              Confirm Delete
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete this record?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="pointer-events-none fixed bottom-5 right-5 z-40 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-lg">
          Loading...
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-600">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        required={required}
        className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({
  label,
  required = false,
  value,
  onChange,
  options,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-600">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-9 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
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
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-600">
        {label}
      </span>

      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}

export default Fees;