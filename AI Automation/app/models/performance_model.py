import numpy as np

from sklearn.ensemble import RandomForestClassifier


class StudentRiskModel:

    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
        )

        self.train()

    def train(self):
        X = np.array([
            [95, 85, 90, 5, 88],
            [90, 80, 85, 4, 82],
            [85, 75, 80, 4, 78],
            [80, 70, 75, 3, 72],
            [75, 65, 70, 3, 68],
            [70, 60, 65, 2, 64],
            [65, 55, 60, 2, 58],
            [60, 50, 55, 2, 55],
            [55, 45, 50, 1, 50],
            [50, 40, 45, 1, 45],
            [45, 35, 40, 1, 40],
            [40, 30, 35, 0, 35],
        ])

        y = np.array([
            "LOW",
            "LOW",
            "LOW",
            "LOW",
            "LOW",
            "MEDIUM",
            "MEDIUM",
            "MEDIUM",
            "HIGH",
            "HIGH",
            "HIGH",
            "HIGH",
        ])

        self.model.fit(X, y)

    def predict(
        self,
        attendance,
        internal_marks,
        assignment_score,
        study_hours,
        previous_marks,
    ):
        features = [[
            attendance,
            internal_marks,
            assignment_score,
            study_hours,
            previous_marks,
        ]]

        return self.model.predict(features)[0]