from definitions import Reservation, Reservation_item, BookCopies
from flask import g
from datetime import datetime, timedelta
from sqlalchemy import update, select

def check_reservation_date(db):
    print("reservation date check start")
    current_date = datetime.today()+timedelta(days=9)

    expired_copy_ids = (
        select(Reservation_item.copy_id)
        .join(Reservation, Reservation.reservation_id == Reservation_item.reservation_id)
        .filter(Reservation.reservation_date < current_date)
        .subquery()
    )

    # Update the status of the book copies that are in the expired reservation items
    stmt = (
        update(BookCopies)
        .where(BookCopies.copy_id.in_(expired_copy_ids))  # Use the subquery to filter expired books
        .values(status=1)  # Set status to 'available'
    )

    # Execute the query
    db.execute(stmt)
    db.commit()

    print("reservation date checked")
