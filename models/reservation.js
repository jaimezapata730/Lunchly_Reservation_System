/** Reservation for Lunchly */

const moment = require("moment");
const ExpressError = require("../../express-pg-oo-demo/VideoCode/expressError");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  //methods for get/set # of guests
  set numGuests(val) {
    if (val < 1) throw new ExpressError("Cannot be less than 1 guest per reservation!");
    this._numGuests = val;
  }

  get numGuests() {
    return this._numGuests;
  }

  //methods for get/set startAt time

  set startAt(val) {
    if (val instanceof Date && !isNaN(val))this._startAt = val;
    else throw new ExpressError("Not a valid input")
  }

  get startAt() {
    return this._startAt;
  }
  /** formatter for startAt */

  get formattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  // /** methods for getting/setting notes (keep as empty string, not NULL) */

  set notes(val) {
    this._notes = val || "";
  }

  get notes() {
    return this._notes;
  }

/** methods for setting/getting customer ID: can only set once. */

  set customerId(val) {
    if (this._customerId && this._customerId !== val)
      throw new ExpressError("Customer ID cannot be edit it");
    this._customerId = val;
  }

  get customerId() {
    return this._customerId;
  }
  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  // find reservation by ID

  static async get(id) {
    const res = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes 
         FROM reservations 
         WHERE id = $1`,
        [id]
    );
    let reservation = res.rows[0];
    if (reservation === undefined) {
      throw new ExpressError(`No such reservation: ${id}`,404);
    }
    return new Reservation(reservation);
  }

  //save a reservation

  async save() {
    if (this.id === undefined) {
      const res = db.query(`INSERT INTO reservations (customer_id, num_guests, start_at, notes) VALUES
          ($1, $2, $3, $4) RETURNING id`, [this.customerId, this.numGuests, this.startAt, this.notes]);
    
    this.id - res.rows[0].id;
  } else {
    await db,query(`UPDATE reservations SET num_guest=$1, start_at=$2, notes=$3 WHERE id=$4`,
    [this.numGuests, this.startAt, this.notes, this.id]);
    }
  }

}


module.exports = Reservation;
