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
    scrollToBottom();
    console.log($('#messages').height());
  });
  //Alert a user has disconnected
  socket.on('userLeave', (msg)=>{
    $('#messages').append($('<li>').text(msg));
  });

  socket.on('typing', (msg, typingUsers)=>{
    if(typingUsers.includes(userName)){
      determineIsTypingOutput(socket, typingUsers);
    }else{
      $('#typing').removeClass('hidden');
      $('#typing').find('.typingNotification').text(msg);
    }
    $('#messages').height($('#messages').height() - 50);
    scrollToBottom();
  });
  socket.on('doneTyping', (userName)=>{
    $('#typing').addClass('hidden');
    $('#typing').find('.typingNotification').text('');
    $('#messages').height($('#messages').height() + 50);
    scrollToBottom();
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
    }else if($('#m').val() === ''){
      socket.emit('doneTyping', userName);
      typing = false;
    }
  });
/****************************HELPER FUNCTIONS********************************/
function determineIsTypingOutput(socket, typingUsers){
  let output = '';
  //Singular case
  if(typingUsers.length === 2 && typingUsers[0] !== userName){
    output = `${typingUsers[0]} is typing...`;
  }else if(typingUsers.length === 2 && typingUsers[0] === userName){
    output = `${typingUsers[1]} is typing...`;
  }
  //Plural case
  if(typingUsers.length > 2 && typingUsers[0] !== userName){
    output = typingUsers[0];
    for(i = 1; i < typingUsers.length; i ++){
      if(typingUsers[i] !== userName){
        output += `, ${typingUsers[i]}`;
      }
    }
    output += ' are typing...';
  }else if(typingUsers.length > 2 && typingUsers[0] === userName){
    output = typingUsers[1];
    for(i = 2; i < typingUsers.length; i ++){
      output += `, ${typingUsers[i]}`;
    }
      output += ' are typing...';
  }

  if(output !== ''){
    $('#typing').removeClass('hidden');
    $('#typing').find('.typingNotification').text(output);
  }
}

function scrollToBottom() {
  const messages = document.getElementById('messages');
  messages.scrollTop = messages.scrollHeight;
  console.log(`scrollTop: ${messages.scrollTop}\nscrollHeight: ${messages.scrollHeight}`);
}



});
