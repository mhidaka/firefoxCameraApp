(function() {
  'use strict';

  // カメラリソース
  var camera;

  // ストレージ
  var storage;

  // DOM
  var previewVideo;
  var captureBtn;

  // Declare a proxy to reference the hub.
  var chat = $.connection.chatHub;
    
  function releaseCamera() {
    console.log('releaseCamera');

    if(camera) {
      camera.release();
    }
  }

  function getCamera() {
    console.log('getCamera');

    // カメラ取得時のオプション
    var options = {
      mode: 'picture',
      recorderProfile: 'jpg',
      previewSize: {
        width: 1280,
        height: 720
      }
    };

    // `getListOfCameras()`は背面カメラ、前面カメラの順に配列が返る
    var type = navigator.mozCameras.getListOfCameras()[0];

    function onSuccess(Blob) {
      // スコープ外に値を保持
      camera = Blob;
      console.log('getCamera:Blob', camera);

      // プレビューの再生
      previewVideo.mozSrcObject = camera;
      previewVideo.play();

      // エフェクトの保存
      effects = camera.capabilities.effects;
    }

    function onError(error) {
      console.warn('getCamera:error', error);
      // カメラ取得失敗時の処理
    }

    // カメラがすでに取得されている場合はリリース
    releaseCamera();
    navigator.mozCameras.getCamera(type, options, onSuccess, onError);
  }

  function captureStart(e) {
    console.log('captureStart', e);
    if(!camera) return;

    function onSuccess(Blob) {
      console.log('autoFocus:success', Blob);
    }

    function onError(error) {
      console.warn('autoFocus:error', error);
    }

    camera.autoFocus(onSuccess, onError);
  }

  function captureEnd(e) {
    console.log('captureEnd', e);
    if(!camera) return;

    var options = {
      pictureSize: camera.capabilities.pictureSizes[0], // 最大サイズ
      fileFormat: 'jpeg'
    };

    function onSuccess(Blob) {
      console.log('takePicture:success', Blob);

      // 画像をストレージへ保存
      var filename = 'fxcam_' + Date.now() + '.jpg';
      var test = storage.addNamed(Blob, filename);

      //alert("画像を保存しました\n" + Blob.size );
     // alert("ここに保存\n" +  storage.storageName);
      
      test.onsuccess = function() {
      alert("Successfully saved " + filename);
      };
      test.onerror = function() {
      alert("Error while saving to " + filename + ": " + this.error.name);
      };
      
      var oMyForm = new FormData();
      oMyForm.append("webmasterfile", Blob);

      var oReq = new XMLHttpRequest();
      oReq.open("POST", "http://board-game.azurewebsites.net/");
      oReq.send(oMyForm);
      
      
      // プレビューの再開
      camera.resumePreview();
    };

    function onError(error) {
      console.log('takePicture:error', error);
      // カメラ取得失敗時の処理
    };

    camera.takePicture(options, onSuccess, onError);
  }

  function onVisibilityChange() {
    console.log('onVisibilityChange', document.hidden);

    if(document.hidden) {
      releaseCamera();
    } else {
      getCamera();
    }
  }


  function init() {

    // Create a function that the hub can call to broadcast messages.
    chat.client.broadcastMessage = function (name, message) {

      // if ( message === 'takeCapure')
      // Html encode display name and message.
      // var encodedName = $('<div />').text(name).html();
      // var encodedMsg = $('<div />').text(message).html();
      // Add the message to the page.
      //$('#discussion').append('<li><strong>' + encodedName
      //                        + '</strong>:&nbsp;&nbsp;' + encodedMsg + '</li>');
    };
    
    // Start the connection.
    $.connection.hub.start().done(function () {
      // $('#sendmessage').click(function () {
        // Call the Send method on the hub.
        // chat.server.send($('#displayname').val(), $('#message').val());
        // Clear text box and reset focus for next comment.
        // $('#message').val('').focus();
      //});
    });




    // ストレージの取得
    //storage = navigator.getDeviceStorage('pictures');
　　  storage =navigator.getDeviceStorage("sdcard");
    
    
    // DOMの取得とイベント処理
    previewVideo = document.getElementById('preview');

    captureBtn = document.getElementById('captureBtn');
    captureBtn.addEventListener('touchstart', captureStart, false);
    captureBtn.addEventListener('touchend', captureEnd, false);

    // カメラの取得
    getCamera();
  }

  window.addEventListener('DOMContentLoaded', init, false);
  window.addEventListener('visibilitychange', onVisibilityChange, false);
  window.addEventListener('unload', releaseCamera, false);
})();
