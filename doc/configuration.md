# Configuration

An OpenPaaS instance has two types of configuration:

- Local: Defines the local properties of the instance
- Global: Defines the configuration which is shared between on all the OpenPaaS instances

An OpenPaaS CLI is available to ease the configuration. Check the documentation at [cli.md](./cli.md).

## Local Configuration

Local configuration of the application is available in the ./config/default.json file.

### Authentication

    "auth": {
      "strategies": ["local", "mongo", "bearer"]
    }

Array containing the authentication strategies to be loaded by the application. The application will go through all the authentication strategies until a valid one is found for the current HTTP request.
Possible values are:

- local: Local configuration is defined in ./config/users.json file.
- mongo: Uses the User collection in mongodb.
- ldap: Connect to a LDAP server defined in the global configuration parameter (cf below)
- bearer: OAuth2 authentication mechanism (cf [REST API](REST.md) for more details)

## Global Configuration

The configuration of the ESN is stored in MongoDB under the configuration collection in order to be distributed over nodes.

### Mail

    {
      "_id": "mail",
      "mail": {
        "noreply": "noreply@open-paas.org",
        "reply": {
          "domain": "open-paas.org",
          "name": "OpenPaaS Bot"
        }
      },
      "transport": {
        "module": "nodemailer-browser",
        "config": {
          "dir": "/tmp",
          "browser": true
        }
      },
      "resolvers": {
        "whatsup": {
          "active": true,
          "options": {
            "foo": "bar"
          }
        },
        "all": {
          "active": false
        }
      }
    }

#### Mail

The *mail* section contains the list of useful emails of the platform.

#### Transport

The *transport* section is used to configure the mail transport ie what to use to effectively send the mail to the mail provider.
nodemailer is used to send emails, the config section follows the same format.

- module: You can specify a npm module to be used as transport (if you do not specify module it will use the smtp transport)
- config: The transport configuration forward to the transport module

#### Resolvers

Configure the email messaging resolvers to be used when new messages are added in an activity stream.
For example `{"whatsup": {"active": true}}` will send an email to everybody in the collaboration when a new whatsup is posted.

#### Config example

Basic dev config to save mail in `/tmp` and open it with your default browser.

    {
      "_id": "mail",
      "mail": {
        "noreply": "noreply@open-paas.org"
      },
      "transport": {
        "module": "nodemailer-browser",
        "config": {
          "dir": "/tmp",
          "browser": true
        }
      }
    }

Basic smtp configuration. Replace the host config by your smtp server.

    {
      "_id": "mail",
      "mail": {
        "noreply": "noreply@open-paas.org"
      },
      "transport": {
        "config" : {
          "host" : "smtp.example.com",
          "secure" : false,
          "tls": {
            "rejectUnauthorized": false
          },
          "port" : 25,
          "auth" : {
            "user" : "",
            "pass" : ""
          }
        }
      }
    }

Basic smtp configuration using Google smtp using a Gmail account.

    {
      "_id" : "mail",
      "mail" : {
        "noreply" : "noreply@open-paas.org"
      },
      "transport" : {
        "config" : {
          "service" : "gmail",
          "auth" : {
            "user" : "",
            "pass" : ""
          }
        }
      }
    }

### Session

The ESN session attributes can be configured like:

    {
      "_id": "session",
      "remember": 2592000000,
      "secret": "This is the super secret secret"
    }

- remember: The persistent cookie lifetime
- secret: The secret used to crypt cookies

### Redis

Defines the Redis configuration using the standard Redis options defined in the [redis node client](https://github.com/mranney/node_redis#rediscreateclientport-host-options):

    {
      "_id": "redis",
      "host": "localhost",
      "port": 6379
    }

### CalDAV

Defines the CalDAV server configuration:

    {
      "_id": "davserver",
      "backend": {
        "url": "http://localhost:80"
      },
      "frontend": {
        "url": "http://localhost:80"
      }
    }

- backend.url: URL use by the ESN to send request to the CalDAV server
- frontend.url: URL use by the browser (client) to send request to the CalDAV server

### Web

Defines the general Web settings for the ESN deployment.

    {
      "_id": "web",
      "proxy": {
        "trust": true
      },
      "base_url": "http://localhost"
    }

- proxy: Activate or not the expressjs 'trust proxy' flag (application.enable('trust proxy')).
- base_url: Defines the baseURL of the application. This parameter is optional and is used to define the public URL of the application.

***base_url* may be used when the ESN is deployed behind a proxy/load balancer. This setting helps to build several URLs in the application.

### JWT

Defines the algorithm, public-key and private-key that will be used to encode/decode json web tokens in the ESN instances.

    {
      "_id": "jwt",
      "algorithm": "RS256",
      "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtlChO/nlVP27MpdkG0Bh\n16XrMRf6M4NeyGa7j5+1UKm42IKUf3lM28oe82MqIIRyvskPc11NuzSor8HmvH8H\nlhDs5DyJtx2qp35AT0zCqfwlaDnlDc/QDlZv1CoRZGpQk1Inyh6SbZwYpxxwh0fi\n+d/4RpE3LBVo8wgOaXPylOlHxsDizfkL8QwXItyakBfMO6jWQRrj7/9WDhGf4Hi+\nGQur1tPGZDl9mvCoRHjFrD5M/yypIPlfMGWFVEvV5jClNMLAQ9bYFuOc7H1fEWw6\nU1LZUUbJW9/CH45YXz82CYqkrfbnQxqRb2iVbVjs/sHopHd1NTiCfUtwvcYJiBVj\nkwIDAQAB\n-----END PUBLIC KEY-----",
      "privateKey": "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEAtlChO/nlVP27MpdkG0Bh16XrMRf6M4NeyGa7j5+1UKm42IKU\nf3lM28oe82MqIIRyvskPc11NuzSor8HmvH8HlhDs5DyJtx2qp35AT0zCqfwlaDnl\nDc/QDlZv1CoRZGpQk1Inyh6SbZwYpxxwh0fi+d/4RpE3LBVo8wgOaXPylOlHxsDi\nzfkL8QwXItyakBfMO6jWQRrj7/9WDhGf4Hi+GQur1tPGZDl9mvCoRHjFrD5M/yyp\nIPlfMGWFVEvV5jClNMLAQ9bYFuOc7H1fEWw6U1LZUUbJW9/CH45YXz82CYqkrfbn\nQxqRb2iVbVjs/sHopHd1NTiCfUtwvcYJiBVjkwIDAQABAoIBAAkhTJHGV/fDpSZJ\ncpfyx3OXOYoB22PNBmgezPHKW7goZ7tf/rPLjU/MdXRW2Ps75ssrInzyhTwEzRXQ\nLg/uhKC9RD/B0Fu9PpiYt/vAqlb865qmm5PvfknZhkwntytCL7rQ+HEkysx2br2f\nrPr5XKKK1tIh35NzlwfktWQOjG1sk5vfHc/fyUrWE6KoZgIrW0Rmc8c7YRMwljYT\nUGQAL2LBDGsocFV92AsMCLcCmI/gF0J2g5880htcj+TzsdCHAPviB8Z262mFlmLB\nrPWlUwWLmqdyr9YoLXszZ+iERCglPK8kn14wxcrNWrxLlHU9b2HXRIR9MwlyjLDK\nLc8lgHECgYEA6C3nJfGqmj2Y7fLxZOcTwuP5UvprwbvHaoeU8brPjrt+Wp4MgznG\nIJLtd7twJQhMh4NPQSqZhQxDb+Pa8S5prLH2lvEa9+sNXeh/z5FD0NG1zsNGJ+Am\nB+7xM5LlpinDh+NlCLHiWOg/YcQtqfIvNFwDdt9LGE37dxOpSF9jxIcCgYEAyQUP\nRXECEWYfMd2z7spzJ3hP3o/qPA5WE0EaXMRtLAQg9cnLM7odcT37uFT7joHijPe/\nml7cjJf9oyCZjN8GqGmaHH4MYe5LQVQrwmkMH6Y5pvFta5i9p9SA0h98TEr/rThL\nKRKwz+ItSz6YP7WINBsBdbJNjJxj7su9s8udN5UCgYAdARb+I3l3eThwiUfkngVW\n9FnCJuxtMEMSKMvPgtHI990p/tJ7Vi1NBm3J5k11IttEln/BGUxCVaza/nDsbirf\nWv/+DTKcQ+3QjGnjCTeaj4gRw00xUAwQM6ZIFhLANjlp8Vs+wdIP3zuDwBkgQNPq\ny4/XOr/L0noWfwtHsjrpYwKBgQC8RnblLVEohqOVCvdqIkf0oeT8qYJTuYG5CvLs\nDDXMUhmk29nsmtbUp59KKJ5r/Q75xVm59jtPm1O+I9xtar5LoozrPsvONWhaycEq\nl0T5p7C7wcggTLDlrkzxgPfkZSJPVThgQddE/aw6m2fx0868LscRO20S069ti3ok\nGgMoeQKBgQCnKB+IPX+tnUqkGeaLuZbIHBIAMxgkbv6s6R/Ue7wbGt/tcRXhrc4x\nQDSXlF8GxlJW0Lnmorz/ZRm6ajf1EpajEBh97cj4bnwWFiKe+Vsivkp72wPb9qSl\ninNz0WXJtOTrDLhu55P0mDjArCCYNi69WTq9jTo18v4DI0zzfUUaaQ==\n-----END RSA PRIVATE KEY-----"
    }

### JMAP API server

Tell to the ESN instances where is the JMAP API that will be used by the UnifiedInbox module

    {
      "_id": "jmap",
      "api": "https://jmap-server/jmap/",
      "downloadUrl": "https://jmap-server/download",
      "uploadUrl": "https://jmap-server/jmap/upload",
      "isJmapSendingEnabled": false,
      "maxSizeUpload": 20971520
    }

Set `isJmapSendingEnabled` to `true` to use JMAP to send email, if not, it will
Set `isSaveDraftBeforeSendingEnabled` to `false` to not save a draft before sending an email
use the default mailer of ESN.
The `downloadUrl` property defines the URL used to download attachments.
The `uploadUrl` property defines the URL used to upload attachments.
The `maxSizeUpload` property defines the maximum size for a single file upload.
