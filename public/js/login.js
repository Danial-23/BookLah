function login() {
    var response = "";
    var jsonData = new Object();
    jsonData.email = document.getElementById("email").value;
    jsonData.password = document.getElementById("password").value;
    if (jsonData.email == "" || jsonData.password == "") {
        document.getElementById("error").innerHTML = 'All fields are required!';
        return;
    }
    var request = new XMLHttpRequest();
    request.open("POST", "/login", true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = function() {
        response = JSON.parse(request.responseText);
        console.log(response)
        if (response.message == "Login successful!") {
            sessionStorage.setItem("email", jsonData.email);
            window.location.href = 'home.html';
        }
        else {
            document.getElementById("error").innerHTML = 'Invalid credentials!';
        }
    };
    request.send(JSON.stringify(jsonData));
}
function viewUser(){
    var request = new XMLHttpRequest();
    request.open("GET", "/all-user", true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = function() {
        response = JSON.parse(request.responseText);
        console.log(response)
        
    };
    request.send();
}