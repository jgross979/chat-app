$(document).ready(function() {
    // Getting references to our form and input
    const signUpForm = $("form.signup");
    const usernameInput = $("input#un-input");
    const passwordInput = $("input#password-input");

    // When the signup button is clicked, we validate the email and password are not blank
    signUpForm.on("submit", function(event) {
        event.preventDefault();
        const userData = {
            username: usernameInput.val().trim(),
            password: passwordInput.val().trim()
        };

        if (!userData.username || !userData.password) {
            return;
        }
        // If we have an email and password, run the signUpUser function
        signUpUser(userData.username, userData.password);
        usernameInput.val("");
        passwordInput.val("");
    });

    // Does a post to the signup route. If succesful, we are redirected to the members page
    // Otherwise we log any errors
    function signUpUser(username, password) {
        $.post("/api/signup", {
            username: username,
            password: password
        }).then(function(data) {
            console.log(password);
            // window.location.replace(data);
            // If there's an error, handle it by throwing up a boostrap alert
        }).catch(handleLoginErr);
    }

    function handleLoginErr(err) {
        $("#alert .msg").text(err.responseJSON);
        $("#alert").fadeIn(500);
    }
});