from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from app.models.performance_model import StudentRiskModel


router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"],
)

risk_model = StudentRiskModel()


class StudentData(BaseModel):
    student_id: str
    attendance: float
    internal_marks: float
    assignment_score: float
    study_hours: float = 0
    previous_marks: float


class BulkStudentData(BaseModel):
    students: List[StudentData]


@router.post("/risk")
def predict_risk(data: StudentData):
    risk = risk_model.predict(
        data.attendance,
        data.internal_marks,
        data.assignment_score,
        data.study_hours,
        data.previous_marks,
    )

    return {
        "success": True,
        "student_id": data.student_id,
        "risk": risk,
    }


@router.post("/risk-bulk")
def predict_bulk_risk(data: BulkStudentData):
    if not data.students:
        return {
            "success": True,
            "predictions": [],
        }

    features = [
        [
            student.attendance,
            student.internal_marks,
            student.assignment_score,
            student.study_hours,
            student.previous_marks,
        ]
        for student in data.students
    ]

    predictions = risk_model.model.predict(features)

    results = []

    for student, prediction in zip(
        data.students,
        predictions,
    ):
        results.append(
            {
                "student_id": student.student_id,
                "risk": prediction,
            }
        )

    return {
        "success": True,
        "total": len(results),
        "predictions": results,
    }