from definitions import User, Fines, Loans
from flask import jsonify

def get_user_fines(db, username):
        # Query the user by username
        user = db.query(User).filter(User.username == username).first()

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Get the user's ID
        user_id = user.user_id

        # Query fines associated with the user's loans
        fines = (
            db.query(Fines, Loans, User.username)
            .join(Loans, Fines.loan_id == Loans.loan_id)
            .join(User, Loans.Reader_user_id == User.user_id)
            .filter((Loans.Reader_user_id == user_id)&(Fines.paid == False))
            .all()
        )

        fines_list = [
            {
                "username": fine[2],
                "amount": float(fine[0].amount),
                "paid": fine[0].paid,
                "fine_id": fine[0].fine_id
            }
            for fine in fines
        ]

        return fines_list