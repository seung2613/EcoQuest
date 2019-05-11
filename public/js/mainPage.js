// var request = require('request-promise');
// const jwt = require('jsonwebtoken');
// const express = require('express');
//
// const router = express.Router();

$(document).ready(() => {

    $.ajaxSetup({
        headers: {
            'auth-token': localStorage.getItem('auth-token')
        }
    });

    let print = user => {
        console.log(JSON.stringify(user));
    };

    function getUserInfo(callback) {
        console.log('sign in');
        $.ajax({
            type: 'get',
            url: '/login/me',
            success: function(data) {
                console.log(data);
                callback(data.user)
            },
            error: function(e) {
                console.log(e.responseText);
                callback("Unknown");
            }
        });
    }

    function setProfileInfo(user) {
        let welcome = $('#welcome');
        welcome.text("Welcome, " + user.username + "!");
    }

    getUserInfo(setProfileInfo);

    $("#create").click(() => {
        window.location.href = "createRoom";
    });


        $("#join").click(() => {
            window.location.href = "joinRoom";
        });

    $("#logout").click(() => {
        window.location.href = "/";
    });
});