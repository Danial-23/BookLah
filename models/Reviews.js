class Reviews{
    constructor(facilityId,username,review){
        this.facilityId = facilityId;
        this.username = username;
        this.review = review

        // // Creating Unique ID
        // const timestamp = new Date().getTime(); 
        // const random = Math.floor(Math.random() * 1000); 
        // this.id = timestamp + "" + random.toString().padStart(3, '0'); 
    }
}
module.exports={Reviews}

