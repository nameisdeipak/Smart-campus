import { useEffect, useState } from "react";
import axios from "axios";

function StudentSelector({
  selectedStudent,
  setSelectedStudent,
}) {

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    axios
      .get("http://127.0.0.1:8000/students")

      .then((response) => {

        setStudents(response.data.students);

        setLoading(false);

      })

      .catch((error) => {

        console.error(
          "Student API Error:",
          error
        );

        setLoading(false);

      });

  }, []);


  return (

    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

      <div>

        <p className="text-sm text-slate-500">
          Current Student
        </p>

        <p className="font-semibold text-slate-900">
          Select student to view AI insights
        </p>

      </div>


      <select
        value={selectedStudent}
        onChange={(e) =>
          setSelectedStudent(e.target.value)
        }
        disabled={loading}
        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
      >

        {loading ? (

          <option>
            Loading students...
          </option>

        ) : (

          students.map((student) => (

            <option
              key={student}
              value={student}
            >
              {student}
            </option>

          ))

        )}

      </select>

    </div>

  );
}

export default StudentSelector;