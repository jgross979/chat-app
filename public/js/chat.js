$(function(){
  const socket = io();
  let id;
  let userName;
  let typing = false;

  /**************************FORM SUBMISSIONS*********************************/
  $('.setUserName').submit(function(e){
    //prevents page reloading
    e.preventDefault();

    userName = $('#username').val();
    $('#username').val('');

    //emit event to server
    socket.emit('welcome', `${userName} has joined the chat!`, userName);

    $('#setUserName_Box').hide();
    return false;
  })

  $('.sendMessage').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', userName + ": " +$('#m').val());
    socket.emit('doneTyping', userName);
    $('#m').val('');
    return false;
  });
  /**************************CHAT*********************************/
  //Add welcome alert for new members
  socket.on('welcome', (msg)=>{
    $('#messages').append($('<li>').text(msg));
  });
  //Adds new chat messages
  socket.on('chat message', (msg)=>{
    $('#messages').append($('<li>').text(msg));
  });
  //Alert a user has disconnected
  socket.on('userLeave', (msg)=>{
    $('#messages').append($('<li>').text(msg));
  });
  socket.on('typing', (msg)=>{
    $('#typing').removeClass('hidden');
    $('#typing').find('.typingNotification').text(msg);
  });
  socket.on('doneTyping', (userName)=>{
    $('#typing').addClass('hidden');
    $('#typing').find('.typingNotification').text('');
  });

  /******************SIDE BAR**********************************/
  socket.on('userList', (userList)=>{
    $('.userList').html('');
    userList.forEach((user)=>{
      $('.userList').append($('<li>').text(user));
    })
  });

  /**************************CALLS FROM SERVER*********************************/
  socket.on('getName', ()=>{
    socket.emit('name', userName);
  });

  /**************************CALLS TO SERVER*********************************/

  /****************************CLIENT-SIDE EVENTS*******************************/
  $('#m').on('input', (e)=>{
    if(typing === false && $('#m').val() !== ''){
      socket.emit('typing', userName);
      typing = true;
    }else if(typing === true && $('#m').val() === ''){
      socket.emit('doneTyping', userName);
      typing = false;
    }
  });

});
