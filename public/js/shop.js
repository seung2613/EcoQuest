$(document).ready(() => {
  //Selected Item
  let selectedItem;

  //Relevant user info
  let currentUserInfo;

  // setting encrypted and secure user token
  $.ajaxSetup({
    headers: {
      "auth-token": localStorage.getItem("auth-token")
    }
  });

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

  //Displays user's point on front end
  function setPointBalance(user) {
    $("#points").text(user.points);
  }

  //Lets user know what item was equipped
  function setUserActive(item) {
    $.ajax({
      type: "put",
      url: `/users/${item.category}/${item._id}`,
      success: function(data) {
        M.Toast.dismissAll();
        M.toast({
          html: `Equipped: ${data.name}`,
          classes: "greencolor",
          displayLength: 2500
        });
      },
      err: function(err) {
        console.log(err);
      }
    });
  }

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

  /** When user attempts to buy an item */
  $("#buy").click(() => {
    $.ajax({
      url: `/items/${selectedItem}`,
      dataType: "json",
      type: "put",
      success: function(data) {
        $(`#${data._id}`)
          .children("#cost4")
          .text("Owned");
        $("#buy").addClass("disabled");
        getUserInfo(setPointBalance);
        getUserInfo(userInfo => (currentUserInfo.items = userInfo.items));
        M.Toast.dismissAll();
        M.toast({
          html: `Purchased: ${data.name}`,
          classes: "greencolor",
          displayLength: 2500

        });
        setUserActive(data);
      },
      error: function(err) {
        console.log("ERROR: ", err.responseText);
        M.Toast.dismissAll();
        M.toast({
          html: err.responseText,
          classes: "redcolor",
          displayLength: 2500
        });
      }
    });
  });

  //On menu resize, reduces size of button
  $(window).resize(function() {
    if ($(window).width() < 400) {
      $("#back").html("<i class='material-icons'>home</i>");
      $("#shopBackground").html("BG");
      $("#shopPlatform").css("padding-left", "10px");
    } else {
      $("#back i").addClass("left");
      $("#back").html("Main Menu<i class='material-icons left'>home</i>");
      $("#shopBackground").html("Background");
      $("#shopPlatform").css("padding-left", "16px");
    }
  });

  //Takes user back to main page
  $("#back").click(() => {
    window.location.href = "main";
  });

  //Grabs all items info from database
  function getItems(category, cb) {
    $.ajax({
      url: `/items/category/${category}`,
      dataType: "json",
      type: "get",
      success: function(data) {
        cb(data);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log("ERROR:", jqXHR, textStatus, errorThrown);
      }
    });
  }

  //Dynamically populates image carousel
  function populateCarousel(items) {
    let innerHtml = "";

    // Create display for each item
    for (let item of items) {
      innerHtml += `
        <div id=${item._id} class="carousel-item">
          <div class="singleGalleryTitle"> ${item.name}</div>
          <i class="material-icons left">filter_vintage</i>
          <div id="cost4" class="itemCost"> ${item.cost}</div>
        </div>`;
    }

    $("#slideAvatar").html(innerHtml);

    // Set click interaction for each item
    for (let item of items) {
      $(`#${item._id}`).click(() => {
        if (currentUserInfo.items.find(userItem => userItem === item._id)) {
          $("#buy").addClass("disabled");
          localStorage.setItem(item.category, item.imageLink);
          setUserActive(item);
        } else {
          $("#buy").removeClass("disabled");
        }

        if (item.category === "avatar") {
          $("#char").prop("src", item.imageLink);
        } else if (item.category === "platform") {
          $("#avatar").css("background-image", `url(${item.imageLink})`);
        } else if (item.category === "background") {
          $("html").css("background-image", `url(${item.imageLink})`);
        }

        selectedItem = item._id;
      });

      // Set image for each item and update price if they own it
      $(`#${item._id}`).css("background-image", `url(${item.shopIcon})`);
      if (currentUserInfo.items.find(userItem => userItem === item._id)) {
        $(`#${item._id}`)
          .children("#cost4")
          .text("Owned");
      }
    }

    if ($(".carousel").hasClass("initialized")) {
      $(".carousel").removeClass("initialized");
    }

    $(".carousel").carousel();
  }

  //Selects avatar category
  $("#shopAvatar").click(() => {
    $("#buy").addClass("disabled");
    $("#shopPlatform").css("background-color", "#26a69a");
    $("#shopBackground").css("background-color", "#26a69a");
    $("#shopAvatar").css("background-color", "#55B1C1");
    getItems("avatar", populateCarousel);
  });

  //Selects platform category
  $("#shopPlatform").click(() => {
    $("#buy").addClass("disabled");
    $("#shopAvatar").css("background-color", "#26a69a");
    $("#shopBackground").css("background-color", "#26a69a");
    $("#shopPlatform").css("background-color", "#55B1C1");
    getItems("platform", populateCarousel);
  });

  //Selects background category
  $("#shopBackground").click(() => {
    $("#buy").addClass("disabled");
    $("#shopPlatform").css("background-color", "#26a69a");
    $("#shopAvatar").css("background-color", "#26a69a");
    $("#shopBackground").css("background-color", "#55B1C1");
    getItems("background", populateCarousel);
  });

  // Calling all page setup functions
  getUserInfo(user => {
    currentUserInfo = user;
    setPointBalance(user);
    updateCosmetics();
    $("#shopAvatar").trigger("click");
  });
});
