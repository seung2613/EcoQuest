$(document).ready(() => {
  
  // setting encrypted and secure user token
  $.ajaxSetup({
    headers: {
      "auth-token": localStorage.getItem("auth-token")
    }
  });

  //Updates background according to the active background user has equipped.
  function updateCosmetics() {
    $.ajax({
      type: "get",
      url: "/users/updateCosmetics",
      success: function(data) {
        $("#char").prop("src", data.activeAvatar.imageLink);
        $("#avatar").css(
          "background-image",
          `url(${data.activePlatform.imageLink})`
        );
        $("html").css(
          "background-image",
          `url(${data.activeBackground.imageLink})`
        );
        $("#avatar").toggleClass("bounceIn");
      },
      error: function(e) {
        console.log(e.responseText);
      }
    });
  }

  //Gets item id from server
  function getItem(itemId, cb) {
    $.ajax({
      type: "get",
      url: `/items/${itemId}`,
      success: cb,
      error: function(e) {
        console.log(e.responseText);
      }
    });
  }

  //Gets relevant user info 
  function getUserInfo(callback) {
    $.ajax({
      type: "get",
      url: "/login/me",
      success: function(data) {
        callback(data);
      },
      error: function(e) {
        console.log(e.responseText);
        callback("Unknown");
      }
    });
  }

  /** Grabs user's username and appends to it welcome text */
  function setProfileInfo(user) {
    let welcome = $("#title");
    welcome.text("Welcome, " + user.username + "!");
  }

  /** Takes user to create room page */
  $("#create").click(() => {
    window.location.href = "game";
  });

  /** Takes user to join room page */
  // $("#join").click(() => {
  //   window.location.href = "game";
  // });
  $('#join').prop('disabled', true);


  /** Takes user to join room page */
  $("#cards").click(() => {
    window.location.href = "mycard";
  });

  /** Takes user back to signup/signin page */
  $("#logout").click(() => {
    window.location.href = "/";
  });

  /** Takes user back to shop page */
  $("#shop").click(() => {
    window.location.href = "/shop";
  });

  /** Takes user back to mycard page */
  $("#myCards").click(() => {
    window.location.href = "/mycard";
  });

  /** Takes user back to mycard page */
  $("#aboutUs").click(() => {
    window.location.href = "/aboutUs";
  });

  //Ensures user info is grabbed first before any cosmetics changes happen
  getUserInfo(user => {
    setProfileInfo(user);
    updateCosmetics();
  });
});