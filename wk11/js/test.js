$(document).ready(function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAXJ_o4mZkUkcZcXBihyJqRFfJ1z4Y9zgk",
    authDomain: "firewk11.firebaseapp.com",
    databaseURL: "https://firewk11.firebaseio.com",
    projectId: "firewk11",
    storageBucket: "firewk11.appspot.com",
    messagingSenderId: "403100983255"

   };
  firebase.initializeApp(config);

  var dbRef = firebase.database().ref();
  // Firebase database reference
  var dbChatRoom = firebase.database().ref().child('chatroom');
  var dbUser = firebase.database().ref().child('user');

  var photoURL;
  var $img = $('img');

  // REGISTER DOM ELEMENTS
  const $email = $('#email');
  const $password = $('#password');
  const $btnSignIn = $('#btnSignIn');
  const $btnSignUp = $('#btnSignUp');
  const $btnSignOut = $('#btnSignOut');
  const $btnModify = $('#btnModify');
  const $btnChat = $('#btnChat');
  const $btnProfile = $('#btnProfile');
  const $hovershadow = $('.hover-shadow');
  const $btnSubmit = $('#btnSubmit');
  const $signInfo = $('#sign-info');
  const $file = $('#file');
  const $profileName = $('#profile-name');
  const $profileEmail = $('#profile-email');
  const $profileOccupation = $('#profile-occupation');
  const $profileAge = $('#profile-age');
  const $profileDescriptions = $('#profile-descriptions');
  const $messageField = $('#messageInput');
  const $messageList = $('#messages');
  // Hovershadow
  $hovershadow.hover(
    function(){
      $(this).addClass("mdl-shadow--4dp");
    },
    function(){
      $(this).removeClass("mdl-shadow--4dp");
    }
  );

  var storageRef = firebase.storage().ref();

  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];

    var metadata = {
      'contentType': file.type
    };

    // Push to child path.
    // [START oncomplete]
    storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
      console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      console.log(snapshot.metadata);
      photoURL = snapshot.metadata.downloadURLs[0];
      console.log('File available at', photoURL);
    }).catch(function(error) {
      // [START onfailure]
      console.error('Upload failed:', error);
      // [END onfailure]
    });
    // [END oncomplete]
  }

  window.onload = function() {
    $file.change(handleFileSelect);
    // $file.disabled = false;
  }

  // SignIn/SignUp/SignOut Button status
  var user = firebase.auth().currentUser;
  if (user) {
    $btnSignIn.attr('disabled', 'disabled');
    $btnSignUp.attr('disabled', 'disabled');
    $btnSignOut.removeAttr('disabled')
  } else {
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled')
    $btnSignUp.removeAttr('disabled')
  }

  // Sign In
  $btnSignIn.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signIn
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);

    });
    promise.then(function(){
      console.log('SignIn User');
      window.location.href = './profile.html';
    });

  });

  // SignUp
  $btnSignUp.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signUp
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(user){
      console.log("SignUp user is "+user.email);
      const dbUserid = dbUser.child(user.uid);
      dbUserid.push({email:user.email});
    });
  });

  // Listening Login User
  firebase.auth().onAuthStateChanged(function(user){
    if(user) {
      console.log(user);
      const loginName = user.displayName || user.email;
      const photo = user.photoURL || "https://firebasestorage.googleapis.com/v0/b/firewk11.appspot.com/o/images%2F%E4%B8%8B%E8%BC%89.jpg?alt=media&token=6b469ab4-2df3-4d53-9bee-44e68a7cce1b";
      //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
      $signInfo.html(loginName+" is login...");
      $btnSignIn.attr('disabled', 'disabled');
      $btnSignUp.attr('disabled', 'disabled');
      $btnSignOut.removeAttr('disabled')
      $profileName.html(user.displayName);
      $profileEmail.html(user.email);
      firebase.database().ref('/user/' + user.uid).on('value', function(snapshot){
        $profileAge.html(snapshot.val().Age);
        $profileOccupation.html(snapshot.val().Occupation);
        $profileDescriptions.html(snapshot.val().Descriptions);
      });
      $img.attr("src", photo);

      dbChatRoom.limitToLast(100).on('child_added', function (snapshot) {
        //GET DATA
        var data = snapshot.val();
        var username = data.name || "anonymous";
        var message = data.text;
        var photoURL = data.photoURL || "https://firebasestorage.googleapis.com/v0/b/firewk11.appspot.com/o/images%2F%E4%B8%8B%E8%BC%89.jpg?alt=media&token=6b469ab4-2df3-4d53-9bee-44e68a7cce1b";
        //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
        var $messageElement = $("<li>");
        var $nameElement = $("<strong class='example-chat-username'></strong>");
        var $userImg = $("<img class='mdl-chip__contact' src=''></img>");
        $nameElement.text(username);
        $userImg.attr("src",photoURL);
        $messageElement.text(" " +message).prepend($nameElement);
        $messageElement.prepend($userImg);

        //ADD MESSAGE
        console.log(data.photoURL);
        $messageList.append($messageElement);

        //SCROLL TO BOTTOM OF MESSAGE LIST
        $messageList[0].scrollTop = $messageList[0].scrollHeight;
      });

    } else {
      console.log("not logged in");
      $profileName.html("N/A");
      $profileEmail.html("N/A");
      $profileAge.html("N/A");
      $profileOccupation.html("N/A");
      $profileDescriptions.html("N/A");
      $img.attr("src","");
      $messageList.html("");
    }
  });

  // SignOut
  $btnSignOut.click(function(){
    firebase.auth().signOut();
    console.log('LogOut');
    $signInfo.html('No one login...');
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled')
    $btnSignUp.removeAttr('disabled')
    window.location.href = './signInUp.html';
  });
  //
  $btnModify.click(function(){
    window.location.href = './update.html';
  });
  $btnChat.click(function(){
    window.location.href = './chatRoom.html';
  });
  $btnProfile.click(function(){
    window.location.href = './profile.html';
  });
  // Submit
  $btnSubmit.click(function(){
    var user = firebase.auth().currentUser;
    const $userName = $('#userName').val();
    const $userAge = $('#age').val();
    const $userOccupation = $('#occupation').val();
    const $userDescriptions = $('#descriptions').val();
    /*
    $('#userName').val("");
     ('#age').val("");
    $('#occupation').val("");
    $('#descriptions').val("");
    */
    const promise = user.updateProfile({
      displayName: $userName,
      photoURL: photoURL
    });
    const dbUserid = dbUser.child(user.uid);
    dbUserid.update({
      Age: $userAge,
      Occupation: $userOccupation,
      Descriptions: $userDescriptions,
    });
    firebase.database().ref('/user/' + user.uid).on('value', function(snapshot){
      $profileAge.html(snapshot.val().Age);
      $profileOccupation.html(snapshot.val().Occupation);
      $profileDescriptions.html(snapshot.val().Descriptions);
    });
    promise.then(function() {
      user = firebase.auth().currentUser;
      if (user) {
        $profileName.html(user.displayName);
        $profileEmail.html(user.email);
        $img.attr("src",user.photoURL);
        const loginName = user.displayName || user.email;
        $signInfo.html(loginName+" is login...");
      }
    });
    window.location.href = './profile.html';
  });

// chatroom
// LISTEN FOR KEYPRESS EVENT

$messageField.keypress(function (e) {
  if (e.keyCode == 13) {
    //FIELD VALUES
    var user = firebase.auth().currentUser;
    var message = $messageField.val();
    console.log(message);
    //SAVE DATA TO FIREBASE AND EMPTY FIELD
    dbChatRoom.push({name:user.displayName, text:message, photoURL: user.photoURL});
    $messageField.val('');
  }
});
//



});
