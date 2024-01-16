function register() {
    var response = "";
    var jsonData = new Object();
    
    jsonData.email = document.getElementById("email").value;
    jsonData.username=document.getElementById('username').value
    jsonData.password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    var username =document.getElementById('username').value
    
    if (jsonData.email == "" ||jsonData.username==""|| jsonData.password == "" || confirmPassword == "") {
        document.getElementById("error").innerHTML = 'All fields are required!';
        return;
    }
    else if (username.length < 6) {
        document.getElementById("error").innerHTML = 'Username must be at least 6 characters long!';
        return;
    }
    else if (jsonData.password.length<6) {
        document.getElementById("error").innerHTML = 'Password length should not be less than 6!';
        return;
    }
    else if (jsonData.password != confirmPassword) {
        document.getElementById("error").innerHTML = 'Password does not match!';
        return;
    }
    
    // var request = new XMLHttpRequest();

    // request.open("POST", "/register", true);
    // request.setRequestHeader('Content-Type', 'application/json');
    // request.onload = function() {
    //     response = JSON.parse(request.responseText);
    //     console.log(response)
    //     if (response.message == undefined) {
            
    //         sessionStorage.setItem("email", jsonData.email);
    //         window.location.href = 'home.html';
    //     }
    //     else {
    //         document.getElementById("error").innerHTML = 'Authentication failed!';
    //     }
    // };
    // request.send(JSON.stringify(jsonData));
    var request = new XMLHttpRequest();
    request.open("GET", "/all-user", true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = function () {
        var response = JSON.parse(request.responseText);
        console.log(response);

        var emailExists = response.some(function (user) {
            return user.email === jsonData.email;
        });

        if (emailExists) {
            document.getElementById("error").innerHTML = 'Email already exists!';
        } else {
            // Proceed with registration
            var registrationRequest = new XMLHttpRequest();
            registrationRequest.open("POST", "/register", true);
            registrationRequest.setRequestHeader('Content-Type', 'application/json');
            registrationRequest.onload = function () {
                response = JSON.parse(registrationRequest.responseText);
                console.log(response);
                if (response.message == undefined) {
                    sessionStorage.setItem("email", jsonData.email);
                    sessionStorage.setItem("username",jsonData.username)
                    window.location.href = 'home.html';
                } else {
                    document.getElementById("error").innerHTML = 'Authentication failed!';
                }
            };
            registrationRequest.send(JSON.stringify(jsonData));
        }
    };
    request.send();
}