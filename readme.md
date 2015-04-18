SNS to GELF Client
================

This program will run as a simple HTTP server allowing SNS to push messages into Graylog via the standardised GELF format

##### To install / run locally:

```bash
npm install
```

##### To run on beanstalk:
- Zip up package.json and any required files
- Upload ZIP to beanstalk and it will be deployed!

##### To use:
Setup SNS to point to the HTTP URL of your service, the service will auto-confirm any new SNS registration topics!

##### Configuration options (passed as environment variables):

```javascript
// Configuration Options / Environment Variables:
//
//      HTTP_LISTEN_PORT    (Integer, port to run webserver on, defaults to 9000)
//      CONSOLE_DEBUG       (String, true/false - provides verbose debugging)
//      GELF_SERVER         (String, provide hostname or IP)
//      GELF_SERVER_PORT    (Integer, defaults to: 12201)
//      GELF_CHUNK_SIZE     (Integer, defaults to: 1420)
//      GELF_TRANSPORT_TYPE (String, either 'wan' or 'lan', defaults to 'wan')
```