class Booking {
    constructor(name, facility, date, time) {
        this.name = name;
        this.facility = facility;
        this.date = date;
        this.time = time;

        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        this.id = timestamp + "" + random.toString().padStart(3, '0');
    }
}

module.exports = {Booking};