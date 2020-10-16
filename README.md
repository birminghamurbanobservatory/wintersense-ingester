# wintersense-ingester

Pulls Wintersense data from their API. Intended to be run as a CronJob.

Uses a database keep a record of the latest observation pulled from each Wintersensor. This prevents us from getting the same observations multiple times.


## Documentation

[Wintersense API Docs](https://docs.wintersense.com/api/v1)
