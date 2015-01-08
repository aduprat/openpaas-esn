'use strict';

var mail = require('./mail');

module.exports = function(dependencies) {

  var lib = {};

  var emailTokenModel = require('../backend/db/models/email-recipient-token');
  var token = require('./token')(lib, dependencies);
  var sender = require('./sender')(lib, dependencies);

  function validateTo(to, callback) {
    if (!to) {
      return callback(new Error('Address is required'));
    }
    return callback(null, true);
  }

  function getUser(from, callback) {
    var userModule = dependencies('user');
    if (!from) {
      return callback(new Error('User is required'));
    }
    return userModule.findByEmail(from, callback);
  }

  function loadMessage(messageId, callback) {
    if (!messageId) {
      return callback(new Error('Message Id is required'));
    }

    var messageModule = dependencies('message');
    return messageModule.get(messageId, callback);
  }

  function canReply(message, user, callback) {

    if (!user) {
      return callback(new Error('User is required'));
    }

    if (!message) {
      return callback(new Error('Message is required'));
    }

    loadMessage(message._id, function(err, m) {
      if (err) {
        return callback(err);
      }

      var messageModule = dependencies('message');
      return messageModule.permission.canReply(m, user, callback);
    });
  }

  function getReplyTo(to, user, callback) {
    if (!to) {
      return callback(new Error('target is required'));
    }

    var targetMessage = to.split('@')[0];
    if (!targetMessage) {
      return callback(new Error('Can not get the replyTo from the target email'));
    }

    token.getToken(targetMessage, function(err, token) {
      if (err) {
        return callback(err);
      }

      if (!token) {
        return callback(new Error('Token not found'));
      }

      if (!token.user.equals(user._id)) {
        return callback(new Error('Invalid user'));
      }

      return callback(null, {
        objectType: token.message.objectType,
        _id: token.message.id
      });
    });
  }

  function parseMessage(stream, author, callback) {
    return mail(dependencies).parse(stream, author, callback);
  }

  function reply(message, inReplyTo, user, callback) {
    var messageModule = dependencies('message');
    var helpersModule = dependencies('helpers');

    var publishCommentActivity = function(parentMessage, childMessage) {
      helpersModule.message.publishCommentActivity(user, inReplyTo, parentMessage, childMessage);
    };

    if (!inReplyTo) {
      return callback(new Error('Missing inReplyTo'));
    }

    var replyMessage = {
      content: message.body.text,
      author: user._id,
      source: 'email',
      attachments: message.attachments
    };

    var comment;
    try {
      comment = messageModule.getInstance('whatsup', replyMessage);
    } catch (e) {
      return callback(e);
    }

    messageModule.addNewComment(comment, inReplyTo, function(err, childMessage, parentMessage) {
      if (err) {
        return callback(err);
      }

      if (message.attachments && message.attachments.length > 0) {
        return messageModule.setAttachmentsReferences(message, function(err) {
          if (err) {
            // warn
          }
          publishCommentActivity(parentMessage, childMessage);
          return callback(null, { _id: childMessage._id, parentId: parentMessage._id});
        });
      } else {
        publishCommentActivity(parentMessage, childMessage);
        return callback(null, {_id: childMessage._id, parentId: parentMessage._id });
      }
    });
  }

  lib.getUser = getUser;
  lib.canReply = canReply;
  lib.parseMessage = parseMessage;
  lib.reply = reply;
  lib.getReplyTo = getReplyTo;
  lib.validateTo = validateTo;
  lib.emailTokenModel = emailTokenModel;
  lib.token = token;
  lib.sender = sender;

  lib.sender.addSenderRule('all', require('./rules/all'));

  return lib;
};