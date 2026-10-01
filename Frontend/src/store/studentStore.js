import { create } from "zustand";
import axiosClient from "../services/axiosClient";

const useStudentStore = create((set) => ({
  student: null,
  loading: false,
  error: null,
  fetchStudent: async () => {
    try {
      set({ loading: true, error: null });
      const { data } = await axiosClient.get("/student/me");
      set({ student: data.student, loading: false, error: null });
    } catch (error) {
      set({ student: null, loading: false, error: error.response?.data?.message || "Failed to fetch student" });
    }
  },
  clearStudent: () => set({ student: null, loading: false, error: null }),
}));

export default useStudentStore;
