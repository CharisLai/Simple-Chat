$(function () {
    const socket = io()
    const $sendMessage = $('#send-message')
    const $setName = $('#setName')

    const $inputName = $('#inputName')
    const $inputMessage = $('#message')
    const $chat = $('#chat')
    const $contentPage = $('#contentPage')
    const $exitButton = $('#exitButton');

    $setName.submit((e) => {
        console.log($inputName.val())

        e.preventDefault()
        socket.emit('new user', $inputName.val())

        $inputName.val('')

        $('#login').hide()
        $contentPage.show()

        $('#login').off('click')

    })



    $sendMessage.submit((e) => {
        e.preventDefault()
        socket.emit('send message', $inputMessage.val().trim())
        $inputMessage.val('')

    })

    $('#message').on('input', () => {
        socket.emit('typing');
    })

    $('#message').on('blur', () => {
        socket.emit('stop typing');
    })

    socket.on('typing', (data) => {
        $('#typing-indicator').text(`${data.username} 正在輸入訊息...`);
    })
    socket.on('stop typing', () => {
        $('#typing-indicator').text('');
    })
    // 已經被使用的名稱 提示
    socket.on('username taken', () => {
        alert('這名稱已經被使用，請嘗試其他名稱')
        window.location.href = '/'
    })

    socket.on('chat', (server, msg) => {

        let now = new Date();
        let datetime = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate();
        datetime += ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

        $chat.append("<br /><b> Note: " + msg + "</b> (" +
            datetime + ")<br/>")
    })

    socket.on('new message', (data) => {
        var msg = data.msg
        var name = data.nick

        var now = new Date()
        var datetime = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate();
        datetime += ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

        $chat.append("<b>" + name + " </b>: " + msg + " (<i>" + datetime + "<i>)<br />");
    })

    socket.on('disconnect', () => {
        // 處理斷線事件，顯示斷線提示
        alert('您已經斷線了！ 即將返回登入頁')
        window.location.href = '/'
    })
    //監聽強制退出事件
    socket.on('force logout', () => {
        // 強制退出操作
        window.location.href = '/';
    })


    $exitButton.click(() => {
        socket.emit('force logout'); // 觸發強制退出事件
        window.location.href = '/'; // 返回登入頁
    });

    // 監聽是否需要顯示退出按鈕
    socket.on('show exit button', () => {
        $exitButton.show();
    });


})





