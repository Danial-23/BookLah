
function viewResources() {
    
    var response = '';
    var request = new XMLHttpRequest();
    request.open('GET', '/view-facility', true);
    request.setRequestHeader('Content-Type', 'application/json');
    
    request.onload = function () {
        response = JSON.parse(request.responseText);
        console.log(response)
        var html = ''
        for (var i = 0; i < response.length; i++)
        {
            html += '<div class="facility-container"style="border: 1px solid #ccc; padding: 10px;"onclick="showFacilityDetails(this)" data-toggle="modal" data-target="#proModal" item="' + i + '">' +
                '<img src="' + response[i].image + '" alt="Facility Image" style="max-width:200px; max-height:200px;">' +
                '<div class="facility-details"item="'+i+'">' +
                '<br>'+
                // '<p><strong>Facility ID:</strong> ' + response[i].facilityId + '</p>' +
                '<p><strong>Facility: </strong> ' + response[i].facility_name + '</p>' +
                '<p><strong>Address:</strong> ' + response[i].address + '</p>' +
                '<img class="comment float-right" src="images/comment.png" alt="Comment Image"style="width: 30px; height: 30px;">'+
                '<br>'+
                
                '</div>' +
                
                '</div>';
                '<br>'
        }
        document.getElementById('tableContent').innerHTML = html;
        var facility_array = JSON.parse(request.responseText);
        console.log(facility_array)
    };
    request.send();
    
    
    //console.log(response.JSON)
}

function showFacilityDetails(element) {
    var facility_array=[]
    var request = new XMLHttpRequest();
    request.open('GET', '/view-facility', true);  
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = function () {
      
        facility_array = JSON.parse(request.responseText);

        console.log(facility_array) // output to console   
        var item = element.getAttribute("item");
        currentIndex = item;
        console.log(item)
        document.getElementById("name").textContent = facility_array[item].facility_name;
        document.getElementById("image").src = facility_array[item].image;
        document.getElementById("address").textContent = facility_array[item].address;     
    };

    request.send();

    
}
function setHTML(){
    var email =sessionStorage.getItem('email')
    console.log(email)
    if (email) {
        window.location.href = 'home.html';
    } else {
        // Redirect to 'index.html' if email is not set
        window.location.href = 'index.html';
        
    }
}

function logout(){
    sessionStorage.removeItem('email')
    window.location.href = 'index.html';
}

