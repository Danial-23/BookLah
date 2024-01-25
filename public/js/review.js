var reviewsVisible = false;

function showReviewsModal() {
    if (currentFacilityId == null) {
        console.error("No facility selected");
        return;
    }

    var request = new XMLHttpRequest();
    request.open('GET', '/view-review-facility/' + currentFacilityId, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = function () {
        if (request.status === 200) {
            var reviews = JSON.parse(request.responseText);

            // Toggle the visibility of reviews
            if (!reviewsVisible) {
                displayReviews(reviews);
                document.getElementById('addReviewButton').style.display = 'block'; // Show Add Review button
            } else {
                hideReviews();
                document.getElementById('addReviewButton').style.display = 'none'; // Hide Add Review button
            }

            // Toggle "Reviews" button
            var reviewsButton = document.getElementById('reviewsButton');
            reviewsButton.innerText = reviewsVisible ? 'Reviews' : 'Close Reviews';

            // Toggle state variable
            reviewsVisible = !reviewsVisible;
        } else {
            console.error('Error fetching reviews:', request.responseText);
        }
    };
    request.onerror = function () {
        console.error('Network Error');
    };
    request.send();
}


function hideReviews() {
    var reviewsContainer = document.getElementById('reviewsContainer');
    reviewsContainer.style.display = 'none';
}

function addReview() {
    // Retrieve username from sessionStorage
    var currentUsername = sessionStorage.getItem('username');

    if (currentUsername) {
        // Set the username in the input field
        var usernameInput = document.getElementById('username');
        usernameInput.value = currentUsername;

        // Make the username field read-only
        usernameInput.readOnly = true;

        // Open the Add Review Modal
        $('#addReviewModal').modal('show');
    } else {
        console.error('No username found in sessionStorage');
    }
}

function displayReviews(reviews) {
    var html = '';
    var loggedInUsername = sessionStorage.getItem('username'); // Retrieve the logged-in username

    for (var i = 0; i < reviews.length; i++) {
        html += '<div class="review" style="margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">' +
            '<p><strong>User:</strong> ' + reviews[i].username + '</p>' +
            '<p><strong>Review:</strong> ' + reviews[i].review + '</p>' +
            '<p><strong>Date Posted:</strong> ' + reviews[i].datePosted + '</p>';

        // Only show Edit buttons for logged-in User
        if (reviews[i].username === loggedInUsername) {
            html += '<button class="edit-btn" style="margin-right: 5px; border: none; background: none; cursor: pointer;" onclick="editReview(\'' + reviews[i].username + '\', \'' + reviews[i].review.replace(/'/g, "\\'") + '\');"><i class="fas fa-edit"></i></button>'
        }

        html += '</div>';
    }
    var reviewsContainer = document.getElementById('reviewsContainer');
    reviewsContainer.innerHTML = html;
    reviewsContainer.style.display = 'block';
}

function submitReview() {
    const username = document.getElementById('username').value;
    const reviewBody = document.getElementById('reviewBody').value;

    //Check if the review body is blank
    if (!reviewBody.trim()) {
        // Display an error message
        document.getElementById('reviewError').innerText = 'Review body should not be blank';
        return;
    } else {
        // Clear any existing error message
        document.getElementById('reviewError').innerText = '';
    }

    //POST request to add the review
    fetch('/add-review', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            review: reviewBody,
            facilityId: currentFacilityId,
        }),
    })
        .then(response => {
            if (response.status === 201) {
                // Review added successfully
                $('#addReviewModal').modal('hide'); // Close the modal

                // Refresh the reviews list
                showReviewsModal();
            } else {
                document.getElementById('reviewError').innerText = 'Error submitting review';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('reviewError').innerText = 'Network or server error';
        });
}

function editReview(reviewUsername, reviewBody) {
    // Set the username and review in the modal fields
    document.getElementById('editUsername').value = reviewUsername;
    document.getElementById('editReviewBody').value = reviewBody;

    // Open Edit Review Modal
    $('#editReviewModal').modal('show');
}

function submitEditReview() {
    const editedUsername = document.getElementById('editUsername').value;
    const editedReviewBody = document.getElementById('editReviewBody').value;
    const facilityId = currentFacilityId;

    //Check if the review body is blank
    if (!editedReviewBody.trim()) {
        // Display an error message
        document.getElementById('reviewError').innerText = 'Review body should not be blank';
        return;
    } else {
        // Clear any existing error message
        document.getElementById('reviewError').innerText = '';
    }

    // Send updated review to server
    fetch('/edit-review', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            facilityId: facilityId,
            username: editedUsername,
            review: editedReviewBody
        }),
    })
        .then(response => {
            if (response.ok) {
                //successful edit
                $('#editReviewModal').modal('hide');
                // Refresh the reviews list
                showReviewsModal();
            } else {
                // Handle errors
                response.json().then(data => {
                    console.error('Error in editing review:', data.message);
                });
            }
        })
        .catch(error => {
            console.error('Network or server error:', error);
        });
}



