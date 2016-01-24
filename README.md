# Live Logs [![](https://img.shields.io/npm/v/live-logs.png)](https://www.npmjs.com/package/live-logs)
> Display live traffic on a map.

![](https://cloudup.com/iso9-SCOvCD+)

## Install

```
npm install -g live-logs
```

## Usage

```
  Usage: live-logs [options]

  Display live traffic on a map.

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -s, --host <host>          hostname or IP address
    -u, --username <username>  ssh username
    -k, --key <key>            private key path
    -l, --log <log>            access log path on server
    -r, --regex [regex]        regex for matching the IP address
```

## Example

```
live-logs -s 123.123.123.123 -u root -k ~/.ssh/key -l /var/log/site.access.log
```
    
## License

MIT