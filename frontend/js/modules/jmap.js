/*global JMAP */

'use strict';

angular.module('esn.jmap-js', ['esn.overture'])
  .service('jmap', function(overture) {

    function login(username, accessToken, jmapServerUrl) {
      JMAP.auth.didAuthenticate(username, '', {
        apiUrl: jmapServerUrl + '/jmap/' + accessToken,
        eventSourceUrl: jmapServerUrl + '/events/' + accessToken,
        uploadUrl: jmapServerUrl + '/upload/' + accessToken,
        downloadUrl: jmapServerUrl + '/raw/' + accessToken + '/{blobId}/{name}'
      });
    }

    function listMailboxes(contentChangedCallback) {
      var observableMailboxes = overture.createObservableArray(
        JMAP.store.getQuery('allMailboxes', overture.O.LiveQuery, {
          Type: JMAP.Mailbox
        }),
        contentChangedCallback
      );
      JMAP.store.on(JMAP.Mailbox, observableMailboxes, 'contentDidChange');
    }

    return {
      login: login,
      listMailboxes: listMailboxes
    };
  });