// import {
//   Eye,
//   Pencil,
//   Trash2,
// } from "lucide-react";

// function StudentTable({
//   students,
//   onView,
//   onEdit,
//   onDelete,
// }) {
//   return (
//     <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

//       <div className="overflow-x-auto">

//         <table className="w-full text-left">

//           <thead className="border-b border-slate-200 bg-slate-50">

//             <tr>
//               <th className="px-5 py-4 text-sm font-semibold">
//                 Student
//               </th>

//               <th className="px-5 py-4 text-sm font-semibold">
//                 Enrollment
//               </th>

//               <th className="px-5 py-4 text-sm font-semibold">
//                 Course
//               </th>

//               <th className="px-5 py-4 text-sm font-semibold">
//                 Branch
//               </th>

//               <th className="px-5 py-4 text-sm font-semibold">
//                 Semester
//               </th>

//               <th className="px-5 py-4 text-sm font-semibold">
//                 Actions
//               </th>
//             </tr>

//           </thead>

//           <tbody>

//             {students.map((student) => (

//               <tr
//                 key={student._id}
//                 className="border-b border-slate-100 hover:bg-slate-50"
//               >

//                 <td className="px-5 py-4">

//                   <div>
//                     <p className="font-semibold text-slate-900">
//                       {student.userId?.name}
//                     </p>

//                     <p className="text-xs text-slate-500">
//                       {student.userId?.email}
//                     </p>
//                   </div>

//                 </td>

//                 <td className="px-5 py-4 text-sm">
//                   {student.enrollmentNumber}
//                 </td>

//                 <td className="px-5 py-4 text-sm">
//                   {student.course}
//                 </td>

//                 <td className="px-5 py-4 text-sm">
//                   {student.branch}
//                 </td>

//                 <td className="px-5 py-4 text-sm">
//                   {student.semester}
//                 </td>

//                 <td className="px-5 py-4">

//                   <div className="flex gap-2">

//                     <button
//                       onClick={() => onView(student._id)}
//                       className="rounded-lg p-2 hover:bg-slate-100"
//                     >
//                       <Eye size={17} />
//                     </button>

//                     <button
//                       onClick={() => onEdit(student)}
//                       className="rounded-lg p-2 hover:bg-slate-100"
//                     >
//                       <Pencil size={17} />
//                     </button>

//                     <button
//                       onClick={() => onDelete(student._id)}
//                       className="rounded-lg p-2 text-red-600 hover:bg-red-50"
//                     >
//                       <Trash2 size={17} />
//                     </button>

//                   </div>

//                 </td>

//               </tr>

//             ))}

//           </tbody>

//         </table>

//       </div>

//     </div>
//   );
// }

// export default StudentTable;

import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

function StudentTable({
  students,
  onView,
  onEdit,
  onDelete,
}) {
  const getStudentName = (student) => {
    return (
      student.userId?.name ||
      "Unknown Student"
    );
  };

  const getStudentEmail = (student) => {
    return (
      student.userId?.email ||
      "No email"
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-[900px] w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70">
            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Student
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Enrollment
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Course
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Branch
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Semester
            </th>

            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => (
            <tr
              key={student._id}
              className="border-b border-slate-100 transition hover:bg-slate-50"
            >
              {/* STUDENT */}
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                    {getStudentName(
                      student
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {getStudentName(
                        student
                      )}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {getStudentEmail(
                        student
                      )}
                    </p>
                  </div>
                </div>
              </td>

              {/* ENROLLMENT */}
              <td className="px-5 py-4">
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  {student.enrollmentNumber ||
                    "-"}
                </span>
              </td>

              {/* COURSE */}
              <td className="px-5 py-4 text-sm text-slate-700">
                {student.course || "-"}
              </td>

              {/* BRANCH */}
              <td className="px-5 py-4 text-sm text-slate-700">
                {student.branch || "-"}
              </td>

              {/* SEMESTER */}
              <td className="px-5 py-4 text-sm text-slate-700">
                {student.semester
                  ? `Semester ${student.semester}`
                  : "-"}
              </td>

              {/* ACTIONS */}
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  {/* VIEW */}
                  <button
                    type="button"
                    onClick={() =>
                      onView(student._id)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                    title="View student"
                  >
                    <Eye size={16} />
                  </button>

                  {/* EDIT */}
                  <button
                    type="button"
                    onClick={() =>
                      onEdit(student)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                    title="Edit student"
                  >
                    <Pencil size={16} />
                  </button>

                  {/* DELETE */}
                  <button
                    type="button"
                    onClick={() =>
                      onDelete(student)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 transition hover:border-red-200 hover:bg-red-50"
                    title="Delete student"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentTable;