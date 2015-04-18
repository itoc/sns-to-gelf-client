SNS to GELF Client
================

This program will run as a simple HTTP server allowing SNS to push messages into Graylog via the standardised GELF format

#### To install / run locally:

```bash
npm install
```

#### To run on beanstalk:
- Zip up package.json and any required files
- Upload ZIP to beanstalk and it will be deployed!
- Be sure to set configuration options as environment variables in beanstalk, you will need to run direct as a service and not proxy-pass via Nginx.

#### To use:
Setup SNS to point to the HTTP URL of your service, the service will auto-confirm any new SNS registration topics!

#### Configuration options (passed as environment variables):

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

#### Installing as a service (not required if running via Beanstalk):

```bash
mkdir -p /opt && cd /opt
git clone https://git.itoc.com.au/itoc_internal/sns-to-gelf-graylog-client.git

npm install

cp additional/itoc-sns-gelf-client.initd /etc/init.d/itoc-sns-gelf-client
chmod +x /etc/init.d/itoc-sns-gelf-client
chkconfig --add itoc-sns-gelf-client

npm install forever -g
mkdir -p /var/run/forever && chmod 777 /var/run/forever
```

Be sure to set any changes to your environment in set_env.sh located in the 'additional' directory.

#### Useful information:

- Will parse any JSON objects received in the SNS messages as Graylog fields.
    - When parsing JSON object, if the object contains: 'Event_Message' this will be defaulted as the 'message' field in Graylog... If you want to set a custom message you need to include 'Event_Message' in your JSON object.
- Currently does not support proxy passing via server such as Nginx.

